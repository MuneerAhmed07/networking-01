let currentQuestion = 0;
let answers = JSON.parse(localStorage.getItem("answers")) || {};
let timer;

const startBtn = document.getElementById("startBtn");
const resumeBtn = document.getElementById("resumeBtn");
const startScreen = document.getElementById("startScreen");
const quizBox = document.getElementById("quizBox");

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const progressText = document.getElementById("progressText");

const timeText = document.getElementById("timeText");
const circle = document.querySelector(".progress");

const radius = 28;
const circumference = 2 * Math.PI * radius;
let totalTime = 20;
let timeLeft = 20;

circle.style.strokeDasharray = circumference;

if (localStorage.getItem("currentQuestion")) {
  resumeBtn.classList.remove("hidden");
}

/* START */
startBtn.onclick = () => startQuiz();
resumeBtn.onclick = () => {
  currentQuestion = +localStorage.getItem("currentQuestion");
  startQuiz();
};

function startQuiz() {
  startScreen.classList.add("hidden");
  quizBox.classList.remove("hidden");
  loadQuestion();
}

/* LOAD QUESTION */
function loadQuestion() {
  clearInterval(timer);
  timeLeft = totalTime;

  let q = quizData[currentQuestion];

  questionEl.innerText = q.question;
  progressText.innerText = `${currentQuestion + 1}/${quizData.length}`;

  optionsEl.innerHTML = "";

  q.options.forEach((opt, index) => {
    let btn = document.createElement("button");
    btn.innerText = opt;

    if (answers[currentQuestion] !== undefined) {
      applyResult(btn, index, q.correctAnswer);
    }

    btn.onclick = () => selectAnswer(index);

    optionsEl.appendChild(btn);
  });

  startTimer();
}

/* SELECT ANSWER */
function selectAnswer(index) {
  if (answers[currentQuestion] !== undefined) return;

  answers[currentQuestion] = index;
  localStorage.setItem("answers", JSON.stringify(answers));

  showResult();
}

/* SHOW RESULT COLORS */
function showResult() {
  let q = quizData[currentQuestion];
  let buttons = optionsEl.children;

  for (let i = 0; i < buttons.length; i++) {
    applyResult(buttons[i], i, q.correctAnswer);
  }
}

/* APPLY COLORS */
function applyResult(btn, index, correct) {
  btn.disabled = true;

  if (index === correct) {
    btn.classList.add("correct");
  } else if (answers[currentQuestion] === index) {
    btn.classList.add("wrong");
  }
}

/* TIMER (CIRCULAR) */
function startTimer() {
  timeText.innerText = timeLeft;
  circle.style.strokeDashoffset = 0;

  timer = setInterval(() => {
    timeLeft--;
    timeText.innerText = timeLeft;

    let offset = circumference - (timeLeft / totalTime) * circumference;
    circle.style.strokeDashoffset = offset;

    if (timeLeft <= 0) {
      clearInterval(timer);
      showResult();
    }
  }, 1000);
}

/* NAVIGATION */
document.getElementById("nextBtn").onclick = () => {
  if (currentQuestion < quizData.length - 1) {
    currentQuestion++;
    saveProgress();
    loadQuestion();
  } else {
    showFinalResult();
  }
};

document.getElementById("prevBtn").onclick = () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
};

document.getElementById("skipBtn").onclick = () => {
  currentQuestion++;
  saveProgress();
  loadQuestion();
};

/* SAVE PROGRESS */
function saveProgress() {
  localStorage.setItem("currentQuestion", currentQuestion);
}

/* FINAL RESULT */
function showFinalResult() {
  quizBox.classList.add("hidden");

  let correct = 0, wrong = 0, skipped = 0;

  quizData.forEach((q, i) => {
    if (answers[i] === undefined) skipped++;
    else if (answers[i] === q.correctAnswer) correct++;
    else wrong++;
  });

  let percent = Math.round((correct / quizData.length) * 100);

  document.getElementById("resultBox").classList.remove("hidden");

  document.getElementById("resultBox").innerHTML = `
    <h2>Quiz Result</h2>
    <div>
        <p>Correct: ${correct}</p>
    <p class="wrong">Wrong: ${wrong}</p>
    <p class="skip">Skipped: ${skipped}</p>
    <p class="score">Score: ${percent}%</p>
    </div>
    <button onclick="restart()">Restart Paper</button>
  `;
}

/* RESTART */
function restart() {
  localStorage.clear();
  location.reload();
}

document.getElementById("resetBtn").onclick = () => {
  if (confirm("Are you sure you want to reset the quiz?")) {
    localStorage.clear();
    answers = {};
    currentQuestion = 0;
    location.reload();
  }
};