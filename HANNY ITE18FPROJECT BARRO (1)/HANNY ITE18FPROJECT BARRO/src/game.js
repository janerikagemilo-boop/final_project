import { playSound, playWinSound, playDrawSound } from "./audio.js";
import { saveGameStats, loadGameStats } from "./utils.js";

class TicTacToeGame {
  constructor() {
    this.board = Array(9).fill("");
    this.currentPlayer = "X";
    this.gameActive = true;
    this.moveHistory = [];
    this.startTime = null;
    this.timerInterval = null;
    this.moveCount = 0;
    this.gameMode = "pvp"; // 'pvp' or 'pvc'
    this.aiDifficulty = "medium";
    this.scores = {
      X: 0,
      O: 0,
      draws: 0,
    };
    this.gameStats = loadGameStats();
    this.init();
  }

  init() {
    this.loadSettings();
    this.setupEventListeners();
    this.renderBoard();
    this.updateScoreboard();
    this.startTimer();
    this.loadGameHistory();
  }

  loadSettings() {
    const settings =
      JSON.parse(localStorage.getItem("ticTacToeSettings")) || {};
    this.gameMode = settings.gameMode || "pvp";
    this.aiDifficulty = settings.aiDifficulty || "medium";
    this.boardStyle = settings.boardStyle || "default";

    // Update UI based on settings
    if (this.gameMode === "pvc") {
      this.setupAI();
    }

    this.applyBoardStyle();
  }

  renderBoard() {
    const boardElement = document.getElementById("game-board");
    boardElement.innerHTML = "";
    boardElement.className = `game-board ${this.boardStyle}`;

    this.board.forEach((cell, index) => {
      const cellElement = document.createElement("div");
      cellElement.className = "board-cell";
      cellElement.dataset.index = index;

      if (cell) {
        cellElement.textContent = cell;
        cellElement.classList.add("occupied", cell.toLowerCase());
      }

      cellElement.addEventListener("click", () => this.handleCellClick(index));
      boardElement.appendChild(cellElement);
    });

    this.updateTurnIndicator();
  }

  handleCellClick(index) {
    if (!this.gameActive || this.board[index] !== "") return;

    playSound("click");

    // Save move to history for undo
    this.moveHistory.push({
      board: [...this.board],
      player: this.currentPlayer,
      index: index,
    });

    // Make the move
    this.board[index] = this.currentPlayer;
    this.moveCount++;
    document.getElementById("move-counter").textContent = this.moveCount;
    document.getElementById("undo-move").disabled = false;

    this.renderBoard();

    // Check for win or draw
    if (this.checkWin()) {
      this.handleWin();
    } else if (this.checkDraw()) {
      this.handleDraw();
    } else {
      this.switchPlayer();

      // If playing against AI and it's AI's turn
      if (this.gameMode === "pvc" && this.currentPlayer === "O") {
        setTimeout(() => this.makeAIMove(), 500);
      }
    }
  }

  makeAIMove() {
    if (!this.gameActive) return;

    let moveIndex;

    switch (this.aiDifficulty) {
      case "easy":
        moveIndex = this.getRandomMove();
        break;
      case "medium":
        moveIndex = this.getMediumAIMove();
        break;
      case "hard":
        moveIndex = this.getBestMove();
        break;
      default:
        moveIndex = this.getRandomMove();
    }

    if (moveIndex !== -1) {
      this.handleCellClick(moveIndex);
    }
  }

  getRandomMove() {
    const emptyCells = this.board
      .map((cell, index) => (cell === "" ? index : null))
      .filter((index) => index !== null);

    return emptyCells.length > 0
      ? emptyCells[Math.floor(Math.random() * emptyCells.length)]
      : -1;
  }

  getMediumAIMove() {
    // Try to win
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === "") {
        this.board[i] = "O";
        if (this.checkWin("O")) {
          this.board[i] = "";
          return i;
        }
        this.board[i] = "";
      }
    }

    // Block player from winning
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === "") {
        this.board[i] = "X";
        if (this.checkWin("X")) {
          this.board[i] = "";
          return i;
        }
        this.board[i] = "";
      }
    }

    // Take center if available
    if (this.board[4] === "") return 4;

    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter((i) => this.board[i] === "");
    if (availableCorners.length > 0) {
      return availableCorners[
        Math.floor(Math.random() * availableCorners.length)
      ];
    }

    // Random move
    return this.getRandomMove();
  }

  getBestMove() {
    // Minimax algorithm implementation for hard difficulty
    const scores = {
      O: 1,
      X: -1,
      tie: 0,
    };

    const minimax = (board, depth, isMaximizing) => {
      const result = this.evaluateBoard(board);
      if (result !== null) return scores[result];

      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
          if (board[i] === "") {
            board[i] = "O";
            const score = minimax(board, depth + 1, false);
            board[i] = "";
            bestScore = Math.max(score, bestScore);
          }
        }
        return bestScore;
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
          if (board[i] === "") {
            board[i] = "X";
            const score = minimax(board, depth + 1, true);
            board[i] = "";
            bestScore = Math.min(score, bestScore);
          }
        }
        return bestScore;
      }
    };

    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (this.board[i] === "") {
        this.board[i] = "O";
        const score = minimax(this.board, 0, false);
        this.board[i] = "";

        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  }

  evaluateBoard(board) {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return board.includes("") ? null : "tie";
  }

  checkWin(player = this.currentPlayer) {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        this.board[a] === player &&
        this.board[b] === player &&
        this.board[c] === player
      ) {
        // Highlight winning cells
        pattern.forEach((index) => {
          const cell = document.querySelector(`[data-index="${index}"]`);
          if (cell) cell.classList.add("winning-cell");
        });

        return true;
      }
    }
    return false;
  }

  checkDraw() {
    return !this.board.includes("") && !this.checkWin();
  }

  handleWin() {
    this.gameActive = false;
    clearInterval(this.timerInterval);

    this.scores[this.currentPlayer]++;
    this.updateScoreboard();

    playWinSound();

    // Save game to history
    this.saveGameToHistory("win");

    // Show result modal
    this.showResultModal("win", this.currentPlayer);
  }

  handleDraw() {
    this.gameActive = false;
    clearInterval(this.timerInterval);

    this.scores.draws++;
    this.updateScoreboard();

    playDrawSound();

    this.saveGameToHistory("draw");
    this.showResultModal("draw");
  }

  showResultModal(result, winner = null) {
    const modal = document.getElementById("game-result-modal");
    const title = document.getElementById("result-title");
    const message = document.getElementById("result-message");
    const icon = document.getElementById("result-icon");

    if (result === "win") {
      title.textContent = "🎉 Victory!";
      message.textContent = `Player ${winner} wins the game!`;
      icon.textContent = "🏆";
    } else {
      title.textContent = "🤝 Draw!";
      message.textContent = "The game ended in a draw!";
      icon.textContent = "⚖";
    }

    document.getElementById("result-moves").textContent = this.moveCount;
    document.getElementById("result-time").textContent = this.getElapsedTime();

    modal.style.display = "flex";
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    this.updateTurnIndicator();
  }

  updateTurnIndicator() {
    document.getElementById("current-player").textContent = this.currentPlayer;
    document.querySelectorAll(".player-x, .player-o").forEach((el) => {
      el.classList.remove("active");
    });

    const activePlayer = this.currentPlayer === "X" ? "player-x" : "player-o";
    document.querySelector(`.${activePlayer}`).classList.add("active");
  }

  updateScoreboard() {
    document.getElementById("x-wins").textContent = this.scores.X;
    document.getElementById("o-wins").textContent = this.scores.O;
    document.getElementById("draws").textContent = this.scores.draws;

    // Calculate win rates
    const totalGames = this.scores.X + this.scores.O + this.scores.draws;
    if (totalGames > 0) {
      const xRate = Math.round((this.scores.X / totalGames) * 100);
      const oRate = Math.round((this.scores.O / totalGames) * 100);

      document.getElementById("x-win-rate").textContent = `${xRate}%`;
      document.getElementById("o-win-rate").textContent = `${oRate}%`;
    }
  }

  startTimer() {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);

      document.getElementById("game-timer").textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }, 1000);
  }

  getElapsedTime() {
    if (!this.startTime) return "00:00";
    const elapsed = Date.now() - this.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  undoMove() {
    if (this.moveHistory.length === 0 || !this.gameActive) return;

    playSound("click");

    const lastMove = this.moveHistory.pop();
    this.board = lastMove.board;
    this.currentPlayer = lastMove.player;
    this.moveCount--;

    document.getElementById("move-counter").textContent = this.moveCount;
    document.getElementById("undo-move").disabled =
      this.moveHistory.length === 0;

    this.renderBoard();
    this.gameActive = true;

    // Restart timer if it was stopped
    if (!this.timerInterval) {
      this.startTimer();
    }
  }

  resetGame() {
    playSound("click");

    this.board = Array(9).fill("");
    this.currentPlayer = "X";
    this.gameActive = true;
    this.moveHistory = [];
    this.moveCount = 0;

    document.getElementById("move-counter").textContent = "0";
    document.getElementById("undo-move").disabled = true;

    clearInterval(this.timerInterval);
    this.startTimer();

    this.renderBoard();

    // Hide result modal if visible
    document.getElementById("game-result-modal").style.display = "none";
  }

  saveGameToHistory(result) {
    const gameData = {
      date: new Date().toISOString(),
      result: result,
      winner: result === "win" ? this.currentPlayer : null,
      moves: this.moveCount,
      time: this.getElapsedTime(),
      board: [...this.board],
    };

    this.gameStats.history.unshift(gameData);
    if (this.gameStats.history.length > 10) {
      this.gameStats.history.pop();
    }

    saveGameStats(this.gameStats);
    this.loadGameHistory();
  }

  loadGameHistory() {
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = "";

    this.gameStats.history.forEach((game, index) => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";

      const date = new Date(game.date).toLocaleDateString();
      const result =
        game.result === "win" ? `🏆 Player ${game.winner} won` : "🤝 Draw";

      historyItem.innerHTML = `
                <div class="history-header">
                    <span class="history-date">${date}</span>
                    <span class="history-result">${result}</span>
                </div>
                <div class="history-details">
                    <span>Moves: ${game.moves}</span>
                    <span>Time: ${game.time}</span>
                </div>
            `;

      historyList.appendChild(historyItem);
    });
  }

  showHint() {
    if (!this.gameActive) return;

    playSound("click");

    // Find best move for current player
    const hintIndex =
      this.currentPlayer === "X"
        ? this.getBestMoveForPlayer("X")
        : this.getBestMoveForPlayer("O");

    if (hintIndex !== -1) {
      const cell = document.querySelector(`[data-index="${hintIndex}"]`);
      cell.classList.add("hint-cell");

      setTimeout(() => {
        cell.classList.remove("hint-cell");
      }, 2000);
    }
  }

  getBestMoveForPlayer(player) {
    // Simple hint system - prioritize winning moves, then blocking moves
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === "") {
        this.board[i] = player;
        if (this.checkWin(player)) {
          this.board[i] = "";
          return i;
        }
        this.board[i] = "";
      }
    }

    // Block opponent
    const opponent = player === "X" ? "O" : "X";
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === "") {
        this.board[i] = opponent;
        if (this.checkWin(opponent)) {
          this.board[i] = "";
          return i;
        }
        this.board[i] = "";
      }
    }

    // Take center
    if (this.board[4] === "") return 4;

    // Take any available
    return this.getRandomMove();
  }

  applyBoardStyle() {
    document.body.classList.remove(
      "style-default",
      "style-neon",
      "style-classic"
    );
    document.body.classList.add(`style-${this.boardStyle}`);
  }

  setupEventListeners() {
    document
      .getElementById("undo-move")
      .addEventListener("click", () => this.undoMove());
    document
      .getElementById("reset-game")
      .addEventListener("click", () => this.resetGame());
    document
      .getElementById("hint-btn")
      .addEventListener("click", () => this.showHint());
    document
      .getElementById("play-again")
      .addEventListener("click", () => this.resetGame());
    document
      .getElementById("menu-from-result")
      .addEventListener("click", () => {
        window.location.href = "index.html";
      });
    document.getElementById("back-to-menu").addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to return to menu? Current game will be lost."
        )
      ) {
        window.location.href = "index.html";
      }
    });
  }

  setupAI() {
    // Additional AI setup if needed
  }
}

// Initialize game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TicTacToeGame();
});
