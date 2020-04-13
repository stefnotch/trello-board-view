import { createApp } from "vue";
import App from "./App.vue";
import * as OfflinePluginRuntime from "offline-plugin/runtime";
OfflinePluginRuntime.install();

createApp(App).mount("#app");
