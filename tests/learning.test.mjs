import test from "node:test";
import assert from "node:assert/strict";
import { normalizeLearning, recordFor, nextPhase, passListening, passSpeaking, deferLesson, dueIds, isUnlocked, streakDays, daysAfter, dateKey } from "../dist/learning.mjs";

test("listening cannot count as speaking; prerequisites and 95 threshold apply", () => {
  const learning = normalizeLearning();
  assert.equal(passSpeaking(learning, "a", 100), false);
  const record = recordFor(learning, "a");
  assert.equal(passListening(learning, "a", 100), false);
  record.learn = true;
  assert.equal(passListening(learning, "a", 94), false);
  assert.equal(passListening(learning, "a", 95), true);
  assert.equal(record.speak, false);
  assert.equal(nextPhase(record), "speak");
  assert.deepEqual(learning.daily, {});
  assert.equal(passSpeaking(learning, "a", 94), false);
  assert.equal(passSpeaking(learning, "a", 95, "2026-10-15"), true);
  assert.deepEqual(learning.daily["2026-10-15"], ["a"]);
});

test("review scheduling is idempotent within a day and expands after later reviews", () => {
  const learning = normalizeLearning();
  Object.assign(recordFor(learning, "a"), { learn: true, listen: true });
  passSpeaking(learning, "a", 100, "2026-10-15");
  passSpeaking(learning, "a", 100, "2026-10-15");
  assert.equal(learning.records.a.due, "2026-10-16");
  assert.equal(learning.daily["2026-10-15"].length, 1);
  passSpeaking(learning, "a", 100, "2026-10-16");
  assert.equal(learning.records.a.due, "2026-10-19");
  passSpeaking(learning, "a", 100, "2026-10-19");
  assert.equal(learning.records.a.due, "2026-10-26");
  passSpeaking(learning, "a", 100, "2026-10-26");
  assert.equal(learning.records.a.due, "2026-11-09");
});

test("deferred lessons unlock the next item without counting as passed", () => {
  const learning = normalizeLearning();
  assert.equal(isUnlocked(["a", "b"], 1, learning), false);
  deferLesson(learning, "a", "2026-10-15");
  assert.equal(isUnlocked(["a", "b"], 1, learning), true);
  assert.equal(learning.records.a.speak, false);
  assert.deepEqual(learning.daily, {});
  assert.deepEqual(dueIds(learning, [{ id: "a" }, { id: "b" }], "2026-10-15"), ["a", "b"]);
});

test("migration retains old completions, but does not fabricate today's achievements", () => {
  const learning = normalizeLearning({}, ["hello-en"], "2026-10-15");
  assert.equal(learning.records["hello-en"].legacy, true);
  assert.equal(learning.records["hello-en"].speak, true);
  assert.deepEqual(dueIds(learning, [], "2026-10-15"), ["hello-en"]);
  assert.deepEqual(learning.daily, {});
  assert.deepEqual(normalizeLearning(learning, ["other"]), learning);
});

test("local dates cross months and yesterday's streak survives before today's practice", () => {
  assert.equal(dateKey(new Date(2026, 9, 15, 0, 5)), "2026-10-15");
  assert.equal(daysAfter("2026-12-31", 1), "2027-01-01");
  assert.equal(streakDays({ "2026-10-14": ["a"], "2026-10-13": ["b"] }, "2026-10-15"), 2);
  assert.equal(streakDays({ "2026-10-13": ["b"] }, "2026-10-15"), 0);
});
