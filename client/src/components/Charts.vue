<template>
  <div class="charts-switcher">
    <!-- Oberes Menübändchen -->
    <div class="menu-bar">
      <q-btn
        flat
        round
        icon="donut_large"
        :class="{ active: selectedChart === 'doughnut' }"
        @click="setChart('doughnut')"
      />
      <q-btn
        flat
        round
        icon="show_chart"
        :class="{ active: selectedChart === 'line' }"
        @click="setChart('line')"
      />
      <q-btn
        flat
        round
        icon="bar_chart"
        :class="{ active: selectedChart === 'bar' }"
        @click="setChart('bar')"
      />
    </div>

    <!-- Bereich für das Diagramm oder die Meldung, falls keine Daten vorhanden -->
    <div class="chart-area">
      <template v-if="myStore.transactions && myStore.transactions.length > 0">
        <canvas v-if="selectedChart === 'doughnut'" id="doughnutChart"></canvas>
        <canvas v-if="selectedChart === 'line'" id="lineChart"></canvas>
        <canvas v-if="selectedChart === 'bar'" id="barChart"></canvas>
      </template>
      <template v-else>
        <div class="no-data-message">Keine Daten vorhanden!</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useMyStore } from '@/stores/myStore';
import Chart from 'chart.js/auto';

const myStore = useMyStore();

// Aktuell ausgewählter Diagrammtyp
const selectedChart = ref('line');
// Referenz zur Chart-Instanz (zum Zerstören bei Wechsel)
const chartInstance = ref(null);

/**
 * Erstellt den Chart entsprechend des ausgewählten Typs
 */
const renderChart = () => {
  // Vorhandenen Chart zerstören, um Duplikate zu vermeiden
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  let ctx;

  /**
   * DOUGHNUT-CHART
   */
  if (selectedChart.value === 'doughnut') {
    const categorySums = {};
    myStore.transactions.forEach(tx => {
      const category = myStore.userCategories.find(c => c.tid === tx.category_id);
      const key = category ? category.name : 'Unbekannt';
      if (!categorySums[key]) categorySums[key] = 0;
      categorySums[key] += parseFloat(tx.value); // Betrag mit 2 multiplizieren
    });

    const labels = Object.keys(categorySums);
    const data = Object.values(categorySums);
    const backgroundColors = labels.map(label => {
      const cat = myStore.userCategories.find(c => c.name === label);
      return cat ? cat.color : '#cccccc';
    });

    ctx = document.getElementById('doughnutChart')?.getContext('2d');
    if (!ctx) return;

    chartInstance.value = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
            borderColor: '#000',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 0 },
        cutout: '50%', // Loch in der Mitte
        plugins: {
          legend: { display: false }
        }
      }
    });

  /**
   * LINE-CHART
   */
  } else if (selectedChart.value === 'line') {
    // Sortierung aller Transaktionen nach Datum
    const sortedTransactions = [...myStore.transactions].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Labels = Datumsstrings, Data = numerische Werte (mit Multiplikation)
    const labels = sortedTransactions.map(tx => new Date(tx.date).toLocaleDateString());
    const data = sortedTransactions.map(tx => parseFloat(tx.value)); // Betrag mit 2 multiplizieren

    ctx = document.getElementById('lineChart')?.getContext('2d');
    if (!ctx) return;

    chartInstance.value = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Transaktionen',
            data,
            fill: false,
            borderColor: 'blue',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 0 },
        scales: {
          x: {
            display: false  // X-Achse ausblenden
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

  /**
   * BAR-CHART
   */
  } else if (selectedChart.value === 'bar') {
    const categorySums = {};
    myStore.transactions.forEach(tx => {
      const category = myStore.userCategories.find(c => c.tid === tx.category_id);
      const key = category ? category.name : 'Unbekannt';
      if (!categorySums[key]) categorySums[key] = 0;
      categorySums[key] += parseFloat(tx.value); // Betrag mit 2 multiplizieren
    });

    const labels = Object.keys(categorySums);
    const data = Object.values(categorySums);

    ctx = document.getElementById('barChart')?.getContext('2d');
    if (!ctx) return;

    chartInstance.value = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Transaktionen',
            data,
            backgroundColor: labels.map(label => {
              const cat = myStore.userCategories.find(c => c.name === label);
              return cat ? cat.color : '#cccccc';
            }),
            borderColor: '#000',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 0 },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
};

/**
 * Wechselt den Diagrammtyp und rendert neu
 */
const setChart = (chartType) => {
  selectedChart.value = chartType;
  // Kleiner Timeout, damit das Canvas gerendert werden kann
  setTimeout(renderChart, 100);
};

onMounted(async () => {
  // Daten (Transaktionen und Kategorien) laden
  await myStore.fetchUserTransactions();
  await myStore.fetchUserCategories();

  // Ersten Chart initial erstellen
  renderChart();
});

// Neu rendern, wenn sich die Transaktionsliste ändert
watch(
  () => myStore.transactions,
  (newTransactions) => {
    if (newTransactions.length) renderChart();
  },
  { deep: true }
);
</script>

<style scoped>
.charts-switcher {
  width: 100%;
  margin: 0 auto;
}

/* Oberes Menübändchen */
.menu-bar {
  display: flex;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 8px;
  gap: 16px;
}

.menu-bar q-btn.active {
  background-color: #e0e0e0;
}

/* Bereich für das Diagramm */
.chart-area {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

/* Das Canvas passt sich an; maximale Höhe begrenzt */
canvas {
  max-width: 100%;
  max-height: 300px;
}

#doughnutChart {
  max-height: 187px;
}

/* Stil für die Meldung, wenn keine Daten vorhanden sind */
.no-data-message {
  font-size: 1.2rem;
  color: #555;
  padding: 20px;
  text-align: center;
}
</style>
