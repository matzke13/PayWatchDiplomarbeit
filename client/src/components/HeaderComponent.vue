<template>
  <div class="header-bg text-white q-pa-md q-mb-lg full-width row items-center justify-center">
    <div class="row items-center">
      <!-- Begrüßung mit Vornamen -->
      <div class="text-h5 q-mr-md">
        <b>Hallo {{ firstName }}!</b>
      </div>
      <!-- Profilbild anzeigen, wenn online und Bild vorhanden -->
      <img
        v-if="isOnline && userProfilePic"
        :src="userProfilePic"
        alt="Profile Picture"
        class="profile-pic cursor-pointer"
        @click="openDeleteDialog"
      />
      <!-- Standard-Icon, falls offline oder kein Profilbild vorhanden -->
      <q-icon
        v-else
        name="account_circle"
        size="xl"
        class="cursor-pointer"
        @click="openDeleteDialog"
      />
    </div>
  </div>

  <!-- Dialog zum Profil löschen -->
  <q-dialog v-model="showDeleteDialog">
    <q-card class="rounded-borders">
      <q-card-section>
        <div class="text-h6">Profil löschen</div>
        <div>Möchtest du dein Profil wirklich löschen?</div>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat label="Abbrechen" color="grey" @click="closeDeleteDialog" />
        <q-btn class="same-width-btn" style="background-color: #E15241;" label="Profil löschen" color="negative" @click="confirmDeleteUser" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useMyStore } from '../stores/myStore';
import { useRouter } from 'vue-router';

const myStore = useMyStore();
const router = useRouter();

// Reaktive Variablen
const userProfilePic = ref(null);
const userFullName = ref('Gast');
const isOnline = ref(navigator.onLine);
const showDeleteDialog = ref(false);

// Computed Property für den Vornamen
const firstName = computed(() => {
  return userFullName.value.split(' ')[0] || userFullName.value;
});

// Beim Komponent-Mounten Benutzer-Daten laden
onMounted(() => {
  if (myStore.userData && myStore.userData.user_metadata) {
    userProfilePic.value = myStore.userData.user_metadata.avatar_url || null;
    userFullName.value = myStore.userData.user_metadata.full_name || 'Gast';
  }
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
});

// Event-Listener beim Unmount entfernen
onBeforeUnmount(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});

function handleOnline() {
  isOnline.value = true;
}

function handleOffline() {
  isOnline.value = false;
}

// Öffnet den Lösch-Dialog
function openDeleteDialog() {
  showDeleteDialog.value = true;
}

// Schließt den Lösch-Dialog
function closeDeleteDialog() {
  showDeleteDialog.value = false;
}

// Bestätigung: Profil löschen
async function confirmDeleteUser() {
  try {
    await myStore.deleteUser();
    closeDeleteDialog();
    // Nach dem Löschen ggf. Weiterleitung zur Startseite
    router.push('/');
  } catch (error) {
    console.error('Fehler beim Löschen des Profils:', error);
  }
}
</script>

<style scoped>
.header-bg {
  background-color: #090071;
  border-radius: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 140px;
}

.profile-pic {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 10px;
}

.cursor-pointer {
  cursor: pointer;
}

.rounded-borders {
  border-radius: 24px;
}

.same-width-btn {
  width: 120px;
}

.q-btn {
  text-transform: none;
  border-radius: 24px;
  font-weight: bold;
}

</style>
