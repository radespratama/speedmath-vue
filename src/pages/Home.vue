<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white"
  >
    <header class="px-6 py-4 border-b border-gray-700 select-none">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <h1 class="text-3xl font-bold text-white">SpeedMath</h1>

        <div class="flex items-center gap-4">
          <div class="text-sm">
            <span class="text-gray-400">Score:</span>
            <span class="text-green-400 font-bold ml-1">{{ score }}</span>
          </div>
          <div class="text-sm">
            <span class="text-gray-400">Best:</span>
            <span class="text-yellow-400 font-bold ml-1">{{ bestScore }}</span>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <RouterLink
            to="/leaderboard"
            class="text-sm underline underline-offset-4 hover:no-underline"
          >
            Leaderboard
          </RouterLink>

          <div class="w-px h-4 bg-gray-600" />

          <RouterLink
            to="/multiplayer"
            class="text-sm underline underline-offset-4 hover:no-underline"
          >
            Multiplayer
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-8">
      <div v-if="gameState === 'menu'" class="text-center">
        <div class="mb-8">
          <h2 class="text-5xl font-bold mb-4 text-white tracking-tight">
            Test Your Speed
          </h2>
          <p class="text-gray-300 text-lg">
            Solve math problems as fast as you can!
          </p>
        </div>

        <div class="max-w-2xl mx-auto space-y-5 mb-8">
          <div class="nickname">
            <h3 class="text-xl font-semibold mb-4 text-gray-200">
              Your Nickname
            </h3>
            <div>
              <input
                type="text"
                id="current_nickname"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Pak Pacul"
                v-model="currentNickname"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="game-mode">
              <h3 class="text-xl font-semibold mb-4 text-gray-200">
                Game Mode
              </h3>
              <div>
                <select
                  id="game-mode"
                  v-model="gameModeRef"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option
                    v-for="mode in gameModes"
                    :value="mode"
                    :selected="mode === gameModeRef"
                  >
                    {{ formatGameModeName(mode) }}
                  </option>
                </select>
              </div>
            </div>

            <div class="total_question">
              <h3 class="text-xl font-semibold mb-4 text-gray-200">
                Total Questions
              </h3>
              <div>
                <input
                  type="number"
                  id="number-input"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="20"
                  v-model="totalQuestions"
                  :max="getMaxQuestions()"
                  min="1"
                  required
                />
              </div>
              <div class="text-xs text-gray-400 mt-1">
                Max: {{ getMaxQuestions() }} questions available
              </div>
            </div>
          </div>
        </div>

        <div class="mb-8">
          <h3 class="text-xl font-semibold mb-4 text-gray-200">
            Choose Difficulty
          </h3>

          <div class="grid grid-cols-3 gap-4">
            <button
              v-for="diff in difficulties"
              :key="diff.name"
              @click="selectedDifficulty = diff"
              :class="[
                'px-6 py-3 rounded-lg font-semibold transition-all duration-200',
                selectedDifficulty.name === diff.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
              ]"
            >
              {{ diff.name }}
              <div class="text-xs opacity-75">
                {{ diff.timePerQuestion }}s per question
              </div>
            </button>
          </div>
        </div>

        <button
          @click="startGame"
          :disabled="
            isStartingGame || !currentNickname || totalQuestions?.length < 1
          "
          class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-8 py-4 rounded-lg font-bold text-lg cursor-pointer transition-all duration-200"
        >
          <span v-if="isStartingGame"> 🔄 Loading... </span>
          <span v-else>Start Game</span>
        </button>
      </div>

      <div v-else-if="gameState === 'playing'" class="text-center">
        <div class="mb-8">
          <div class="flex justify-center items-center gap-8 mb-4">
            <div class="text-center">
              <div class="text-sm text-gray-400">Time Left</div>
              <div
                :class="[
                  'text-3xl font-bold',
                  timeLeft <= 3 ? 'text-red-400' : 'text-blue-400',
                ]"
              >
                {{ timeLeft }}s
              </div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-400">Question</div>
              <div class="text-3xl font-bold text-green-400">
                {{ currentQuestion + 1 }}/{{ totalQuestions }}
              </div>
            </div>
          </div>

          <div class="w-full bg-gray-800 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${(currentQuestion / totalQuestions) * 100}%` }"
            ></div>
          </div>
        </div>

        <div class="mb-8">
          <div class="bg-gray-800 rounded-xl p-8 mb-6 border border-gray-700">
            <div class="text-5xl font-bold mb-4 text-white">
              {{ currentQuestionData.question }}
            </div>
          </div>

          <div class="mb-6">
            <input
              ref="answerInput"
              v-model="userAnswer"
              @keyup.enter="submitAnswer"
              @input="handleInput"
              type="text"
              class="w-40 h-16 text-center text-3xl font-bold bg-gray-800 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none text-white"
              placeholder="?"
              :disabled="gameState !== 'playing' || isProcessingAnswer"
            />
          </div>

          <button
            @click="submitAnswer"
            :disabled="!userAnswer.trim() || isProcessingAnswer"
            class="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200"
          >
            Submit Answer
          </button>
        </div>

        <div v-if="feedback" class="mb-4">
          <div
            :class="[
              'text-xl font-bold',
              feedback.correct ? 'text-green-400' : 'text-red-400',
            ]"
          >
            {{ feedback.message }}
          </div>
        </div>
      </div>

      <div v-else-if="gameState === 'finished'" class="text-center">
        <div class="mb-8">
          <h2
            class="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"
          >
            Game Over!
          </h2>

          <div class="bg-gray-800 rounded-xl p-8 mb-6 border border-gray-700">
            <div class="grid grid-cols-3 gap-6 text-center">
              <div>
                <div class="text-3xl font-bold text-green-400">{{ score }}</div>
                <div class="text-gray-400">Final Score</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-blue-400">
                  {{ correctAnswers }}/{{ totalQuestions }}
                </div>
                <div class="text-gray-400">Correct Answers</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-yellow-400">
                  {{ accuracyPercentage }}%
                </div>
                <div class="text-gray-400">Accuracy</div>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <p class="text-lg text-gray-300">{{ getPerformanceMessage() }}</p>
          </div>

          <button
            @click="resetGame"
            class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105"
          >
            Play Again
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { nanoid } from "nanoid";
import { onMounted, ref, computed } from "vue";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../configs/firebase";

import baseQuestion from "../datas/math_questions.json";

import gameOverSound from "../assets/sound/new-project_CMsCfhw.mp3";
import winnerSound from "../assets/sound/kids-cheering.mp3";
import falseAnswerSound from "../assets/sound/kentut.mp3";

const gameModes = [
  "addition",
  "subtraction",
  "multiplication",
  "division",
  "fractions",
  "root_squared",
  "exponents",
  "negative",
  "mixed",
];

const difficulties = ref([
  { name: "Fetus", timePerQuestion: 60, multiplier: 1 },
  { name: "Baby", timePerQuestion: 30, multiplier: 1.2 },
  { name: "Easy", timePerQuestion: 10, multiplier: 1.5 },
  { name: "Medium", timePerQuestion: 7, multiplier: 2 },
  { name: "Hard", timePerQuestion: 5, multiplier: 2.5 },
  { name: "Tidak Ngotak", timePerQuestion: 3, multiplier: 3 },
]);

const gameState = ref("menu");
const gameModeRef = ref("addition");

const score = ref(0);
const bestScore = ref(0);
const currentQuestion = ref(0);
const totalQuestions = ref("");

const timeLeft = ref(0);
const correctAnswers = ref(0);
const userAnswer = ref("");
const feedback = ref(null);
const answerInput = ref(null);

const currentNickname = ref("");

const selectedDifficulty = ref(difficulties.value[2]);

const randomizedQuestions = ref([]);
const currentQuestionData = ref({
  question: "",
  answer: "",
});

const isProcessingAnswer = ref(false);
const isStartingGame = ref(false);

let timer = null;

let gameOverAudio = null;
let winnerAudio = null;
let falseAnswerAudio = null;

const newId = nanoid();

// FIREBASE
const participantsRef = doc(db, "participants", newId);

const accuracyPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0;
  return Math.round((correctAnswers.value / totalQuestions.value) * 100);
});

function preloadAudio(src) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();

    audio.addEventListener("canplaythrough", () => {
      resolve(audio);
    });

    audio.addEventListener("error", reject);

    audio.src = src;
    audio.preload = "auto";
  });
}

function playFalseAnswerAudio() {
  if (falseAnswerAudio) {
    falseAnswerAudio.currentTime = 0;
    falseAnswerAudio
      .play()
      .catch((e) => console.log("Error playing false answer audio:", e));
  }
}

function playGameOverAudio() {
  if (gameOverAudio) {
    gameOverAudio.currentTime = 0;
    gameOverAudio
      .play()
      .catch((e) => console.log("Error playing game over audio:", e));
  }
}

function playWinnerAudio() {
  if (winnerAudio) {
    winnerAudio.currentTime = 0;
    winnerAudio
      .play()
      .catch((e) => console.log("Error playing winner audio:", e));
  }
}

function handleInput(e) {
  const sanitizedValue = e.target.value.replace(/[^0-9.-/-]/g, "");
  userAnswer.value = sanitizedValue;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getMaxQuestions() {
  if (
    !baseQuestion[gameModeRef.value] ||
    !baseQuestion[gameModeRef.value].questions
  ) {
    return 0;
  }

  return baseQuestion[gameModeRef.value].questions.length;
}

function formatGameModeName(mode) {
  const names = {
    addition: "ADDITION",
    subtraction: "SUBTRACTION",
    multiplication: "MULTIPLICATION",
    division: "DIVISION",
    fractions: "FRACTIONS",
    root_squared: "ROOT SQUARED",
    exponents: "EXPONENTS",
    negative: "NEGATIVE",
    mixed: "MIXED",
  };

  return names[mode] || mode.toUpperCase();
}

function prepareRandomizedQuestions() {
  const selectedGameMode = gameModeRef.value;
  const questionsData = baseQuestion[selectedGameMode];

  if (
    !questionsData ||
    !questionsData.questions ||
    questionsData.questions.length === 0
  ) {
    console.error(`No questions found for game mode: ${selectedGameMode}`);
    return;
  }

  const shuffled = shuffleArray(questionsData.questions);
  const requestedAmount = Math.min(totalQuestions.value, shuffled.length);
  randomizedQuestions.value = shuffled.slice(0, requestedAmount);

  if (totalQuestions.value > shuffled.length) {
    totalQuestions.value = shuffled.length;
  }
}

function getCurrentQuestion() {
  if (randomizedQuestions.value.length === 0) {
    return { question: "", answer: "" };
  }

  const questionData = randomizedQuestions.value[currentQuestion.value];
  return {
    question: questionData.question || "",
    answer: questionData.answer || "",
  };
}

function calculateScore(timeRemaining, isCorrect) {
  if (!isCorrect) return 0;

  const baseScore = 100;
  const timeBonus = timeRemaining * 10;
  const difficultyBonus = baseScore * (selectedDifficulty.value.multiplier - 1);

  return Math.round(baseScore + timeBonus + difficultyBonus);
}

async function checkNicknameAvailability(nickname) {
  try {
    const participantsCollection = collection(db, "participants");
    const q = query(participantsCollection, where("nickname", "==", nickname));
    const querySnapshot = await getDocs(q);

    return querySnapshot.empty;
  } catch (error) {
    console.error("Error checking nickname availability:", error);
    return false;
  }
}

async function startGame() {
  if (!currentNickname.value.trim()) {
    alert("Please enter your nickname!");
    return;
  }

  if (!totalQuestions.value || totalQuestions.value < 1) {
    alert("Please enter a valid number of questions!");
    return;
  }

  isStartingGame.value = true;

  try {
    const isNicknameAvailable = await checkNicknameAvailability(
      currentNickname.value.trim()
    );

    if (!isNicknameAvailable) {
      alert("This nickname is already taken! Please choose another one.");
      isStartingGame.value = false;
      return;
    }

    prepareRandomizedQuestions();

    if (randomizedQuestions.value.length === 0) {
      alert("No questions available for selected game mode!");
      isStartingGame.value = false;
      return;
    }

    const now = new Date().getTime();

    await setDoc(doc(db, "participants", newId), {
      nickname: currentNickname.value.trim(),
      gameMode: gameModeRef.value,
      totalQuestions: totalQuestions.value,
      correctAnswers: 0,
      accuracyPercentage: 0,
      totalScore: 0,
      isWinner: false,
      difficulty: selectedDifficulty.value,
      createdAt: now,
    });

    gameState.value = "playing";
    score.value = 0;
    currentQuestion.value = 0;
    correctAnswers.value = 0;
    timeLeft.value = selectedDifficulty.value.timePerQuestion;
    isProcessingAnswer.value = false;

    currentQuestionData.value = getCurrentQuestion();

    startTimer();

    setTimeout(() => {
      answerInput.value?.focus();
    }, 100);
  } catch (error) {
    console.error("Error starting game:", error);
    alert("Failed to start game. Please try again.");
  } finally {
    isStartingGame.value = false;
  }
}

function startTimer() {
  if (timer) {
    clearInterval(timer);
  }

  timer = setInterval(() => {
    if (isProcessingAnswer.value) return;

    timeLeft.value--;
    if (timeLeft.value <= 0) {
      submitAnswer();
    }
  }, 1000);
}

function submitAnswer() {
  if (isProcessingAnswer.value) return;

  isProcessingAnswer.value = true;
  clearInterval(timer);

  const userAnswerNormalized = userAnswer.value.trim().toLowerCase();
  const correctAnswerNormalized = currentQuestionData.value.answer
    .toString()
    .toLowerCase();

  const isCorrect = userAnswerNormalized === correctAnswerNormalized;

  if (isCorrect) {
    correctAnswers.value++;
    const questionScore = calculateScore(timeLeft.value, true);
    score.value += questionScore;
    feedback.value = {
      correct: true,
      message: `Correct! +${questionScore} points! 🎉`,
    };
  } else {
    playFalseAnswerAudio();
    feedback.value = {
      correct: false,
      message: `Wrong! The answer was ${currentQuestionData.value.answer}`,
    };
  }

  setTimeout(() => {
    feedback.value = null;
    isProcessingAnswer.value = false;
    nextQuestion();
  }, 1500);
}

function nextQuestion() {
  currentQuestion.value++;
  userAnswer.value = "";

  if (currentQuestion.value >= totalQuestions.value) {
    finishGame();
  } else {
    currentQuestionData.value = getCurrentQuestion();
    timeLeft.value = selectedDifficulty.value.timePerQuestion;
    startTimer();
    setTimeout(() => {
      answerInput.value?.focus();
    }, 100);
  }
}

async function finishGame() {
  gameState.value = "finished";
  clearInterval(timer);
  isProcessingAnswer.value = false;

  const accuracy = (correctAnswers.value / totalQuestions.value) * 100;
  const isWinner =
    accuracy >= 70 && correctAnswers.value > totalQuestions.value / 2;

  if (isWinner) {
    playWinnerAudio();
  } else {
    playGameOverAudio();
  }

  if (score.value > bestScore.value) {
    bestScore.value = score.value;

    await updateDoc(participantsRef, {
      correctAnswers: correctAnswers.value,
      accuracyPercentage: accuracy,
      totalScore: score.value,
      isWinner,
    });
  }
}

function resetGame() {
  gameState.value = "menu";

  clearInterval(timer);
  isProcessingAnswer.value = false;
  isStartingGame.value = false;
  randomizedQuestions.value = [];
  currentQuestionData.value = { question: "", answer: "" };

  if (gameOverAudio) {
    gameOverAudio.pause();
    gameOverAudio.currentTime = 0;
  }

  if (winnerAudio) {
    winnerAudio.pause();
    winnerAudio.currentTime = 0;
  }

  if (falseAnswerAudio) {
    falseAnswerAudio.pause();
    falseAnswerAudio.currentTime = 0;
  }

  currentNickname.value = "";
}

function getPerformanceMessage() {
  const percentage = accuracyPercentage.value;
  if (percentage === 100) return "Perfect! You're a math genius! 🏆";
  if (percentage >= 90) return "Outstanding! Almost perfect! 🌟";
  if (percentage >= 80) return "Excellent work! Keep it up! 🎯";
  if (percentage >= 70) return "Good job! You're doing great! 👍";
  if (percentage >= 60) return "Not bad! Keep practicing! 💪";
  if (percentage >= 50) return "You're getting there! Don't give up! 🎓";
  return "Keep practicing, you'll get better! 📚";
}

onMounted(async () => {
  console.log("Component mounted. Loading audio files...");

  try {
    const [loadedGameOver, loadedWinner, loadedFalseAnswer] = await Promise.all(
      [
        preloadAudio(gameOverSound),
        preloadAudio(winnerSound),
        preloadAudio(falseAnswerSound),
      ]
    );

    gameOverAudio = loadedGameOver;
    winnerAudio = loadedWinner;
    falseAnswerAudio = loadedFalseAnswer;

    console.log("✅ All audio files loaded successfully!");
  } catch (error) {
    console.error("Failed to load audio files:", error);
  }
});
</script>
