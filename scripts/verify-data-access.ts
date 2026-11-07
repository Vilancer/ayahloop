/**
 * pnpm verify:data-access (no server needed).
 * Verifies createApiClient bearer refresh, 403 permission callback, error parsing, and queryKeys.
 */
import { z } from "zod";
import {
  ApiClientError,
  createApiClient,
  isPermissionError,
  queryKeys,
} from "../packages/data-access/src";
import { assert, done, test } from "./check";

async function main() {
  await test("refreshes bearer token once on 401 and retries", async () => {
    let calls = 0;
    const client = createApiClient({
      baseUrl: "https://api.ayahloop.test",
      getAccessToken: () => "expired-token",
      refreshAccessToken: async () => "fresh-token",
      fetchImpl: (async (_url: RequestInfo | URL, init?: RequestInit) => {
        calls += 1;
        const auth = (init?.headers as Record<string, string>)?.Authorization;
        if (auth === "Bearer expired-token") {
          return new Response(
            JSON.stringify({ error: { code: "unauthenticated", message: "Expired" } }),
            { status: 401 },
          );
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }) as typeof fetch,
    });

    const res = await client.request({
      path: "/api/me",
      schema: z.object({ ok: z.boolean() }),
    });
    assert.deepEqual(res, { ok: true });
    assert.equal(calls, 2);
  });

  await test("triggers onForbidden and marks error as permission error on 403", async () => {
    let forbiddenCount = 0;
    const client = createApiClient({
      baseUrl: "https://api.ayahloop.test",
      onForbidden: () => {
        forbiddenCount += 1;
      },
      fetchImpl: (async () =>
        new Response(
          JSON.stringify({
            error: { code: "forbidden", message: "missing permission: curriculum.manage" },
          }),
          { status: 403 },
        )) as typeof fetch,
    });

    let caught: unknown = null;
    try {
      await client.request({
        path: "/api/curriculum",
        schema: z.object({ ok: z.boolean() }),
      });
    } catch (e) {
      caught = e;
    }

    assert.equal(forbiddenCount, 1);
    assert.equal(isPermissionError(caught), true);
    assert.ok(caught instanceof ApiClientError);
  });

  await test("queryKeys factory produces deterministic keys", () => {
    assert.deepEqual(queryKeys.me, ["ayahloop", "me"]);
    assert.deepEqual(queryKeys.part("p1"), ["ayahloop", "part", "p1"]);
  });

  done("verify:data-access");
}

void main();
