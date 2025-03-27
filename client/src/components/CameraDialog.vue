<template>
  <div>
    <div v-if="showCameraDialog" class="camera-dialog">
      <div class="dialog-content">
        <!-- Close-Button -->
        <button @click="closeCamera" class="close-button">
          <i class="fas fa-times"></i>
        </button>
        <div class="media-container">
          <video v-if="!capturedImage" ref="video" autoplay></video>
          <img v-else :src="capturedImage" alt="Captured" class="captured-image" />
          <div v-if="loading" class="loading-overlay">
            <div class="spinner"></div>
          </div>
        </div>
        <div class="buttons" v-if="!capturedImage">
          <button @click="capturePhoto">
            <q-icon name="photo_camera" size="md" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMyStore } from '../stores/myStore.js';

export default {
  data() {
    return {
      showCameraDialog: true,
      stream: null,
      capturedImage: null,
      loading: false
    };
  },
  methods: {
    async openCamera() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.$refs.video.srcObject = this.stream;
      } catch (error) {
        console.error("Kamera konnte nicht geöffnet werden:", error);
        alert("Es konnte keine Kamera gefunden werden.");
      }
    },
    capturePhoto() {
      const canvas = document.createElement('canvas');
      canvas.width = this.$refs.video.videoWidth;
      canvas.height = this.$refs.video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(this.$refs.video, 0, 0, canvas.width, canvas.height);

      this.capturedImage = canvas.toDataURL('image/jpeg');
      this.loading = true;

      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error("Kein Blob erstellt");
          return;
        }
        const file = new File([blob], "rechnung.jpg", { type: "image/jpeg" });
        try {
          const store = useMyStore();
          const response = await store.extractBillbox(file);
          console.log("Billbox extrahiert:", response);
          this.loading = false;
          this.$q.notify({
            type: 'positive',
            message: 'Erfolgreich eingelesen!',
            position: 'top'
          });
          this.closeCamera();
        } catch (error) {
          console.error("Fehler beim Scannen der Billbox:", error);
          this.loading = false;
          this.$q.notify({
            type: 'negative',
            message: 'Einscannen fehlgeschlagen!',
            position: 'top'
          });
          this.closeCamera(); // Kamera wird jetzt bei Fehler auch geschlossen
        }
      }, 'image/jpeg');
    },
    closeCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
      }

      const store = useMyStore();
      store.fetchUserTransactions();
      this.showCameraDialog = false;
      this.$emit('close');
    },
  },
  mounted() {
    this.openCamera();
  },
};
</script>

<style scoped>
.camera-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.dialog-content {
  position: relative;
  text-align: center;
  width: 100%;
  height: 100%;
}

.media-container {
  position: relative;
  width: 100%;
  height: 100%;
}

video,
.captured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #090071;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.buttons {
  position: absolute;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
}

button {
  background-color: #090071;
  color: white;
  border: none;
  border-radius: 50%;
  padding: 20px;
  margin: 10px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: transparent;
  padding: 10px;
  margin: 0;
  z-index: 10000;
  transition: background-color 0.3s;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

button i {
  font-size: 24px;
}

button:hover {
  background-color: #0056b3;
}

button:focus {
  outline: none;
}

.close-button i {
  font-size: 30px;
}
</style>
