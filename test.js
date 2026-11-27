// node test.js  – checks every puzzle + the game logic + the Monday schedule. No packages needed.
const fs = require("fs"), assert = require("assert");
const html = fs.readFileSync(__dirname + "/index.html", "utf8");
const cfg = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const logic = html.match(/\/\/ === LOGIC START ===([\s\S]*?)\/\/ === LOGIC END ===/)[1];
const api = new Function(cfg + logic + ";return {SETTINGS,PUZZLES,validatePuzzle,initialOrder,judgeGuess,cleanWord,hashStr,weekInfo,puzzleIndexForWeek};")();
const { SETTINGS, PUZZLES, validatePuzzle, initialOrder, judgeGuess, weekInfo, puzzleIndexForWeek } = api;
let failures = 0;
const ok = (cond, msg) => { if (!cond){ failures++; console.log("  ✗ " + msg); } };

assert(PUZZLES.length >= 26, "need 26+ puzzles, have " + PUZZLES.length);
const start = Date.UTC(2026, 10, 30);
PUZZLES.forEach((p, i) => {
  const v = validatePuzzle(p);
  const date = new Date(start + i * 7 * 86400000).toISOString().slice(0, 10);
  console.log(`week ${String(i).padStart(2)}  ${date}  ${v.ok ? "✓" : "✗"}  ${p.title}`);
  if (!v.ok){ v.errors.forEach(e => ok(false, e.replace(/<[^>]+>/g, ""))); return; }
  ok(v.groups.length === 4, "4 groups");
  const all = v.groups.flatMap(g => g.keys);
  ok(all.length === 16 && new Set(all).size === 16, "16 unique words");
  ok(typeof p.winMessage === "string" && p.winMessage.trim().length > 0, `${p.title}: needs a winMessage`);
  v.groups.forEach(g => { ok(g.name.length > 0, "group name"); g.keys.forEach(k => { ok(k.length <= 15, `${p.title}: "${k}" is long (${k.length})`); k.split(" ").forEach(t => ok(t.length <= 11, `${p.title}: "${t}" is a long single word (${t.length}) – may be tiny on phones`)); }); });
  // starting order: all 16, deterministic, no row is a whole group
  const o1 = initialOrder(v, 12345 + i), o2 = initialOrder(v, 12345 + i);
  ok(JSON.stringify(o1) === JSON.stringify(o2), "deterministic order");
  ok(o1.length === 16 && new Set(o1).size === 16, "order has all 16");
  for (let r = 0; r < 4; r++){ const s = o1.slice(r * 4, r * 4 + 4); ok(!v.groups.some(g => g.keys.every(k => s.includes(k))), `${p.title}: row ${r} is a whole group`); }
  // judging
  v.groups.forEach((g, gi) => {
    ok(judgeGuess(v, g.words, []).type === "correct" && judgeGuess(v, g.words, []).group === gi, "correct group " + gi);
    ok(judgeGuess(v, g.words.map(w => " " + w.toLowerCase() + " "), []).group === gi, "case/space insensitive");
    const other = v.groups[(gi + 1) % 4];
    ok(judgeGuess(v, [...g.words.slice(0, 3), other.words[0]], []).type === "oneaway", "one away");
    ok(judgeGuess(v, [...g.words.slice(0, 2), ...other.words.slice(0, 2)], []).type === "wrong", "wrong 2+2");
    ok(judgeGuess(v, g.words.slice(0, 3), []).type === "invalid", "3 words invalid");
  });
  ok(judgeGuess(v, v.groups[0].words, [0]).type !== "correct", "solved group can't be re-solved");
});

console.log("\nvalidation checks");
const good = { title: "t", groups: [0, 1, 2, 3].map(i => ({ name: "g" + i, words: [1, 2, 3, 4].map(j => `w${i}${j}`) })) };
assert(validatePuzzle(good).ok);
const clone = () => JSON.parse(JSON.stringify(good));
let b = clone(); b.groups.pop(); let r = validatePuzzle(b); assert(!r.ok && /needs exactly <b>4/.test(r.errors.join()));
b = clone(); b.groups[1].words.push("extra"); r = validatePuzzle(b); assert(!r.ok && /has <b>5<\/b> words/.test(r.errors.join()));
b = clone(); b.groups[2].words[0] = "W01"; r = validatePuzzle(b); assert(!r.ok && /more than once \(groups 1 and 3\)/.test(r.errors.join()));
b = clone(); b.groups[0].words[1] = " w01 "; r = validatePuzzle(b); assert(!r.ok && /more than once in Group 1/.test(r.errors.join()));
b = clone(); b.groups[3].words[3] = ""; r = validatePuzzle(b); assert(!r.ok && /empty word/.test(r.errors.join()));
b = clone(); delete b.groups; r = validatePuzzle(b); assert(!r.ok && /groups/.test(r.errors.join()));
b = clone(); b.groups[0].name = ""; r = validatePuzzle(b); assert(!r.ok && /needs a <code>name/.test(r.errors.join()));
console.log("  ✓ bad puzzles are caught with friendly messages");

console.log("schedule checks (Pacific time, Monday midnight switch)");
const W = iso => weekInfo(new Date(iso), SETTINGS);
assert.strictEqual(W("2026-11-26T20:00:00Z").week, 0); assert(W("2026-11-26T20:00:00Z").beforeStart);
assert.strictEqual(W("2026-11-30T08:00:00Z").week, 0);
assert.strictEqual(W("2026-12-07T07:59:00Z").week, 0);           // Sun Dec 6 23:59 PST
assert.strictEqual(W("2026-12-07T08:00:00Z").week, 1);           // Mon Dec 7 00:00 PST
assert.strictEqual(W("2027-02-08T08:00:00Z").week, 10);          // Valentine's week
assert.strictEqual(W("2027-03-15T06:59:00Z").week, 14);          // Sun 23:59 PDT (after DST)
assert.strictEqual(W("2027-03-15T07:00:00Z").week, 15);          // Mon 00:00 PDT
assert.strictEqual(W("2026-12-07T07:00:00Z").msToNext, 3600000);
assert.strictEqual(puzzleIndexForWeek(PUZZLES.length, PUZZLES.length), 0);
assert.strictEqual(puzzleIndexForWeek(PUZZLES.length + 3, PUZZLES.length), 3);
console.log("  ✓ schedule OK");

if (failures){ console.log(`\n${failures} problem(s) found`); process.exit(1); }
console.log(`\nALL OK – ${PUZZLES.length} puzzles (about ${Math.round(PUZZLES.length / 4.35)} months before it repeats)`);
