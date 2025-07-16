<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white"
  >
    <header class="px-6 py-4 border-b border-gray-700 select-none">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <h1 class="text-xl font-bold text-white">Multiplayer</h1>

        <div class="flex items-center gap-4">
          <div v-if="roomData" class="text-sm">
            <span class="text-gray-400">Room:</span>
            <span class="text-purple-400 font-bold ml-1">{{
              roomData.roomName
            }}</span>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-8">
      <div v-if="!roomData" class="text-center">
        <p class="text-gray-300">Loading room data...</p>
      </div>

      <div v-else>
        <!-- Waiting Room -->
        <div v-if="gameState === 'waiting'" class="text-center">
          <div class="mb-8">
            <h2 class="text-4xl font-bold mb-4 text-white">
              {{ isRoomMaster ? "Your Room" : "Waiting Room" }}
            </h2>
            <p class="text-gray-300">
              {{
                isRoomMaster
                  ? "Share this link to invite others:"
                  : "Waiting for room master to start the game"
              }}
            </p>

            <div v-if="isRoomMaster" class="mt-4 p-4 bg-gray-800 rounded-lg">
              <input
                ref="roomLinkInput"
                type="text"
                :value="roomLink"
                readonly
                class="w-full bg-gray-700 text-white p-2 rounded mb-2 text-center"
                @click="copyRoomLink"
              />
              <button
                @click="copyRoomLink"
                class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Copy Link
              </button>
            </div>
          </div>

          <div class="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold mb-4 text-gray-200">
                Players ({{ players.length }})
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="player in players"
                :key="player.id"
                class="p-4 bg-gray-700 rounded-lg flex items-center"
              >
                <div
                  class="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3"
                >
                  {{ player.nickname.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="font-semibold">{{ player.nickname }}</div>
                  <div
                    v-if="player.id === roomData.roomMaster"
                    class="text-xs text-yellow-400"
                  >
                    Room Master
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Room Master Controls -->
          <div v-if="isRoomMaster" class="max-w-2xl mx-auto space-y-5 mb-8">
            <div class="grid grid-cols-2 gap-4">
              <div class="game-mode">
                <h3 class="text-xl font-semibold mb-4 text-gray-200">
                  Game Mode
                </h3>
                <div>
                  <select
                    id="game-mode"
                    v-model="gameMode"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option v-for="mode in gameModes" :value="mode">
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

            <div class="mb-8">
              <h3 class="text-xl font-semibold mb-4 text-gray-200">
                Difficulty
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
              @click="startMultiplayerGame"
              :disabled="players.length < 2 || isStartingGame"
              class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-8 py-4 rounded-lg font-bold text-lg cursor-pointer transition-all duration-200"
            >
              <span v-if="isStartingGame"> 🔄 Starting Game... </span>
              <span v-else>Start Game ({{ players.length }}/10)</span>
            </button>
          </div>
        </div>

        <!-- Game Playing -->
        <div v-else-if="gameState === 'playing'" class="text-center">
          <!-- Same game UI as your single player -->
          <!-- You can reuse the same template from your Home.vue -->
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
                :style="{
                  width: `${(currentQuestion / totalQuestions) * 100}%`,
                }"
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

        <!-- Game Finished -->
        <div v-else-if="gameState === 'finished'" class="text-center">
          <div class="mb-8">
            <h2 class="text-4xl font-bold mb-4 text-white">Game Results</h2>

            <div class="bg-gray-800 rounded-xl p-8 mb-6 border border-gray-700">
              <h3 class="text-xl font-semibold mb-4 text-gray-200">
                Your Score
              </h3>
              <div class="grid grid-cols-3 gap-6 text-center mb-6">
                <div>
                  <div class="text-3xl font-bold text-green-400">
                    {{ playerScore }}
                  </div>
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

              <h3 class="text-xl font-semibold mb-4 text-gray-200">
                Leaderboard
              </h3>
              <div class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead class="border-b border-gray-700">
                    <tr>
                      <th class="pb-2">Rank</th>
                      <th class="pb-2">Player</th>
                      <th class="pb-2">Score</th>
                      <th class="pb-2">Correct</th>
                      <th class="pb-2">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(player, index) in sortedPlayers"
                      :key="player.id"
                      :class="[
                        'border-b border-gray-700',
                        player.id === userId ? 'bg-gray-700' : '',
                      ]"
                    >
                      <td class="py-3">{{ index + 1 }}</td>
                      <td class="py-3 flex items-center">
                        <div
                          class="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mr-2"
                        >
                          {{ player.nickname.charAt(0).toUpperCase() }}
                        </div>
                        {{ player.nickname }}
                        <span
                          v-if="player.id === roomData.roomMaster"
                          class="text-xs text-yellow-400 ml-2"
                          >(Host)</span
                        >
                      </td>
                      <td class="py-3">{{ player.score || 0 }}</td>
                      <td class="py-3">
                        {{ player.correctAnswers || 0 }}/{{ totalQuestions }}
                      </td>
                      <td class="py-3">
                        {{
                          Math.round(
                            ((player.correctAnswers || 0) / totalQuestions) *
                              100
                          )
                        }}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <button
              @click="leaveRoom"
              class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../configs/firebase";
import { nanoid } from "nanoid";
import baseQuestion from "../datas/math_questions.json";

const route = useRoute();
const router = useRouter();

const roomId = route.params.roomId;
const userId = ref(null);

const gameState = ref("waiting");
const roomData = ref(null);
const players = ref([]);
const isRoomMaster = ref(false);
const roomLink = ref("");
const isJoining = ref(false);
const joinNotification = ref(null);

const gameMode = ref("addition");
const totalQuestions = ref(10);
const selectedDifficulty = ref({
  name: "Medium",
  timePerQuestion: 7,
  multiplier: 2,
});

const currentQuestion = ref(0);
const timeLeft = ref(0);
const correctAnswers = ref(0);
const userAnswer = ref("");
const feedback = ref(null);
const answerInput = ref(null);
const playerScore = ref(0);
const isProcessingAnswer = ref(false);
const isStartingGame = ref(false);

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

const difficulties = [
  { name: "Fetus", timePerQuestion: 60, multiplier: 1 },
  { name: "Baby", timePerQuestion: 30, multiplier: 1.2 },
  { name: "Easy", timePerQuestion: 10, multiplier: 1.5 },
  { name: "Medium", timePerQuestion: 7, multiplier: 2 },
  { name: "Hard", timePerQuestion: 5, multiplier: 2.5 },
  { name: "Tidak Ngotak", timePerQuestion: 3, multiplier: 3 },
];

let timer = null;
let roomUnsubscribe = null;
let playersUnsubscribe = null;
let gameUnsubscribe = null;

const currentQuestionData = ref({
  question: "",
  answer: "",
});

const currentNickname = localStorage.getItem("nickname") || "";

const accuracyPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0;
  return Math.round((correctAnswers.value / totalQuestions.value) * 100);
});

const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => (b.score || 0) - (a.score || 0));
});

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

function getMaxQuestions() {
  if (
    !baseQuestion[gameMode.value] ||
    !baseQuestion[gameMode.value].questions
  ) {
    return 0;
  }
  return baseQuestion[gameMode.value].questions.length;
}

function handleInput(e) {
  const sanitizedValue = e.target.value.replace(/[^0-9.-/-]/g, "");
  userAnswer.value = sanitizedValue;
}

function copyRoomLink() {
  navigator.clipboard.writeText(roomLink.value);
  alert("Room link copied to clipboard!");
}

function initializeUserId() {
  const storageKey = `userId_${roomId}`;
  let storedUserId = localStorage.getItem(storageKey);

  if (!storedUserId) {
    storedUserId = nanoid();
    localStorage.setItem(storageKey, storedUserId);
  }

  userId.value = storedUserId;
}

async function joinRoom() {
  if (!currentNickname) {
    alert("Please set your nickname first!");
    router.push("/multiplayer");
    return;
  }

  if (isJoining.value) return;
  isJoining.value = true;

  const roomRef = doc(db, "multiplayer_rooms", roomId);
  const playerRef = doc(roomRef, "players", userId.value);

  try {
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) {
      alert("Room does not exist!");
      router.push("/multiplayer");
      return;
    }

    const playerSnap = await getDoc(playerRef);
    if (playerSnap.exists()) {
      console.log("Player already exists in room");
      setupRoomListeners();
      return;
    }

    await setDoc(playerRef, {
      nickname: currentNickname,
      joinedAt: serverTimestamp(),
      score: 0,
      correctAnswers: 0,
      isReady: false,
      userId: userId.value,
    });

    setupRoomListeners();
  } catch (error) {
    console.error("Error joining room:", error);
    alert("Failed to join room. Please try again.");
  } finally {
    isJoining.value = false;
  }
}

function setupRoomListeners() {
  const roomRef = doc(db, "multiplayer_rooms", roomId);

  roomUnsubscribe = onSnapshot(roomRef, async (doc) => {
    if (doc.exists()) {
      const newData = doc.data();
      roomData.value = newData;

      isRoomMaster.value = newData.roomMaster === userId.value;
      roomLink.value = `${window.location.origin}/multiplayer/${roomId}`;

      if (newData.gameState !== gameState.value) {
        gameState.value = newData.gameState;

        if (gameState.value === "playing") {
          startGameForPlayer();
          if (isRoomMaster.value) {
            startLocalTimer();
          }
        } else if (gameState.value === "finished") {
          endGameForPlayer();
        }
      }

      if (newData.currentQuestionData) {
        currentQuestionData.value = newData.currentQuestionData;
      }

      if (newData.timeLeft !== undefined) {
        timeLeft.value = newData.timeLeft;
      }

      if (newData.currentQuestion !== undefined) {
        currentQuestion.value = newData.currentQuestion;
      }
    }
  });

  const playersRef = collection(roomRef, "players");
  playersUnsubscribe = onSnapshot(playersRef, (snapshot) => {
    const previousPlayerCount = players.value.length;
    const previousPlayers = [...players.value];

    players.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (players.value.length > previousPlayerCount && previousPlayerCount > 0) {
      const newPlayers = players.value.filter(
        (p) => !previousPlayers.some((prev) => prev.id === p.id)
      );

      newPlayers.forEach((newPlayer) => {
        if (newPlayer.id !== userId.value) {
          showJoinNotification(`${newPlayer.nickname} joined the room!`);
        }
      });
    }

    handleRoomMasterReassignment();
  });
}

async function handleRoomMasterReassignment() {
  if (!roomData.value) return;

  const currentRoomMaster = roomData.value.roomMaster;
  const roomMasterExists = players.value.some(
    (p) => p.id === currentRoomMaster
  );

  if (!roomMasterExists && players.value.length > 0) {
    const seniorPlayer = players.value.reduce((senior, current) => {
      if (!senior.joinedAt) return current;
      if (!current.joinedAt) return senior;

      return current.joinedAt.toMillis() < senior.joinedAt.toMillis()
        ? current
        : senior;
    });

    if (seniorPlayer.id === userId.value) {
      console.log("Reassigning room master to:", seniorPlayer.nickname);

      try {
        const roomRef = doc(db, "multiplayer_rooms", roomId);
        await updateDoc(roomRef, {
          roomMaster: seniorPlayer.id,
        });
      } catch (error) {
        console.error("Error reassigning room master:", error);
      }
    }
  }
}

function showJoinNotification(message) {
  joinNotification.value = message;
  setTimeout(() => {
    joinNotification.value = null;
  }, 3000);
}

async function startMultiplayerGame() {
  if (!isRoomMaster.value) return;

  isStartingGame.value = true;

  try {
    const roomRef = doc(db, "multiplayer_rooms", roomId);
    const firstQuestion = getQuestion(0);

    await updateDoc(roomRef, {
      gameState: "playing",
      gameSettings: {
        gameMode: gameMode.value,
        totalQuestions: totalQuestions.value,
        difficulty: selectedDifficulty.value,
      },
      startedAt: serverTimestamp(),
      currentQuestion: 0,
      timeLeft: selectedDifficulty.value.timePerQuestion,
      currentQuestionData: firstQuestion,
    });

    startLocalTimer();
  } catch (error) {
    console.error("Error starting game:", error);
    alert("Failed to start game. Please try again.");
  } finally {
    isStartingGame.value = false;
  }
}

function startLocalTimer() {
  clearInterval(timer);

  timer = setInterval(async () => {
    if (!isRoomMaster.value) return;

    const roomRef = doc(db, "multiplayer_rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists() || roomSnap.data().gameState !== "playing") {
      clearInterval(timer);
      return;
    }

    const currentData = roomSnap.data();
    const newTimeLeft = currentData.timeLeft - 1;

    if (newTimeLeft <= 0) {
      const nextQuestion = currentData.currentQuestion + 1;

      if (nextQuestion >= totalQuestions.value) {
        await updateDoc(roomRef, {
          gameState: "finished",
          finishedAt: serverTimestamp(),
        });

        clearInterval(timer);
      } else {
        const nextQuestionData = getQuestion(nextQuestion);
        await updateDoc(roomRef, {
          currentQuestion: nextQuestion,
          timeLeft: selectedDifficulty.value.timePerQuestion,
          currentQuestionData: nextQuestionData,
        });
      }
    } else {
      await updateDoc(roomRef, {
        timeLeft: newTimeLeft,
      });
    }
  }, 1000);
}

function startGameForPlayer() {
  currentQuestion.value = 0;
  correctAnswers.value = 0;
  playerScore.value = 0;
  userAnswer.value = "";

  setTimeout(() => {
    answerInput.value?.focus();
  }, 100);
}

function getQuestion(index) {
  const questions = baseQuestion[gameMode.value]?.questions || [];
  const question = questions[index % questions.length];
  return {
    question: question.question,
    answer: question.answer.toString(),
  };
}

async function submitAnswer() {
  if (isProcessingAnswer.value) return;

  isProcessingAnswer.value = true;

  const userAnswerNormalized = userAnswer.value.trim().toLowerCase();
  const isCorrect =
    userAnswerNormalized === currentQuestionData.value.answer.toLowerCase();

  if (isCorrect) {
    correctAnswers.value++;
    const questionScore = calculateScore(timeLeft.value, true);
    playerScore.value += questionScore;

    feedback.value = {
      correct: true,
      message: `Correct! +${questionScore} points! 🎉`,
    };
  } else {
    feedback.value = {
      correct: false,
      message: `Wrong! The answer was ${currentQuestionData.value.answer}`,
    };
  }

  const playerRef = doc(
    db,
    "multiplayer_rooms",
    roomId,
    "players",
    userId.value
  );

  await updateDoc(playerRef, {
    score: playerScore.value,
    correctAnswers: correctAnswers.value,
  });

  setTimeout(() => {
    feedback.value = null;
    isProcessingAnswer.value = false;
    userAnswer.value = "";
  }, 1500);
}

function calculateScore(timeRemaining, isCorrect) {
  if (!isCorrect) return 0;

  const baseScore = 100;
  const timeBonus = timeRemaining * 10;
  const difficultyBonus = baseScore * (selectedDifficulty.value.multiplier - 1);

  return Math.round(baseScore + timeBonus + difficultyBonus);
}

function endGameForPlayer() {
  clearInterval(timer);
  isProcessingAnswer.value = false;
}

async function leaveRoom() {
  if (roomUnsubscribe) roomUnsubscribe();
  if (playersUnsubscribe) playersUnsubscribe();
  if (gameUnsubscribe) gameUnsubscribe();
  clearInterval(timer);

  if (roomData.value) {
    const playerRef = doc(
      db,
      "multiplayer_rooms",
      roomId,
      "players",
      userId.value
    );

    try {
      await deleteDoc(playerRef);

      if (isRoomMaster.value) {
        const remainingPlayers = players.value.filter(
          (p) => p.id !== userId.value
        );

        if (remainingPlayers.length > 0) {
          const newMaster = remainingPlayers.reduce((senior, current) => {
            if (!senior.joinedAt) return current;
            if (!current.joinedAt) return senior;

            return current.joinedAt.toMillis() < senior.joinedAt.toMillis()
              ? current
              : senior;
          });

          const roomRef = doc(db, "multiplayer_rooms", roomId);
          await updateDoc(roomRef, {
            roomMaster: newMaster.id,
          });
        } else {
          const roomRef = doc(db, "multiplayer_rooms", roomId);
          await deleteDoc(roomRef);
        }
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  }

  localStorage.removeItem(`userId_${roomId}`);
  router.push("/multiplayer");
}

onMounted(() => {
  initializeUserId();
  joinRoom();
});

onUnmounted(() => {
  if (roomUnsubscribe) roomUnsubscribe();
  if (playersUnsubscribe) playersUnsubscribe();
  if (gameUnsubscribe) gameUnsubscribe();
  clearInterval(timer);
});
</script>
