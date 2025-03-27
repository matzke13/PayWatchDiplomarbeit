<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import BottomNavbar from "../components/NavBar.vue"
import HeaderComponent from '../components/HeaderComponent.vue';
import Billanz from "../components/Billanz.vue";
import Charts from "../components/Charts.vue";
import Guthabenstand from "../components/Guthabenstand.vue";
</script>

<template>
  <q-page>
    <!-- Header -->
    <HeaderComponent />

    <Guthabenstand />
    <Charts/>

    <BottomNavbar />
  </q-page>
</template>

<style scoped>

</style>
