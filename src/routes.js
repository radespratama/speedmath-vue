import HomePage from "./pages/Home.vue";
import LeaderboardPage from "./pages/Leaderboard.vue";
import MultiplayerPage from "./pages/Multiplayer.vue";
import MultiplayerRoomPage from "./pages/MultiplayerRoom.vue";

export const routes = [
  {
    path: "/",
    name: "homePage",
    component: HomePage,
  },
  {
    path: "/leaderboard",
    name: "leaderboard",
    component: LeaderboardPage,
  },
  {
    path: "/multiplayer",
    name: "multiplayer",
    component: MultiplayerPage,
  },
  {
    path: "/multiplayer/:roomId",
    name: "multiplayer-room",
    component: MultiplayerRoomPage,
  },
];
