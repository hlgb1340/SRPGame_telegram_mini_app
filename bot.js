require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Game logic
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
    return "You win!";
  } else {
    return "Computer wins!";
  }
}

// Read scores from JSON file
function readScores() {
  try {
    const data = fs.readFileSync("scores.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Write scores to JSON file
function writeScores(scores) {
  fs.writeFileSync("scores.json", JSON.stringify(scores));
}

function sendMainMenu(chatId) {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Play Game", callback_data: "play" }],
        [{ text: "View Score", callback_data: "score" }],
        [{ text: "Help", callback_data: "help" }],
      ],
    },
  };
  bot.sendMessage(
    chatId,
    "Welcome to Rock Paper Scissors! What would you like to do?",
    options
  );
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sendMainMenu(chatId);
});

bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  switch (data) {
    case "play":
      startGame(chatId);
      break;
    case "score":
      showScore(chatId);
      break;
    case "help":
      showHelp(chatId);
      break;
    case "rock":
    case "paper":
    case "scissors":
      playGame(chatId, data);
      break;
    case "play_again":
      startGame(chatId);
      break;
    case "main_menu":
      sendMainMenu(chatId);
      break;
  }

  bot.answerCallbackQuery(callbackQuery.id);
});

function startGame(chatId) {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✊ Rock", callback_data: "rock" },
          { text: "✋ Paper", callback_data: "paper" },
          { text: "✌️ Scissors", callback_data: "scissors" },
        ],
      ],
    },
  };
  bot.sendMessage(chatId, "Choose your move:", options);
}

function showScore(chatId) {
  const scores = readScores();
  const userScore = scores[chatId] || { player: 0, computer: 0 };
  const message = `Your score: ${userScore.player}\nComputer score: ${userScore.computer}`;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Back to Main Menu", callback_data: "main_menu" }],
      ],
    },
  };

  bot.sendMessage(chatId, message, options);
}

function showHelp(chatId) {
  const helpMessage = `
Here's how to play Rock Paper Scissors:

1. Click "Play Game" to start a new game.
2. Choose your move: Rock, Paper, or Scissors.
3. The computer will make its choice, and the result will be shown.
4. Your score will be updated automatically.

Remember:
• Rock beats Scissors
• Scissors beats Paper
• Paper beats Rock

Have fun playing!
  `;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Back to Main Menu", callback_data: "main_menu" }],
      ],
    },
  };

  bot.sendMessage(chatId, helpMessage, options);
}

function playGame(chatId, playerSelection) {
  const computerSelection = computerPlay();
  const result = playRound(playerSelection, computerSelection);

  // Update scores
  const scores = readScores();
  if (!scores[chatId]) {
    scores[chatId] = { player: 0, computer: 0 };
  }
  if (result === "You win!") {
    scores[chatId].player++;
  } else if (result === "Computer wins!") {
    scores[chatId].computer++;
  }
  writeScores(scores);

  const response = `You chose ${getEmoji(
    playerSelection
  )}, computer chose ${getEmoji(computerSelection)}. ${result}\n\nYour score: ${
    scores[chatId].player
  }\nComputer score: ${scores[chatId].computer}`;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Play Again", callback_data: "play_again" }],
        [{ text: "Back to Main Menu", callback_data: "main_menu" }],
      ],
    },
  };

  bot.sendMessage(chatId, response, options);
}

console.log("Bot is running...");
