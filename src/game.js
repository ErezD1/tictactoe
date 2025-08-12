// Game state + logic (no DOM)
export const EMPTY = null;

export function createState() {
  return { board: Array(9).fill(EMPTY), player: "X", winner: null, moves: 0 };
}

export function lines() {
  return [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
}

export function checkWinner(board) {
  for (const [a, b, c] of lines()) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every((v) => v !== EMPTY) ? "draw" : null;
}

export function play(state, i) {
  if (state.winner || state.board[i] !== EMPTY) return state;
  state.board[i] = state.player;
  state.moves++;
  const w = checkWinner(state.board);
  if (w) state.winner = w;
  else state.player = state.player === "X" ? "O" : "X";
  return state;
}
