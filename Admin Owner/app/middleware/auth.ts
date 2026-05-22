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
    const requiredRole = (to.meta.role as string).toLowerCase()
    
    if (requiredRole === 'admin' && !authStore.isAdmin) {
      return navigateTo('/')
    }

    if (requiredRole === 'owner' && !authStore.isOwner) {
      return navigateTo('/')
    }

    if (requiredRole === 'customer' && !authStore.isCustomer) {
      return navigateTo('/')
    }
  }
})
