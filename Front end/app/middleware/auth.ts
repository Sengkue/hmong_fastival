export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server-side
  if (import.meta.server) return

  const authStore = useAuthStore()

  // 1. Redirect to login if not authenticated
  if (!authStore.isAuthenticated && to.path !== '/login') {
    return navigateTo('/login')
  }

  // 2. Redirect to dashboard if logged in and trying to access login
  if (authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }

  // 3. Check for Role-Based Access Control
  if (to.meta.role) {
    if (to.meta.role === 'Admin' && !authStore.isAdmin) {
      // User is not authorized
      return navigateTo('/') 
    }

    if (to.meta.role === 'Editor' && !authStore.isEditor) {
      return navigateTo('/')
    }
  }
})
