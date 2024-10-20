const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

// Read scores from JSON file
function readScores() {
  try {
    const data = fs.readFileSync("scores.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    return { playerScore: 0, computerScore: 0 };
  }
}

// Write scores to JSON file
function writeScores(scores) {
  fs.writeFileSync("scores.json", JSON.stringify(scores));
}

app.get("/api/scores", (req, res) => {
  const scores = readScores();
  res.json(scores);
});

app.post("/api/scores", (req, res) => {
  const { playerScore, computerScore } = req.body;
  writeScores({ playerScore, computerScore });
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
