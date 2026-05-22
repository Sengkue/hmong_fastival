<template>
  <Transition name="fade">
    <div v-if="loading" class="modern-loading-page">
      <div class="logo-container">
        <div class="loading-ring"></div>
        <img src="/images/logo.png" alt="Loading Logo" class="loading-logo" />
      </div>
      <div class="loading-text">Loading...</div>
    </div>
  </Transition>
  <div v-show="!loading">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const loading = ref(true)

onMounted(() => {
  loading.value = false
})
</script>

<style>
.modern-loading-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

@media (prefers-color-scheme: dark) {
  .modern-loading-page {
    background: rgba(15, 23, 42, 0.95);
  }
  .loading-text {
    color: #f8fafc !important;
  }
}

.logo-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 140px;
  height: 140px;
  margin-bottom: 30px;
}

.loading-logo {
  width: 80px;
  height: auto;
  z-index: 2;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.15));
}

.loading-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: #1976D2;
  border-right-color: rgba(25, 118, 210, 0.2);
  border-bottom-color: rgba(25, 118, 210, 0.05);
  border-left-color: rgba(25, 118, 210, 0.2);
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  z-index: 1;
}

.loading-ring::before {
  content: '';
  position: absolute;
  top: -6px; left: -6px; right: -6px; bottom: -6px;
  border: 3px solid transparent;
  border-top-color: #64B5F6;
  border-radius: 50%;
  animation: spin 2.5s linear infinite reverse;
  opacity: 0.5;
}

.loading-text {
  color: #1e293b;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  animation: pulse-opacity 2s infinite ease-in-out;
}

/* Smooth Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.03); }
}

@keyframes pulse-opacity {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>

