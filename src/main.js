import "./style.css";

import { VueFire } from "vuefire";
import { createApp } from "vue";

import App from "./App.vue";

import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { app } from "./configs/firebase";

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});

createApp(App)
  .use(router)
  .use(VueFire, {
    firebaseApp: app,
    modules: [],
  })
  .mount("#app");
