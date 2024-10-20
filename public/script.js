const playerScoreElement = document.getElementById("playerScore");
const computerScoreElement = document.getElementById("computerScore");
const resultElement = document.getElementById("result");
const choices = document.querySelectorAll(".choice");

let playerScore = 0;
let computerScore = 0;

// Load scores from the server
async function loadScores() {
  const response = await fetch("/api/scores");
  const scores = await response.json();
  playerScore = scores.playerScore;
  computerScore = scores.computerScore;
  updateScoreDisplay();
}

// Save scores to the server
async function saveScores() {
  await fetch("/api/scores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ playerScore, computerScore }),
  });
}

function updateScoreDisplay() {
  playerScoreElement.textContent = playerScore;
  computerScoreElement.textContent = computerScore;
}

function computerPlay() {
  const choices = ["rock", "paper", "scissors"];
  return choices[Math.floor(Math.random() * choices.length)];
}

function getEmoji(choice) {
  switch (choice) {
    case "rock":
      return "✊";
    case "paper":
      return "✋";
    case "scissors":
      return "✌️";
    default:
      return choice;
  }
}

function playRound(playerSelection, computerSelection) {
  if (playerSelection === computerSelection) {
    return "It's a tie!";
  }

  if (
    (playerSelection === "rock" && computerSelection === "scissors") ||
    (playerSelection === "paper" && computerSelection === "rock") ||
    (playerSelection === "scissors" && computerSelection === "paper")
  ) {
    playerScore++;
    return "You win!";
  } else {
    computerScore++;
    return "Computer wins!";
  }
}

choices.forEach((choice) => {
  choice.addEventListener("click", function () {
    const playerSelection = this.dataset.choice;
    const computerSelection = computerPlay();
    const result = playRound(playerSelection, computerSelection);

    resultElement.textContent = `You chose ${getEmoji(
      playerSelection
    )}, computer chose ${getEmoji(computerSelection)}. ${result}`;
    updateScoreDisplay();
    saveScores();
  });
});

// Load scores when the page loads
loadScores();
