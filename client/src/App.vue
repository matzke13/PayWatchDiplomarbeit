<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router"; // Router importieren
import { useQuasar } from "quasar";
import { useMyStore } from "./stores/myStore"; // Store importieren

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const loginDialog = ref(false); // Kontrolle für das Anmeldemodal

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value;
};

// Store- und Router-Instanzen
const myStore = useMyStore();
const router = useRouter();

// Beim Laden der App prüfen, ob ein Token vorhanden ist
onMounted(() => {
  // Token aus der URL extrahieren und ggf. weiterleiten
  myStore.extractTokenFromUrlFragment();
});
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.q-dialog__backdrop {
  background-color: rgba(0, 0, 0, 0.8);
}
/* Einbindung der Inter-Schriftart */
@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter/static/Inter_18pt-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter/static/Inter_18pt-Bold.ttf") format("truetype");
  font-weight: bold;
  font-style: normal;
}

@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter/static/Inter_18pt-Italic.ttf") format("truetype");
  font-weight: normal;
  font-style: italic;
}

@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter/static/Inter_18pt-BoldItalic.ttf") format("truetype");
  font-weight: bold;
  font-style: italic;
}

/* Globale Schriftart setzen */
* {
  font-family: "Inter", sans-serif;
}

</style>
