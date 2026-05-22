import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as any | null,
    permissions: {} as Record<string, any>,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => {
      const role = state.user?.role?.toLowerCase()
      return role === 'admin'
    },
    isOwner: (state) => {
      const role = state.user?.role?.toLowerCase()
      return role === 'owner'
    },
    isCustomer: (state) => {
      const role = state.user?.role?.toLowerCase()
      return role === 'customer'
    },
    canView: (state) => (permission: string) => {
      const role = state.user?.role?.toLowerCase()
      if (role === 'admin') return true
      if (role === 'owner') {
        return ['booths', 'bookings', 'settings', 'sms_banking'].includes(permission)
      }
      if (role === 'customer') {
        return ['customer_portal', 'settings', 'booths'].includes(permission)
      }
      return false
    }
  },

  actions: {
    login(token: string, user: any, permissions: any = {}) {
      this.token = token
      this.user = user
      this.permissions = permissions

      if (import.meta.client) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.permissions = {}

      if (import.meta.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    },

    async initialize() {
      if (import.meta.client) {
        const token = localStorage.getItem('auth_token')
        const userJson = localStorage.getItem('auth_user')

        if (token && userJson) {
          try {
            this.token = token
            this.user = JSON.parse(userJson)
            
            // Sync with backend /auth/me to verify token validity
            const config = useRuntimeConfig()
            const response = await $fetch<any>(`${config.public.apiBase}/auth/me`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            
            if (response && response.success && response.data) {
              this.user = response.data
              localStorage.setItem('auth_user', JSON.stringify(response.data))
            } else {
              this.logout()
            }
          } catch (e) {
            console.error('Session sync failed, logging out', e)
            this.logout()
          }
        }
      }
    }
  }
})
