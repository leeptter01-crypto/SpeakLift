export const PHASES = ["learn", "listen", "speak"];
export const REVIEW_DAYS = [1, 3, 7, 14];

export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function daysAfter(key, days) {
  const [year, month, day] = key.split("-").map(Number);
  return dateKey(new Date(year, month - 1, day + days, 12));
}

export function normalizeLearning(saved = {}, legacyIds = [], today = dateKey()) {
  const learning = {
    version: 1,
    goal: [3, 5, 8].includes(saved.goal) ? saved.goal : 3,
    records: { ...(saved.records || {}) },
    daily: { ...(saved.daily || {}) },
    cursor: saved.cursor || null,
  };
  if (!saved.version) {
    for (const id of legacyIds) {
      learning.records[id] ||= {
        learn: true, listen: true, speak: true, legacy: true,
        completedAt: today, due: today, reviewStep: 0,
      };
    }
  }
  return learning;
}

export function recordFor(learning, id) {
  return learning.records[id] ||= {
    learn: false, listen: false, speak: false, deferred: false,
    bestListening: 0, bestSpeaking: 0, reviewStep: 0, due: null,
  };
}

export function nextPhase(record) {
  return PHASES.find(phase => !record?.[phase]) || "speak";
}

export function passListening(learning, id, score) {
  const record = recordFor(learning, id);
  record.bestListening = Math.max(record.bestListening || 0, score);
  if (score < 95 || !record.learn) return false;
  record.listen = true;
  return true;
}

export function passSpeaking(learning, id, score, today = dateKey()) {
  const record = recordFor(learning, id);
  record.bestSpeaking = Math.max(record.bestSpeaking || 0, score);
  if (score < 95 || !record.learn || !record.listen) return false;
  const wasCompleted = Boolean(record.completedAt);
  record.speak = true;
  record.deferred = false;
  record.completedAt ||= today;
  // Repeating a passed sentence on the same day does not advance its review interval.
  if (record.reviewedOn !== today) {
    const step = wasCompleted ? Math.min((record.reviewStep || 0) + 1, REVIEW_DAYS.length - 1) : 0;
    record.reviewStep = step;
    record.due = daysAfter(today, REVIEW_DAYS[step]);
    record.reviewedOn = today;
  } else if (!record.due || record.due <= today) {
    record.due = daysAfter(today, 1);
  }
  const daily = learning.daily[today] ||= [];
  if (!daily.includes(id)) daily.push(id);
  return true;
}

export function deferLesson(learning, id, today = dateKey()) {
  const record = recordFor(learning, id);
  record.deferred = true;
  record.due = today;
  record.reviewStep = 0;
}

export function dueIds(learning, queue = [], today = dateKey()) {
  return [...new Set([
    ...queue.map(item => item.id),
    ...Object.entries(learning.records).filter(([, record]) => record.due && record.due <= today).map(([id]) => id),
  ])];
}

export function isUnlocked(ids, index, learning) {
  if (index < 0 || index >= ids.length) return false;
  return ids.slice(0, index).every(id => {
    const record = learning.records[id];
    return record?.speak || record?.deferred;
  });
}

export function streakDays(daily, today = dateKey()) {
  let key = daily[today]?.length ? today : daysAfter(today, -1);
  let count = 0;
  while (daily[key]?.length) {
    count += 1;
    key = daysAfter(key, -1);
  }
  return count;
}
