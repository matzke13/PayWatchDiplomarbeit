<template>
  <div>
    <q-table
      title="Finanzübersicht"
      :rows="mappedTransactions"
      :columns="columns"
      row-key="tid"
      :pagination.sync="pagination"
      hide-bottom
    >
      <!-- Slot für die Spalte "betrag" -->
      <template v-slot:body-cell-betrag="props">
        <q-td :props="props">
          <span v-if="props.row.value >= 0" style="color: green;">
            + {{ props.row.value }}
          </span>
          <span v-else style="color: red;">
            - {{ Math.abs(props.row.value) }}
          </span>
        </q-td>
      </template>

      <!-- Slot für die Spalte "titel" -->
      <template v-slot:body-cell-titel="props">
        <q-td :props="props">
          {{ shortenDescription(props.row.description) }}
        </q-td>
      </template>

      <!-- Slot für die Spalte "kategorie" -->
      <template v-slot:body-cell-kategorie="props">
        <q-td :props="props">
          <span
            class="category-indicator"
            :style="{ backgroundColor: props.row.categoryColor }"
          ></span>
          <span>{{ props.row.categoryName }}</span>
        </q-td>
      </template>

      <!-- Slot für die Spalte "info" -->
      <template v-slot:body-cell-info="props">
        <q-td :props="props">
          <q-icon
            name="info"
            size="24px"
            class="cursor-pointer"
            @click="handleInfo(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- QDialog für Transaktionsdetails -->
    <q-dialog v-model="showDialog">
      <q-card class="rounded-card">
        <q-card-section>
          <!-- Überschrift mit zusätzlichem Abstand -->
          <div class="text-h6 dialog-heading">Transaktionsdetails</div>

          <div v-if="selectedTransaction">
            <div>
              <div>
                <strong>Titel:</strong>
                {{ selectedTransaction.description }}
              </div>
              <div>
                <strong>Kategorie:</strong>
                {{ selectedTransaction.categoryName }}
                <span
                  class="category-indicator"
                  :style="{ backgroundColor: selectedTransaction.categoryColor }"
                ></span>
              </div>
              <div>
                <strong>Gesamtpreis:</strong>
                <span v-if="selectedTransaction.value >= 0" style="color: green;">
                  + {{ selectedTransaction.value }}
                </span>
                <span v-else style="color: red;">
                  - {{ Math.abs(selectedTransaction.value) }}
                </span>
              </div>
            </div>

            <!-- Optional: Liste der enthaltenen Produkte -->
            <q-expansion-item
              v-if="selectedTransaction.items && selectedTransaction.items.length"
              label="Produkte"
            >
              <q-list>
                <q-item
                  v-for="item in selectedTransaction.items"
                  :key="item.id"
                  clickable
                  active-class="bg-grey-2"
                >
                  <q-item-section>
                    <div><strong>{{ item.name }}</strong></div>
                    <div>Menge: {{ item.quantity }}</div>
                    <div>Einzelpreis: {{ item.unit_price }}</div>
                    <div>Gesamtpreis: {{ item.total_price }}</div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="OK"
            color="primary"
            class="lowercase-btn"
            @click="showDialog = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMyStore } from '@/stores/myStore'; // Pfad ggf. anpassen

// --- PINIA-STORE / STATES ---
const store = useMyStore();
const { transactions, userCategories } = storeToRefs(store);

// --- DIALOG / MODAL-STATUS ---
const showDialog = ref(false);
const selectedTransaction = ref(null);

// --- DATEN BEIM MOUNTEN LADEN ---
onMounted(async () => {
  await store.fetchUserTransactions();
  await store.fetchUserCategories();
});

// --- TRANSAKTIONEN MIT KATEGORIE-INFOS MAPPEN ---
const mappedTransactions = computed(() => {
  return transactions.value.map(t => {
    const category = userCategories.value.find(c => c.tid === t.category_id);
    return {
      ...t,
      categoryName: category ? category.name : 'Unbekannt',
      categoryColor: category ? category.color : '#000000'
    };
  });
});

// --- SPALTENDEFINITION ---
const columns = [
  {
    name: 'betrag',
    label: 'Betrag',
    field: 'value',
    align: 'left',
    sortable: true,
    headerStyle: 'font-weight: bold;'
  },
  {
    name: 'titel',
    label: 'Titel',
    field: 'description',
    align: 'left',
    sortable: false,
    headerStyle: 'font-weight: bold;'
  },
  {
    name: 'kategorie',
    label: 'Kategorie',
    field: 'categoryName',
    align: 'left',
    sortable: false,
    headerStyle: 'font-weight: bold;'
  },
  {
    name: 'info',
    label: 'Info',
    align: 'center',
    sortable: false,
    headerStyle: 'font-weight: bold;'
  }
];

// --- PAGINATION OBJEKT ---
const pagination = computed(() => ({
  page: 1,
  rowsPerPage: mappedTransactions.value.length,
  rowsNumber: mappedTransactions.value.length
}));

// --- KLICK AUF INFO-ICON ---
const handleInfo = (row) => {
  selectedTransaction.value = row;
  showDialog.value = true;
  console.log('Info zu Transaktion:', row);
};

// --- FUNKTION, DIE BIS ZUM ERSTEN LEERZEICHEN KÜRZT + '...' ---
function shortenDescription(str) {
  if (!str) {
    return '';
  }
  const index = str.indexOf(' ');
  if (index === -1) {
    // Falls kein Leerzeichen: ganzen Text zurückgeben
    return str;
  }
  // Sonst bis zum Leerzeichen + '...'
  return str.slice(0, index) + '...';
}
</script>

<style scoped>
/* Alle Tabellenzellen fett darstellen */
.q-td {
  font-weight: bold;
}

/* Den Titel der Q‑Table fett darstellen */
::v-deep .q-table__title {
  font-weight: bold !important;
}

/* Stil für den farbigen Kreis in der Kategorie-Spalte */
.category-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid black;
  margin-right: 8px;
}

/* Abstand unter der Überschrift im Dialog */
.dialog-heading {
  margin-bottom: 16px;
}

/* Abgerundete Ecken für das QCard im Popup */
.rounded-card {
  border-radius: 24px;
  min-width: 600px;
}

/* Responsive Design: Bei kleinen Bildschirmen (z. B. Smartphones) wird der Dialog schmaler */
@media (max-width: 600px) {
  .rounded-card {
    min-width: 90vw;
  }
}

.lowercase-btn {
  text-transform: none;
}

</style>
