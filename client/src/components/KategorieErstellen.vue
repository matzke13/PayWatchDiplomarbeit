<template>
  <q-card class="q-pa-md rounded-borders shadow" style="max-width: 500px; margin: 0 auto;">
    <q-card-section>
      <q-input
        v-model="categoryName"
        placeholder="Name"
        filled
        class="q-mb-md"
      />
      <div class="preset-colors-container q-mb-md">
        <div
          v-for="color in presetColors"
          :key="color"
          class="color-circle"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
        >
          <q-icon
            v-if="categoryColor === color"
            name="check"
            size="20px"
            color="white"
          />
        </div>
      </div>
    </q-card-section>
    <q-card-actions align="center" class="q-gutter-sm">
      <q-btn flat label="Abbrechen" color="grey" @click="cancel" class="rounded-borders no-uppercase same-width-btn" />
      <q-btn
        label="Erstellen"
        color="primary"
        @click="createCategory"
        class="rounded-borders no-uppercase same-width-btn"
        :disable="!isFormValid"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits } from 'vue';
import { Notify } from 'quasar';
import { useMyStore } from '@/stores/myStore';

const emit = defineEmits(['close']);

const categoryName = ref('');
const categoryColor = ref('');

// Statt eines festen Arrays wird presetColors als reaktive Variable definiert
const presetColors = ref([]);

// Funktion zur Generierung eines zufälligen Hex-Farbwerts
const generateRandomColor = () => {
  const color = Math.floor(Math.random() * 16777215).toString(16);
  return '#' + ('000000' + color).slice(-6);
};

// Erzeugt ein Array mit einer vorgegebenen Anzahl zufälliger Farben
const generatePresetColors = (count = 3) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(generateRandomColor());
  }
  return colors;
};

// Beim Mounten der Komponente werden die Farben neu generiert
onMounted(() => {
  presetColors.value = generatePresetColors(3);
});

const myStore = useMyStore();

const selectColor = (color) => {
  categoryColor.value = color;
};

// Formular ist valide, wenn ein Name eingegeben wurde und eine der zufällig generierten Farben ausgewählt ist
const isFormValid = computed(() => {
  return categoryName.value.trim() !== '' && presetColors.value.includes(categoryColor.value);
});

const createCategory = async () => {
  try {
    await myStore.createUserCategory({
      name: categoryName.value,
      color: categoryColor.value
    });
    // Felder zurücksetzen
    categoryName.value = '';
    categoryColor.value = '';
    // Kategorien neu laden
    await myStore.fetchUserCategories();
    
    // Erfolgsmeldung
    Notify.create({
      message: 'Erfolgreich erstellt!',
      color: 'green',
      position: 'top',
      timeout: 2000,
      icon: 'check'
    });
    
    emit('close'); // Dialog schließen
  } catch (error) {
    console.error('Fehler beim Erstellen der Kategorie:', error);
  }
};

const cancel = () => {
  emit('close'); // Dialog schließen
};
</script>

<style scoped>
.rounded-borders {
  border-radius: 24px;
}
.shadow {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}
.preset-colors-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  justify-items: center;
}
.color-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 1.5px solid #000000;
  display: flex;
  justify-content: center;
  align-items: center;
}
.same-width-btn {
  width: 120px;
}
.no-uppercase {
  text-transform: none !important;
}
</style>
