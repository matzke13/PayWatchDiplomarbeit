<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useMyStore } from "../stores/myStore"; // Importiere den Pinia-Store
import BottomNavbar from "../components/NavBar.vue";

const myStore = useMyStore();
const router = useRouter();

// Funktion zum Extrahieren des Access Tokens aus dem URL-Fragment
const extractTokenFromUrlFragment = () => {
  const hash = window.location.hash.substring(1); // Entferne das `#`
  const params = new URLSearchParams(hash); // Verwende URLSearchParams für das Fragment
  const accessToken = params.get("access_token"); // Hole den access_token
  console.log(accessToken);
  if (accessToken) {
    // Speichere das Token im Store
    myStore.setAccessToken(accessToken);

    // Entferne das Fragment aus der URL (um die URL sauber zu halten)
    window.history.replaceState({}, document.title, "/");

    // Benutzerdaten abrufen
    fetchUserData(accessToken);
  }
};

// Funktion zum Abrufen der Benutzerdaten vom Server
const fetchUserData = async (token) => {
  try {
    const response = await fetch("http://localhost:3000/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Sende das Token im Header
      },
    });
    const data = await response.json();

    if (response.ok) {
      // Speichere die Benutzerdaten im Store
      myStore.setUserData(data.user);
      // Leite den Benutzer zum Dashboard weiter
      router.push("/dashboard");
    } else {
      console.error("Fehler beim Abrufen der Benutzerdaten:", data.error);
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Benutzerdaten:", error);
  }
};

// Extrahiere das Token, sobald die Komponente geladen ist
onMounted(() => {
  extractTokenFromUrlFragment();
});

// Funktion für Google Login (aus dem Store)
const handleGoogleLogin = async () => {
  await myStore.loginWithGoogle(); // Ruft die Google-Login-Methode aus dem Store auf
};
</script>

<template>
  <q-page class="q-pa-md gradient-bg">
    <div class="q-pa-lg row items-center justify-center full-page">
      <q-card class="q-pa-md text-center transparent-card">
        <q-card-section>
          <img src="/icons/icon.svg" alt="" width="100px" />
        </q-card-section>

        <q-card-section>
          <q-btn
            unelevated
            rounded
            class="full-width text-bold custom-btn flex justify-start"
            size="md"
            @click="handleGoogleLogin"
          >
            <q-icon name="fa-brands fa-google" class="q-mr-sm" />
            <span>LOGIN MIT GOOGLE</span>
          </q-btn>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.q-page {
  /* Entfernt die ursprüngliche Hintergrundfarbe */
  background: none;
}

/* Neues CSS für den diagonalen Farbverlauf */
.gradient-bg {
  background: linear-gradient(
    45deg,
    #05003d,
    #0d0098
  ); /* Farbverlauf von oben links nach unten rechts */
  height: 100vh; /* Volle Höhe des Viewports */
}
.full-page {
  height: 100%; /* Vererbt die Höhe des Elternelements */
}

/* Transparenter Hintergrund für die Karte */
.transparent-card {
  background-color: transparent;
  box-shadow: none; /* Optional: Entfernt den Schatten, falls er nicht benötigt wird */
  color: white;
}

.custom-btn {
  color: white;
  background-color: none;
  border: white 1px solid;
}

.custom-btn:active {
  background-color: white;
  color: #05003d;
}

.myButton:hover {
  background-color: white;
  color: #05003d;
}
</style>
