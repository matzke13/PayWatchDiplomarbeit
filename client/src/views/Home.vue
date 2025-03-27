<script setup>
import { ref } from 'vue';
import HeaderComponent from '../components/HeaderComponent.vue';
import Guthabenstand from '../components/Guthabenstand.vue';
import BottomNavbar from "../components/NavBar.vue";
import Verwaltung from '../components/Verwaltung.vue';
import Billanz from '../components/Billanz.vue';

// Zustand für das Auge-Icon (sichtbar oder durchgestrichen)
const isEyeVisible = ref(true);
const toggleEye = () => {
  isEyeVisible.value = !isEyeVisible.value;
};

// Menü anzeigen/ausblenden
const menuVisible = ref(false);
const toggleMenu = () => {
  menuVisible.value = !menuVisible.value;
};
</script>

<template>
  <q-page>
    <HeaderComponent />

    <div class="card-gap">
      <Guthabenstand />
    </div>

    <div class="card-gap">
      <Verwaltung />
    </div>

    <div class="card-gap">
      <Billanz />
    </div>

    <BottomNavbar />
  </q-page>
</template>

<style scoped>
html, body {
  position: fixed;
  background-color: #E4E4E4;
}

.gradient-bg {
  background: linear-gradient(to bottom, #ffffff, #f2f2f2);
}

.shadow {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.text-green {
  color: #4caf50;
}

.text-red {
  color: #f44336;
}

/* Abstand zwischen den Karten */
.card-gap {
  margin-bottom: 24px;
}
</style>
