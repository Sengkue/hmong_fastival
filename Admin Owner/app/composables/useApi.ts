
export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // Helper: Clear all auth data and redirect to login
  const clearAuthAndRedirect = () => {
    authStore.token = null
    authStore.user = null

    if (import.meta.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }

    // Only redirect if not already on login page
    const route = useRoute()
    if (route.path !== '/login') {
      navigateTo('/login')
    }
  }

  const apiFetch = <T = any>(url: string, options: any = {}) => {
    // Build headers - auto-attach Authorization
    const headers: Record<string, string> = {
      ...options.headers,
    }

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    return $fetch<T>(`${config.public.apiBase}${url}`, {
      ...options,
      headers,

      // Error interceptor
      onResponseError({ response, request }) {
        const status = response.status
        const errorData = response._data
        const requestUrl = String(request)

        // Handle timeout / network errors are caught by $fetch as exceptions

        // 401 / 403 - Unauthorized / Forbidden
        if (status === 401 || status === 403) {
          // Special handling for logout - just clear and redirect
          if (requestUrl.includes('/auth/logout')) {
            clearAuthAndRedirect()
            return
          }

          // For all other 401/403 - session expired
          console.warn('Session expired or unauthorized:', errorData?.message)
          clearAuthAndRedirect()
          return
        }

        // 404 Not Found
        if (status === 404) {
          console.warn('API route not found:', requestUrl)
        }

        // 500+ Server Error
        if (status >= 500) {
          console.error('Server error:', errorData?.message || 'Internal Server Error')
        }
      }
    })
  }

  return { apiFetch, clearAuthAndRedirect }
}
