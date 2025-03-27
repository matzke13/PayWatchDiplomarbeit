<template>
  <div>
    <div class="card row items-center justify-between bg-white q-pa-md q-mb-md rounded-borders shadow">
      <div>
        <div class="text-subtitle1"><b>Guthabenstand</b></div>
        <!-- Prozentanzeige seit der ersten Transaktion in dem derzeitigen Monat -->
        <div
          class="text-caption"
          :class="{
            'text-positive': monthlyPercentage >= 0,
            'text-negative': monthlyPercentage < 0
          }"
        >
          {{ monthlyPercentage >= 0 ? '+' : '-' }} {{ Math.abs(monthlyPercentage).toFixed(2) }} % in diesem Monat
        </div>
        <div class="text-h6 q-mt-xs">
          <b>{{ isEyeVisible ? formattedBalance : '* * ,* * €' }}</b>
        </div>
      </div>

      <q-icon
        :name="isEyeVisible ? 'visibility' : 'visibility_off'"
        size="lg"
        @click="toggleEye"
      />

      <div class="row items-center q-pt-md justify-center full-width">
        <q-btn
          color="green"
          label="Einzahlen"
          class="q-mr-sm same-width-btn"
          @click="openDialog('Einzahlen')"
        />
        <q-btn
          color="red"
          label="Auszahlen"
          class="same-width-btn"
          @click="openDialog('Auszahlen')"
        />
      </div>
    </div>

    <!-- Dialog für Transaktion -->
    <q-dialog
      v-model="showDialog"
      no-auto-focus
      transition-show="none"
      transition-hide="none"
    >
      <q-card
        class="q-pa-md rounded-borders shadow flex flex-center column"
        style="width: 400px; min-height: 350px;"
      >
        <q-card-section class="q-mb-sm full-width">
          <!-- Titel -->
          <q-input
            v-model="titleValue"
            label="Titel"
            filled
            class="q-mb-md"
          />

          <!-- Betrag -->
          <q-input
            v-model="amount"
            type="number"
            label="Betrag eingeben"
            filled
            class="q-mb-md"
          />

          <!-- Datum (Date-Picker) -->
          <q-input
            v-model="dateValue"
            label="Datum"
            filled
            class="q-mb-md"
            readonly
          >
            <template v-slot:append>
              <q-icon
                name="event"
                class="cursor-pointer"
                @click.stop="showDatePicker = true"
              />
              <q-popup-proxy
                v-model="showDatePicker"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="dateValue"
                  :max="maxDate"
                  :options="(date) => new Date(date) <= new Date(maxDate)"
                  mask="YYYY-MM-DD"
                  color="primary"
                  bordered
                  @update:model-value="showDatePicker = false"
                />
              </q-popup-proxy>
            </template>
          </q-input>

          <!-- Kategorie-Auswahl -->
          <template v-if="categoryOptions.length > 0">
            <q-btn-dropdown
              no-caps
              auto-close
              :label="selectedCategoryLabel"
              class="q-mb-md full-width"
              :style="{ width: '100%', backgroundColor: currentBgColor, color: '#fff' }"
            >
              <q-list style="min-width: 180px">
                <!-- Vorhandene Kategorien mit Papierkorb-Icon -->
                <q-item
                  v-for="(cat, index) in categoryOptions"
                  :key="index"
                  class="row items-center"
                  style="justify-content: space-between;"
                  v-ripple
                >
                  <!-- Linke Seite: Kategorie auswählen -->
                  <div class="row items-center" @click="selectCategory(cat)">
                    <q-item-section avatar class="q-pa-none">
                      <div
                        :style="{
                          backgroundColor: cat.color,
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          border: '1.5px solid black'
                        }"
                      ></div>
                    </q-item-section>
                    <q-item-section class="q-pa-none">
                      <span>{{ cat.label }}</span>
                    </q-item-section>
                  </div>
                  <!-- Rechte Seite: Roter Papierkorb -->
                  <q-item-section side class="q-pa-none">
                    <q-icon
                      name="delete"
                      color="red"
                      style="cursor: pointer;"
                      @click.stop="handleDeleteCategory(cat.value)"
                    />
                  </q-item-section>
                </q-item>

                <!-- Kategorie hinzufügen (immer anzeigen) -->
                <q-item
                  clickable
                  v-ripple
                  @click="openAddCategoryDialog"
                  class="row items-center"
                  style="justify-content: flex-start;"
                >
                  <q-item-section avatar class="q-pa-none">
                    <q-icon name="add" />
                  </q-item-section>
                  <q-item-section class="q-pa-none">
                    <span>Kategorie hinzufügen</span>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </template>
          <template v-else>
            <q-btn
              flat
              class="q-mb-md full-width"
              style="border: 1px dashed #ccc;"
              icon="add"
              label="Kategorie hinzufügen"
              @click="openAddCategoryDialog"
            />
          </template>
        </q-card-section>

        <q-card-actions
          class="q-mt-none q-pb-none q-pt-none full-width"
          align="center"
        >
          <q-btn flat label="Abbrechen" color="grey" @click="showDialog = false" />
          <q-btn
            :color="transactionType === 'Einzahlen' ? 'green' : 'red'"
            :label="transactionType"
            class="rounded-borders shadow same-width-btn"
            :disable="!isFormValid"
            @click="confirmTransaction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog für Kategorie erstellen -->
    <q-dialog v-model="showKategorieDialog">
      <KategorieErstellen @close="closeKategorieDialog" />
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import Cookies from 'js-cookie';
import { useMyStore } from '@/stores/myStore';
import KategorieErstellen from '@/components/KategorieErstellen.vue';

const $q = useQuasar();

const showKategorieDialog = ref(false);
const openAddCategoryDialog = () => {
  // Vibration auslösen (z. B. 200ms) beim Öffnen des Kategorie-Erstellungsdialogs
  if (navigator.vibrate) {
    navigator.vibrate(200);
  }
  showKategorieDialog.value = true;
};
const closeKategorieDialog = () => { showKategorieDialog.value = false; };

function getContrastColor(hex) {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return '#fff';
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000' : '#fff';
}

// State-Variablen
const isEyeVisible = ref(false);
const showDialog = ref(false);
const showDatePicker = ref(false);
const transactionType = ref('');
const amount = ref('');
const titleValue = ref('');
const dateValue = ref(new Date().toISOString().split('T')[0]);
const selectedCategory = ref(null);
const description = ref('');

// Formularvalidierung
const isFormValid = computed(() => {
  return (
    titleValue.value.trim() !== '' &&
    amount.value.toString().trim() !== '' &&
    dateValue.value.trim() !== '' &&
    selectedCategory.value !== null
  );
});

// Heute als max. Datum
const maxDate = computed(() => new Date().toISOString().split('T')[0]);

const myStore = useMyStore();

onMounted(async () => {
  const cookieValue = Cookies.get('eyeVisible');
  if (cookieValue !== undefined) {
    isEyeVisible.value = cookieValue === 'true';
  }
  // Daten laden
  await myStore.fetchUserById();
  await myStore.fetchUserCategories();
});

// Kategorie-Optionen
const categoryOptions = computed(() =>
  myStore.userCategories.map((category) => ({
    label: category.name,
    value: category.tid,
    color: category.color
  }))
);

const selectedCategoryLabel = computed(() => {
  const cat = categoryOptions.value.find((c) => c.value === selectedCategory.value);
  return cat ? cat.label : 'Kategorie wählen';
});

const selectedCategoryColor = computed(() => {
  const cat = categoryOptions.value.find((c) => c.value === selectedCategory.value);
  return cat ? cat.color : null;
});

const currentBgColor = computed(() => selectedCategoryColor.value || '#090071');
const currentTextColor = computed(() => {
  if (!selectedCategoryColor.value) return '#fff';
  return getContrastColor(selectedCategoryColor.value);
});

const selectCategory = (cat) => { selectedCategory.value = cat.value; };
const toggleEye = () => {
  isEyeVisible.value = !isEyeVisible.value;
  Cookies.set('eyeVisible', isEyeVisible.value.toString(), { expires: 7 });
};
const openDialog = (type) => {
  transactionType.value = type;
  showDialog.value = true;
};

// Transaktion bestätigen
const confirmTransaction = async () => {
  try {
    // Bei "Auszahlen" als negativer Betrag, ansonsten positiv
    const numericValue =
      transactionType.value === 'Auszahlen'
        ? -parseFloat(amount.value)
        : parseFloat(amount.value);
    const transactionData = {
      created_at: new Date(dateValue.value).toISOString(),
      value: numericValue,
      description: titleValue.value,
      category_id: selectedCategory.value
    };
    const result = await myStore.postTransaction(transactionData);
    console.log('Transaktion erfolgreich gepostet:', result);

    // Formular zurücksetzen
    titleValue.value = '';
    amount.value = '';
    dateValue.value = new Date().toISOString().split('T')[0];
    selectedCategory.value = null;
    description.value = '';

    await myStore.fetchUserById();

    // Notify-Alert anzeigen
    $q.notify({
      message: `${transactionType.value === 'Einzahlen' ? '+' : '-'}${Math.abs(numericValue).toFixed(2)} € wurden ${transactionType.value === 'Einzahlen' ? 'eingezahlt' : 'ausgezahlt'}.`,
      color: transactionType.value === 'Einzahlen' ? 'green' : 'red',
      position: 'top',
      timeout: 3000
    });

    // Vibration auslösen (z. B. 100ms) nach der Transaktion
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    // Hier wird der Ton abgespielt
    const audio = new Audio('https://www.myinstants.com/media/sounds/applepay.mp3');
    audio.play();

    showDialog.value = false;
  } catch (error) {
    console.error('Fehler beim Bestätigen der Transaktion:', error);
  }
};

const userBalance = computed(() => myStore.userDetail?.money ?? 0);
const formattedBalance = computed(() => `${userBalance.value.toFixed(2)} €`);

/* Berechnung der prozentualen Veränderung seit der ersten Transaktion im aktuellen Monat */

// Filtere Transaktionen, die im aktuellen Monat liegen
const monthlyTransactions = computed(() => {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  return myStore.transactions.filter((t) => new Date(t.created_at) >= startOfMonth);
});

// Nettobetrag (Summe der Werte) der Transaktionen des Monats
const netMonthlyAmount = computed(() =>
  monthlyTransactions.value.reduce((sum, t) => sum + parseFloat(t.value), 0)
);

// Anfangsbestand zu Monatsbeginn (angenommen: aktueller Kontostand = Anfangsbestand + netMonthlyAmount)
const initialBalance = computed(() => userBalance.value - netMonthlyAmount.value);

// Sortiere die monatlichen Transaktionen nach Datum (aufsteigend)
const monthlyTransactionsSorted = computed(() => {
  return monthlyTransactions.value.sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
});

// Bestimme die Baseline-Balance: Falls es mindestens eine Transaktion gibt, verwende
// die Balance direkt nach der ersten Transaktion, ansonsten den Anfangsbestand.
const baselineBalance = computed(() => {
  if (monthlyTransactionsSorted.value.length > 0) {
    const firstTransaction = monthlyTransactionsSorted.value[0];
    return initialBalance.value + parseFloat(firstTransaction.value);
  }
  return initialBalance.value;
});

// Berechne die prozentuale Veränderung seit der ersten Transaktion im aktuellen Monat
const monthlyPercentage = computed(() => {
  if (baselineBalance.value === 0) return 0;
  return ((userBalance.value) / baselineBalance.value) * 100;
});


const handleDeleteCategory = async (categoryId) => {
  try {
    await myStore.deleteCategory(categoryId);
    // Nach dem Löschen werden die Kategorien neu geladen:
    await myStore.fetchUserCategories();
    $q.notify({
      color: 'red',
      message: 'Kategorie entfernt!',
      position: 'top',
      timeout: 3000
    });
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Fehler beim Entfernen der Kategorie',
      position: 'top',
      timeout: 3000
    });
  }
};
</script>

<style scoped>
.card {
  max-width: 335.41px;
  margin: 0 auto;
}
.rounded-borders {
  border-radius: 24px;
}
.shadow {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}
.q-btn {
  text-transform: none;
  border-radius: 24px;
  font-weight: bold;
}
.same-width-btn {
  width: 120px;
}
.full-width {
  width: 100%;
}
/* Weitere Styles (z. B. für text-positive und text-negative) */
.text-positive {
  color: green;
}
.text-negative {
  color: red;
}
</style>
