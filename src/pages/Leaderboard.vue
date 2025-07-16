<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white"
  >
    <header class="px-6 py-4 border-b border-gray-700 select-none">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <RouterLink
          to="/"
          class="text-sm underline underline-offset-4 hover:no-underline"
        >
          Back to Home
        </RouterLink>

        <h1 class="text-3xl font-bold text-white">Leaderboard</h1>
      </div>
    </header>

    <main class="max-w-4xl mx-auto py-8">
      <div class="relative overflow-x-auto">
        <table
          class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead
            class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
          >
            <tr>
              <th scope="col" class="px-6 py-3">Ranking</th>
              <th scope="col" class="px-6 py-3">Nickname</th>
              <th scope="col" class="px-6 py-3">Game Mode</th>
              <th scope="col" class="px-6 py-3">Total Score</th>
              <th scope="col" class="px-6 py-3">Accuracy</th>
              <th scope="col" class="px-6 py-3">Questions</th>
              <th scope="col" class="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(participant, index) in sortedParticipants"
              :key="participant.nickname + index"
              class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
            >
              <th
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                #{{ index + 1 }}
              </th>
              <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                {{ participant.nickname }}
              </td>
              <td class="px-6 py-4">
                {{ formatGameMode(participant.gameMode) }}
              </td>
              <td class="px-6 py-4 font-bold text-blue-400">
                {{ participant.totalScore }}
              </td>
              <td class="px-6 py-4">
                <span :class="getAccuracyColor(participant.accuracyPercentage)">
                  {{ participant.accuracyPercentage }}%
                </span>
              </td>
              <td class="px-6 py-4">
                {{ participant.correctAnswers }}/{{
                  participant.totalQuestions
                }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="
                    participant.isWinner
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  "
                  class="text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  {{ participant.isWinner ? "Winner" : "Player" }}
                </span>
              </td>
            </tr>
            <tr v-if="participants.length === 0">
              <td
                colspan="7"
                class="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
              >
                No participants yet...
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gray-800 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-400">Total Players</h3>
          <p class="text-2xl font-bold text-white">
            {{ participants?.length ?? 0 }}
          </p>
        </div>
        <div class="bg-gray-800 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-400">Winners</h3>
          <p class="text-2xl font-bold text-green-400">
            {{ winnersCount ?? 0 }}
          </p>
        </div>
        <div class="bg-gray-800 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-400">Average Score</h3>
          <p class="text-2xl font-bold text-blue-400">
            {{ averageScore ?? 0 }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { db } from "../configs/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const participants = ref([]);
const participantsCollectionRef = collection(db, "participants");

let unsubscribe = null;

const sortedParticipants = computed(() => {
  return [...participants.value].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return b.accuracyPercentage - a.accuracyPercentage;
  });
});

const winnersCount = computed(() => {
  return participants.value.filter((p) => p.isWinner).length;
});

const averageScore = computed(() => {
  if (participants.value.length === 0) return 0;
  const total = participants.value.reduce((sum, p) => sum + p.totalScore, 0);
  return Math.round(total / participants.value.length);
});

const formatGameMode = (mode) => {
  const modes = {
    addition: "Addition",
    subtraction: "Subtraction",
    multiplication: "Multiplication",
    division: "Division",
  };
  return modes[mode] || mode;
};

const getAccuracyColor = (percentage) => {
  if (percentage >= 80) return "text-green-400";
  if (percentage >= 60) return "text-yellow-400";
  return "text-red-400";
};

onMounted(() => {
  unsubscribe = onSnapshot(
    participantsCollectionRef,
    (snapshot) => {
      const datas = [];
      snapshot.forEach((doc) => {
        datas.push(doc.data());
      });
      participants.value = datas;
      console.log("Real-time data update:", datas);
    },
    (error) => {
      console.error("Error listening to participants:", error);
    }
  );
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>
