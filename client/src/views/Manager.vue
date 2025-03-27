<script setup>
import BottomNavbar from "../components/NavBar.vue";
import HeaderComponent from "../components/HeaderComponent.vue";
import Guthabenstand from "../components/Guthabenstand.vue";
import GuthabenTabelle from "../components/GuthabenTabelle.vue";
</script>

<template>
  <q-page>
    <!-- Header -->
    <HeaderComponent />

    <!-- Guthabenstand -->
    <Guthabenstand />

    <!-- Abstand zwischen Card und Tabelle -->
    <div class="table-wrapper">
      <GuthabenTabelle />
    </div>

    <!-- Bottom Navbar -->
    <BottomNavbar />
  </q-page>
</template>

<style scoped>
.table-wrapper {
  margin-top: 24px; /* Hier den Abstand nach Bedarf anpassen */
}
</style>
