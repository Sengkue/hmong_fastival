export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore()
  
  // Initialize auth store from localStorage
  authStore.initialize()
})
