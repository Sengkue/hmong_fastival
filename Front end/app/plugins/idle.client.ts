export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore()
  const router = useRouter()

  // Constants
  const IDLE_TIMEOUT = 14 * 60 * 1000 // 14 minutes
  const CHECK_INTERVAL = 10 * 1000    // Check every 10 seconds
  const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keypress', 'touchmove', 'scroll']

  // Variables
  let lastActivity = Date.now()
  let timer: any = null

  // 1. Function to update activity timestamp
  const updateActivity = () => {
    lastActivity = Date.now()
    
    // Sync with localStorage for cross-tab support (throttled)
    // Only update storage if it hasn't been updated in the last minute
    const storedTime = localStorage.getItem('last_activity')
    if (!storedTime || (lastActivity - parseInt(storedTime) > 60 * 1000)) {
      localStorage.setItem('last_activity', lastActivity.toString())
    }
  }

  // 2. Main Check Function
  const checkIdle = () => {
    // SKIP CHECK IF ON LOGIN PAGE
    if (router.currentRoute.value.path === '/login') return

    // If not authenticated, no need to check (or you can keep checking to be safe)
    if (!authStore.isAuthenticated) return

    const now = Date.now()
    // Read from localStorage as source of truth (handles multiple tabs)
    const storedTime = localStorage.getItem('last_activity')
    const trueLastActivity = storedTime ? parseInt(storedTime) : lastActivity
    
    // Check token expiration
    authStore.checkTokenExpiration()

    if (now - trueLastActivity > IDLE_TIMEOUT) {
      // TIMEOUT DETECTED
      logoutUser()
    }
  }

  // 3. Logout Logic
  const logoutUser = async () => {
    // Double check we are not on login page
    if (router.currentRoute.value.path === '/login') return

    // Stop checking
    if (timer) clearInterval(timer)
    
    // Call auth store logout (handles API call + state clearing)
    // Pass '' to prevent auto-redirect, we will force reload below
    await authStore.logout('')

    // Redirect with forced reload to clear JS state
    window.location.href = '/login?timeout=1'
  }

  // 4. Initialize
  // Attach event listeners
  ACTIVITY_EVENTS.forEach(event => {
    window.addEventListener(event, updateActivity, { passive: true })
  })

  // Set initial activity
  updateActivity()

  // Start interval checker
  timer = setInterval(checkIdle, CHECK_INTERVAL)
})
