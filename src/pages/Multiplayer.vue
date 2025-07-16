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

        <div class="flex items-center">
          <h1 class="text-xl font-bold text-white border-r pr-3">
            Multiplayer
          </h1>
          <p class="text-lg font-medium text-gray-400 ml-2">
            {{ currentNickname || "Guest" }}
          </p>
        </div>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-6 py-8">
      <div class="text-center mb-8">
        <h2 class="text-4xl font-bold mb-4 text-white">Multiplayer Mode</h2>
        <p class="text-gray-300">
          Challenge your friends in real-time math battles!
        </p>
      </div>

      <div class="bg-gray-800 rounded-xl p-8 border border-gray-700">
        <div v-if="!currentNickname" class="mb-6">
          <h3 class="text-xl font-semibold mb-4 text-gray-200">
            Your Nickname
          </h3>

          <input
            type="text"
            id="current_nickname"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Pak Pacul"
            v-model="nicknameInput"
            required
          />

          <button
            @click="saveNickname"
            class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg w-full mt-4"
          >
            Save Nickname
          </button>
        </div>

        <div v-else>
          <div class="mb-6 space-y-4">
            <h3 class="text-xl font-semibold text-gray-200">Create New Room</h3>

            <input
              type="text"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Room name"
              v-model="roomName"
              required
            />

            <button
              @click="createRoom"
              class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg w-full"
            >
              Create Room
            </button>
          </div>

          <div class="flex items-center my-4">
            <div class="flex-grow border-t border-gray-600"></div>
            <span class="mx-4 text-gray-400">OR</span>
            <div class="flex-grow border-t border-gray-600"></div>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-semibold text-gray-200">
              Join Existing Room
            </h3>

            <input
              type="text"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter room code"
              v-model="roomCode"
              required
            />

            <button
              @click="joinRoom"
              class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg w-full"
            >
              Join Room
            </button>
          </div>

          <div class="mt-10">
            <button
              @click="logoutAndCleanUp"
              class="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg w-full"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <p class="text-gray-800 dark:text-white font-semibold text-lg">
          Feature Multiplayer Mode is currently in development and to many bugs
          are present. 🙏
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { nanoid } from "nanoid";
import { useRouter } from "vue-router";
import { doc, serverTimestamp, runTransaction } from "firebase/firestore";

import { db } from "../configs/firebase";

const router = useRouter();
const currentNickname = ref(localStorage.getItem("nickname") || "");
const nicknameInput = ref("");
const roomName = ref("");
const roomCode = ref("");
const isCreatingRoom = ref(false);

function saveNickname() {
  if (!nicknameInput.value.trim()) return;

  const newNickname = nicknameInput.value.trim();
  localStorage.setItem("nickname", newNickname);
  currentNickname.value = newNickname;
}

async function createRoom() {
  if (!roomName.value.trim()) {
    alert("Please enter a room name");
    return;
  }

  if (!currentNickname.value) {
    alert("Please set your nickname first!");
    return;
  }

  if (isCreatingRoom.value) return;
  isCreatingRoom.value = true;

  const roomId = nanoid(6).toUpperCase();
  const userId = nanoid();

  try {
    const roomRef = doc(db, "multiplayer_rooms", roomId);
    const playerRef = doc(roomRef, "players", userId);

    await runTransaction(db, async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      if (roomSnap.exists()) {
        throw new Error("Room already exists");
      }

      transaction.set(roomRef, {
        roomName: roomName.value.trim(),
        roomMaster: userId,
        createdAt: serverTimestamp(),
        gameState: "waiting",
        playersCount: 1,
      });

      transaction.set(playerRef, {
        nickname: currentNickname.value,
        joinedAt: serverTimestamp(),
        isReady: true,
        userId: userId,
        score: 0,
        correctAnswers: 0,
      });
    });

    localStorage.setItem(`userId_${roomId}`, userId);

    await router.push(`/multiplayer/${roomId}`);
  } catch (error) {
    console.error("Error in room creation:", error);

    if (error.message === "Room already exists") {
      alert("Room already exists! Please try again.");
    } else {
      alert("Failed to create room. Please try again.");
    }
  } finally {
    isCreatingRoom.value = false;
  }
}

function logoutAndCleanUp() {
  localStorage.removeItem("nickname");

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("userId_")) localStorage.removeItem(key);
  });

  currentNickname.value = "";
}

function joinRoom() {
  if (!roomCode.value.trim()) {
    alert("Please enter a room code");
    return;
  }

  if (!currentNickname.value) {
    alert("Please set your nickname first!");
    return;
  }

  router.push(`/multiplayer/${roomCode.value.trim().toUpperCase()}`);
}
</script>
