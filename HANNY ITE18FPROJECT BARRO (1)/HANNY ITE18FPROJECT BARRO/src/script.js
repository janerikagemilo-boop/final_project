// Select all elements with the class "box" (representing the game grid cells)
let boxes = document.querySelectorAll(".box");

// Initialize the game state
let turn = "X"; // Player "X" starts the game
let isGameOver = false; // Game is not over initially

// Loop through each box (grid cell) and add an event listener to handle clicks
boxes.forEach((e) => {
  e.innerHTML = ""; // Clear any existing content in the box

  // Add click event listener to handle player moves
  e.addEventListener("click", () => {
    // If the game is not over and the box is empty, make a move
    if (!isGameOver && e.innerHTML === "") {
      e.innerHTML = turn; // Fill the box with the current player's mark ("X" or "O")
      cheakWin(); // Check if the current player wins
      cheakDraw(); // Check if the game is a draw
      changeTurn(); // Switch to the next player's turn
    }
  });
});

// Function to change the turn between players "X" and "O"
function changeTurn() {
  if (turn === "X") {
    turn = "O"; // Switch to player "O"
    document.querySelector(".bg").style.left = "85px"; // Move the indicator for "O" turn
  } else {
    turn = "X"; // Switch to player "X"
    document.querySelector(".bg").style.left = "0"; // Move the indicator for "X" turn
  }
}

// Select the background music and mute button elements
let backgroundMusic = document.querySelector("#background-music");
let muteButton = document.querySelector("#mute-toggle");

// Play background music when the page loads
backgroundMusic.volume = 0.5; // Set initial volume
backgroundMusic.play(); // Start playing music

// Add event listener for the mute button to toggle music mute/unmute
muteButton.addEventListener("click", () => {
  if (backgroundMusic.muted) {
    // If the music is muted, unmute and update button text
    backgroundMusic.muted = false;
    muteButton.innerHTML = "Mute Music";
  } else {
    // If the music is unmuted, mute and update button text
    backgroundMusic.muted = true;
    muteButton.innerHTML = "Unmute Music";
  }
});

// Initialize win counters for "X" and "O"
let xWins = 0;
let oWins = 0;

// Function to update the scoreboard
function updateScoreboard() {
  document.getElementById("x-wins").innerText = xWins; // Display "X" wins
  document.getElementById("o-wins").innerText = oWins; // Display "O" wins
}

// Function to check for a winning condition
function cheakWin() {
  // List of possible winning combinations (rows, columns, diagonals)
  let winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // Loop through all winning conditions
  for (let i = 0; i < winConditions.length; i++) {
    let v0 = boxes[winConditions[i][0]].innerHTML; // Get value of first box in the combination
    let v1 = boxes[winConditions[i][1]].innerHTML; // Get value of second box in the combination
    let v2 = boxes[winConditions[i][2]].innerHTML; // Get value of third box in the combination

    // Check if all three boxes have the same non-empty value (win condition met)
    if (v0 != "" && v0 === v1 && v0 === v2) {
      isGameOver = true; // Set game state to over
      document.querySelector("#results").innerHTML = turn + " wins"; // Display winning message
      document.querySelector("#play-again").style.display = "inline"; // Show play-again button

      // Update win counters based on which player won
      if (turn === "X") {
        xWins++; // Increment "X" wins
      } else {
        oWins++; // Increment "O" wins
      }

      // Update the scoreboard with the latest win counts
      updateScoreboard();

      // Highlight the winning boxes
      for (let j = 0; j < 3; j++) {
        boxes[winConditions[i][j]].style.backgroundColor = "#08D9D6"; // Change background color to highlight
        boxes[winConditions[i][j]].style.color = "#000"; // Change text color to black for contrast
      }
      return; // Exit the loop once a winner is found
    }
  }
}

// Reset the scoreboard when the page loads
window.addEventListener("load", () => {
  xWins = 0; // Reset "X" wins to 0
  oWins = 0; // Reset "O" wins to 0
  updateScoreboard(); // Update the scoreboard display
});

// Function to check for a draw (no winner and no empty boxes left)
function cheakDraw() {
  if (!isGameOver) {
    let isDraw = true; // Assume the game is a draw initially
    boxes.forEach((e) => {
      if (e.innerHTML === "") isDraw = false; // If any box is empty, it's not a draw
    });

    // If the game is a draw, update the game state and display draw message
    if (isDraw) {
      isGameOver = true;
      document.querySelector("#results").innerHTML = "Draw"; // Display draw message
      document.querySelector("#play-again").style.display = "inline"; // Show play-again button
    }
  }
}

// Add event listener to restart the game when the "Play Again" button is clicked
document.querySelector("#play-again").addEventListener("click", () => {
  // Reset the game state
  isGameOver = false;
  turn = "X"; // Reset to player "X" starting the game
  document.querySelector(".bg").style.left = "0"; // Reset the turn indicator position
  document.querySelector("#results").innerHTML = ""; // Clear the result message
  document.querySelector("#play-again").style.display = "none"; // Hide the play-again button

  // Reset each box
  boxes.forEach((e) => {
    e.innerHTML = ""; // Clear the content
    e.style.removeProperty("background-color"); // Remove the background color
    e.style.color = "#fff"; // Reset text color to white
  });
});
