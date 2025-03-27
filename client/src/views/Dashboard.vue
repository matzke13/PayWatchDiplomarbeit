<!-- src/pages/Dashboard.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="q-pa-lg row items-center justify-center">
      <q-card class="q-pa-md text-center">
        <q-card-section>
          <div class="text-h5">Willkommen im Dashboard</div>
          <div class="text-subtitle2 q-mt-md">
            Angemeldet als: {{ myStore.userData?.email || 'Gast' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-btn
            label="Geschützte Inhalte abrufen"
            color="primary"
            class="q-mt-md"
            @click="myStore.getProtectedContent"
          />
        </q-card-section>

        <!-- Logout-Button hinzufügen -->
        <q-card-section>
          <q-btn
            v-if="myStore.accessToken"
            label="Abmelden"
            color="negative"
            class="q-mt-md"
            @click="myStore.logout"
          />
        </q-card-section>
      </q-card>
    </div>


  </q-page>
</template>

<script setup>
import { useMyStore } from '../stores/myStore';

const myStore = useMyStore();
</script>

<style scoped>
.q-page {
  background-color: #f5f5f5;
}
</style>
