/**
 * pnpm verify:permissions (no server needed).
 * Verifies the PERMISSIONS registry, locked keys, role defaults, and nav gating.
 */
import {
  DEFAULT_ROLE_PERMISSIONS,
  LOCKED_PERMISSIONS,
  MAX_TAB_SECTIONS,
  PERMISSIONS,
  PERMISSION_KEYS,
  can,
  canAny,
  homeHref,
  isLockedPermission,
  navItems,
  phoneNav,
} from "../packages/shared/src";
import { assert, done, test } from "./check";

async function main() {
  await test("every permission key is resource.action and carries a description", () => {
    for (const key of PERMISSION_KEYS) {
      assert.match(key, /^[a-z_]+\.[a-z_]+$/, key);
      assert.ok(PERMISSIONS[key].description.length > 0, key);
    }
  });

  await test("locked permissions are held by admin and never by learner", () => {
    assert.deepEqual([...LOCKED_PERMISSIONS].sort(), ["curriculum.manage", "users.manage"]);
    for (const key of LOCKED_PERMISSIONS) {
      assert.equal(isLockedPermission(key), true);
      assert.equal(can(DEFAULT_ROLE_PERMISSIONS.admin, key), true);
      assert.equal(can(DEFAULT_ROLE_PERMISSIONS.learner, key), false);
    }
  });

  await test("can and canAny accept Set and array inputs", () => {
    assert.equal(can(new Set(["loop.run"]), "loop.run"), true);
    assert.equal(can(["loop.run"], "curriculum.manage"), false);
    assert.equal(canAny(["steps.progress"], "curriculum.manage", "steps.progress"), true);
  });

  await test("phoneNav splits navItems into at most 4 bar tabs + overflow", () => {
    for (const set of [DEFAULT_ROLE_PERMISSIONS.learner, DEFAULT_ROLE_PERMISSIONS.admin, []]) {
      const { tabs, overflow } = phoneNav(set);
      assert.deepEqual([...tabs, ...overflow], navItems(set));
      assert.ok(tabs.length <= MAX_TAB_SECTIONS);
    }
    assert.equal(homeHref(DEFAULT_ROLE_PERMISSIONS.learner), "/home");
    assert.equal(homeHref([]), "/unauthorized");
  });

  done("verify:permissions");
}

void main();
