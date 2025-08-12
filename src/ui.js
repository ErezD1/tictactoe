import { createState, play } from "./game.js";

export function newGame(boardEl, statusEl, resetBtn) {
  let state = createState();
  boardEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.setAttribute("role", "gridcell");
    cell.addEventListener("click", () => {
      const before = state.board[i];
      state = play(state, i);
      if (state.board[i] !== before) cell.textContent = state.board[i];
      statusEl.textContent = state.winner
        ? state.winner === "draw" ? "It's a draw" : `${state.winner} wins!`
        : `${state.player} to play`;
    });
    boardEl.appendChild(cell);
  }
  statusEl.textContent = `${state.player} to play`;
  resetBtn.onclick = () => newGame(boardEl, statusEl, resetBtn);
  return state;
}
