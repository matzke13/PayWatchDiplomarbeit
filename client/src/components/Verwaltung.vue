<template>
    <div class="card bg-white q-pa-md q-mb-md rounded-borders shadow">
      <!-- Überschrift -->
      <div class="text-subtitle1"><b>Verwaltung</b></div>
      
      <!-- Container für Diagramm und Legende -->
      <div class="chart-container row items-center q-mt-md">
        <!-- Chart oder Ladescreen -->
        <div class="chart-or-spinner">
          <div v-if="!hasTransactions" class="spinner-container">
            <q-spinner-dots color="primary" size="50px" />
          </div>
          <div v-else>
            <canvas id="donutChart" class="donut-chart"></canvas>
          </div>
        </div>
        
        <!-- Legende: Kategorien untereinander anzeigen -->
        <div class="legend">
          <div
            v-for="cat in legendData"
            :key="cat.value"
            class="legend-item"
          >
            <span
              class="legend-color"
              :style="{ backgroundColor: cat.color }"
            ></span>
            <span class="legend-label">{{ cat.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useMyStore } from '@/stores/myStore';
  import Chart from 'chart.js/auto';
  
  const myStore = useMyStore();
  
  // Computed-Property, die prüft, ob Transaktionen vorhanden sind
  const hasTransactions = computed(() => myStore.transactions && myStore.transactions.length > 0);
  
  // Referenz für die Chart-Instanz
  const chartInstance = ref(null);
  
  // Funktion zum Rendern bzw. Aktualisieren des Donut-Charts
  const renderChart = () => {
    // Erstelle eine Zuordnung: Kategorie-Name → Summe der Transaktionen (Nettobetrag)
    const categorySums = {};
    myStore.transactions.forEach(tx => {
      const category = myStore.userCategories.find(c => c.tid === tx.category_id);
      const key = category ? category.name : 'Unbekannt';
      if (!categorySums[key]) {
        categorySums[key] = 0;
      }
      // Betrag mit 2 multiplizieren
      categorySums[key] += parseFloat(tx.value) * 2;
    });
  
    const labels = Object.keys(categorySums);
    const data = Object.values(categorySums);
    // Erzeuge für jedes Label den zugehörigen Farbwert (Standard: Grau, falls nicht gefunden)
    const backgroundColors = labels.map(label => {
      const cat = myStore.userCategories.find(c => c.name === label);
      return cat ? cat.color : '#cccccc';
    });
  
    const ctx = document.getElementById('donutChart')?.getContext('2d');
    if (!ctx) return; // falls das Canvas-Element noch nicht vorhanden ist
  
    // Bestehende Chart-Instanz zerstören, um Duplikate zu vermeiden
    if (chartInstance.value) {
      chartInstance.value.destroy();
    }
  
    // Neuen Chart erstellen und in der Referenz speichern
    chartInstance.value = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColors,
            borderColor: '#000',
            borderWidth: 1
          }
        ]
      },
      options: {
        animation: {
          duration: 0 // Animation deaktivieren
        },
        cutout: '50%', // definiert das Loch in der Mitte
        responsive: true,
        plugins: {
          legend: {
            display: false // separate Legende wird selbst erstellt
          }
        }
      }
    });
  };
  
  // Daten laden und initialen Chart rendern
  onMounted(async () => {
    await myStore.fetchUserTransactions();
    await myStore.fetchUserCategories();
    if (hasTransactions.value) renderChart();
  });
  
  // Watcher: Überwacht Änderungen bei den Transaktionen und aktualisiert den Chart
  watch(
    () => myStore.transactions,
    (newTransactions, oldTransactions) => {
      if (newTransactions.length) {
        renderChart();
      }
    },
    { deep: true } // falls Transaktionen Objekte sind, die sich ändern können
  );
  
  // Legende: Nutzt alle Kategorien aus dem Store
  const legendData = computed(() => {
    return myStore.userCategories.map(cat => ({
      label: cat.name,
      value: cat.tid,
      color: cat.color
    }));
  });
  </script>
  
  <style scoped>
  .card {
    max-width: 335.41px;
    height: 168.01px; /* Feste Höhe der Karte */
    margin: 0 auto;
  }
  .rounded-borders {
    border-radius: 24px;
  }
  .shadow {
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }
  .full-width {
    width: 100%;
  }
  
  /* Noch kleinere Größe des Donut-Charts */
  .donut-chart {
    width: 80px !important;
    height: 80px !important;
  }
  
  /* Container: Elemente mittig zentriert und näher zusammen */
  .chart-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px; /* Abstand zwischen Chart/Spinner und Legende */
  }
  
  /* Bereich für Chart oder Spinner */
  .chart-or-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
  }
  
  /* Zentriert den Spinner */
  .spinner-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
  }
  
  /* Legende: Kategorien untereinander anzeigen */
  .legend {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  /* Einzelne Legenden-Elemente */
  .legend-item {
    display: flex;
    align-items: center;
    font-size: 0.75rem;
  }
  .legend-color {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid black;
    margin-right: 4px;
  }
  .legend-label {
    font-weight: bold;
  }
  </style>
  