
import { createState, play, checkWinner } from "../src/game.js";

test("X starts and toggles players", () => {
  let s = createState();
  expect(s.player).toBe("X");
  play(s, 0);
  expect(s.board[0]).toBe("X");
  expect(s.player).toBe("O");
});

test("ignores moves on filled cells", () => {
  let s = createState();
  play(s, 0);
  const movesBefore = s.moves;
  play(s, 0); // same spot
  expect(s.moves).toBe(movesBefore);
});

test("detects a row winner", () => {
  const b = ["X", "X", "X", null, null, null, null, null, null];
  expect(checkWinner(b)).toBe("X");
});

test("detects draw", () => {
  const b = [
    "X", "O", "X",
    "X", "O", "O",
    "O", "X", "X",
  ];
  expect(checkWinner(b)).toBe("draw");
});
