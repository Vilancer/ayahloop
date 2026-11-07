/**
 * pnpm verify:transitions (no server needed).
 * Verifies the STEP_TRANSITIONS state machine and transition edges.
 */
import {
  LEARNING_STEP_STATUSES,
  STEP_TRANSITIONS,
  STEP_TRANSITION_EDGES,
  canTransitionStep,
} from "../packages/shared/src";
import { assert, done, test } from "./check";

async function main() {
  await test("every learning_step_status has an entry in STEP_TRANSITIONS", () => {
    for (const status of LEARNING_STEP_STATUSES) {
      assert.ok(status in STEP_TRANSITIONS, status);
    }
  });

  await test("STEP_TRANSITION_EDGES matches STEP_TRANSITIONS", () => {
    for (const edge of STEP_TRANSITION_EDGES) {
      assert.equal(canTransitionStep(edge.from, edge.to), true, `${edge.from} -> ${edge.to}`);
    }
    assert.equal(canTransitionStep("locked", "completed"), false);
    assert.equal(canTransitionStep("available", "completed"), false);
  });

  done("verify:transitions");
}

void main();
