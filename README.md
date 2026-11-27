# Melina Connections ♥

A Connections-style word game made for Melina. It's one file, `index.html`. Open it in any browser on a phone or computer. Nothing to install.

## How to play
- There are 16 words. Find **4 groups of 4** that have something in common.
- Tap 4 words, then tap **Submit**. **Shuffle** mixes the tiles, **Deselect all** clears your picks.
- You get **4 mistakes** (the dots). If 3 of your 4 are right, it says **"One away..."**.
- Solved groups turn into colored bars, from easiest to trickiest: 🟨 yellow, 🟦 light blue, 🩷 pink, 🟪 purple.
- Run out of mistakes and the rest of the groups are revealed. Either way, she gets a love note signed "— love, Finn ♥" and a countdown to the next puzzle.
- Progress saves on her phone automatically.

## One puzzle a week
- Only one puzzle shows at a time. It switches by itself every **Monday at 12:00 AM Pacific time**, no matter what time zone her phone is in.
- `SETTINGS.startDate` (`"2026-11-30"`, a Monday) is week 0. Before that date, the first puzzle shows.
- **The schedule is the order of the `PUZZLES` list, top to bottom.** Week 0 = 1st puzzle, week 1 = 2nd, and so on. When the list runs out, it starts over from the top. (There are 28 puzzles, about 6 months.)
- Adding, removing or moving a puzzle shifts which puzzle lands on which future week.

### Preview links (just for Finn)
Add one of these to the end of the link:
- `?week=5` shows what week 5 will show (week 0 = the first week)
- `?puzzle=12` shows the 12th puzzle in the list
- `?date=2027-02-14` shows what will be up on that date

Example: `https://finnmcsherry21.github.io/melina-connections/?week=3`. A yellow "Preview" label appears so you know it's not the live one, and preview progress is saved separately. Set `allowPreviewLinks: false` in `SETTINGS` to turn this off.

## Editing puzzles from your phone
1. Open the repo in **Safari** (not the GitHub app): `github.com/finnmcsherry21/melina-connections`.
2. Tap `index.html`, then the **pencil icon** (✏️) to edit.
3. Near the top is `const PUZZLES = [`. Each `{ ... },` block is one puzzle:
   ```js
   {
     title: "Where it all began",
     groups: [
       { name: "Roman landmarks", words: ["Pantheon", "Colosseum", "Trevi", "Forum"] },   // 🟨 easiest
       { name: "Melina's pasta order", words: ["Bowtie", "Rotini", "Cavatappi", "Alfredo"] }, // 🟦
       { name: "Italian words", words: ["Amore", "Ciao", "Bella", "Grazie"] },               // 🩷
       { name: "Roman ___", words: ["Holiday", "Numeral", "Empire", "Candle"] },             // 🟪 trickiest
     ],
     winMessage: "The note she sees at the end.\nUse \\n for a new line.",
   },
   ```
4. Change a group's `name` (what she sees once she solves it) or its `words`. Keep the quotes and commas.
5. Tap **Commit changes**. It's live in about a minute.

**The rules:**
- Exactly **4 groups**, each with exactly **4 words** (16 tiles).
- **No word can appear twice** in the same puzzle. Capitals and extra spaces don't make a word different.
- The group order sets the color and difficulty: 1st yellow (easiest), 2nd light blue, 3rd pink, 4th purple (trickiest).
- Keep words short, about 10 letters max per word. Two-word phrases like "Coke Zero" are fine and wrap onto two lines.
- The fun part is red herrings: words that look like they fit another group (like BOOTS in a "___less" puzzle).

If you break a rule, the game shows a friendly message on screen saying exactly what to fix (for example "Group 2 has 5 words, it needs exactly 4" or "AMORE appears more than once"). Check with a `?puzzle=N` link after editing.

- **Add a puzzle:** copy a whole `{ ... },` block, paste it where you want it in the order, and edit it.
- **Remove a puzzle:** delete its whole `{ ... },` block.
- **Reorder:** cut a whole block and paste it somewhere else.
- **Different starting shuffle:** add `seed: 7,` (any number) to a puzzle.
- Editing a puzzle resets saved progress for that puzzle.

## Putting it on her phone
Turn on GitHub Pages (Settings → Pages → Branch `main`, `/ (root)` → Save). The link is `https://finnmcsherry21.github.io/melina-connections/`. On iPhone, Share → Add to Home Screen makes it feel like an app.

## For tinkerers
`node test.js` checks every puzzle (4 groups × 4 unique words, a win message, word lengths), the guess-checking logic, the error messages, and the Monday switch (Node 18+, no packages needed).
