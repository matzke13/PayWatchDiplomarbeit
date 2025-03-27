<template>
  <q-footer elevated class="bg-primary text-white">
    <q-tabs v-model="tab" dense class="justify-around" indicator-color="transparent">
      <q-tab name="home" icon="home" label="Start" class="text-capitalize" @click="onTabChange('home')" />
      <!-- Kamera-Tab: Übergibt zusätzlich das Event -->
      <q-tab name="camera" icon="photo_camera" label="Scannen" class="text-capitalize" @click="onTabChange('search', $event)" />
      <q-tab name="manager" icon="work" label="Manager" class="text-capitalize" @click="onTabChange('manager')" />
      <q-tab name="administration" icon="insert_chart" label="Charts" class="text-capitalize" @click="onTabChange('administration')" />
    </q-tabs>
  </q-footer>

  <!-- Kamera-Komponente hier einbinden -->
  <CameraDialog v-if="showCameraDialog" @close="closeCamera" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CameraDialog from '../components/CameraDialog.vue';
import { useRouter } from 'vue-router';

const tab = ref('home');  // Aktiver Tab
const showCameraDialog = ref(false);
const router = useRouter();

// Kamera öffnen
function openCamera() {
  showCameraDialog.value = true;
}

// Kamera schließen
function closeCamera() {
  showCameraDialog.value = false;
  // Aktuelle Route ermitteln
  const currentRouteName = router.currentRoute.value.name;
  // Falls der Kamerafenster-Tab (search) aktiv war, wird standardmäßig auf 'home' gewechselt.
  if (currentRouteName === 'home' || currentRouteName === 'search') {
    tab.value = 'home';
  } else if (currentRouteName === 'manager') {
    tab.value = 'manager';
  } else if (currentRouteName === 'administration') {
    tab.value = 'administration';
  }
}

// Tab-Wechsel steuern
function onTabChange(newTab, event) {
  // Für den Kamera-Tab den aktiven Zustand nicht ändern
  if (newTab === 'search') {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    openCamera(); // Öffnet den Kamera-Dialog
    return;
  }
  
  // Für alle anderen Tabs: aktiven Zustand setzen und navigieren
  tab.value = newTab;
  if (newTab === 'home') {
    router.push('/home');
  } else if (newTab === 'manager') {
    router.push('/manager');
  } else if (newTab === 'administration') {
    router.push('/administration');
  }
}

// Setze den aktiven Tab beim Laden der Seite
onMounted(() => {
  const currentRoute = router.currentRoute.value.name;
  if (currentRoute === 'home') {
    tab.value = 'home';
  } else if (currentRoute === 'search') {
    // Kamera-Dialog sollte hier nicht als aktiver Tab erscheinen
    tab.value = 'home';
  } else if (currentRoute === 'manager') {
    tab.value = 'manager';
  } else if (currentRoute === 'administration') {
    tab.value = 'administration';
  }
});
</script>

<style scoped>
.q-footer {
  bottom: 0;
  width: 100%;
}

/* Verhindert, dass die Labels in Großbuchstaben umgewandelt werden */
.text-capitalize {
  text-transform: none;
}
</style>
