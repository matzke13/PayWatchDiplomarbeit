<template>
  <div class="card bg-white q-pa-md q-mb-md rounded-borders shadow">
    <!-- Überschrift -->
    <div class="text-subtitle1"><b>Bilanz</b></div>
    
    <!-- Container für Ausgaben und Einnahmen -->
    <div class="balance-container q-mt-md">
      <div class="balance-row">
        <span class="balance-label">Ausgaben:</span>
        <span class="balance-value">
          <span class="sign red">-</span>&nbsp;<span>{{ formattedExpenses }}</span>
        </span>
      </div>
      <div class="balance-row">
        <span class="balance-label">Einnahmen:</span>
        <span class="balance-value">
          <span class="sign green">+</span>&nbsp;<span>{{ formattedIncomes }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useMyStore } from '@/stores/myStore';

const myStore = useMyStore();

// Transaktionen laden
onMounted(async () => {
  await myStore.fetchUserTransactions();
});

// Berechnung der Ausgaben: Summe der negativen Transaktionswerte
const expenses = computed(() => {
  if (!myStore.transactions) return 0;
  return myStore.transactions.reduce((total, tx) => {
    const value = parseFloat(tx.value);
    return value < 0 ? total + value : total;
  }, 0);
});

// Berechnung der Einnahmen: Summe der positiven Transaktionswerte
const incomes = computed(() => {
  if (!myStore.transactions) return 0;
  return myStore.transactions.reduce((total, tx) => {
    const value = parseFloat(tx.value);
    return value > 0 ? total + value : total;
  }, 0);
});

// Formatierte Ausgaben und Einnahmen als Währungswerte
const formattedExpenses = computed(() => `${Math.abs(expenses.value).toFixed(2)} €`);
const formattedIncomes = computed(() => `${incomes.value.toFixed(2)} €`);
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

/* Container für Bilanz-Zeilen */
.balance-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

/* Einzelne Zeile für Ausgaben/Einnahmen */
.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Beschriftung */
.balance-label {
  font-weight: bold;
}

/* Werte fett und in größerer Schrift */
.balance-value {
  font-size: 1.2rem;
  font-weight: bold;
}

/* Großes Symbol für Plus/Minus */
.sign {
  font-size: 1.5rem;
}

/* Farbliche Darstellung */
.red {
  color: red;
}
.green {
  color: green;
}
</style>
