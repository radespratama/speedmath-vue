import HomePage from "./pages/Home.vue";
import LeaderboardPage from "./pages/Leaderboard.vue";
import MultiplayerPage from "./pages/Multiplayer.vue";

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
];
