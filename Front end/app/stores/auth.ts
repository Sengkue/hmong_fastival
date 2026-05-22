import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as any | null,
    permissions: {} as Record<string, any>,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'Admin',
    isEditor: (state) => state.user?.role === 'Editor',
    canView: (state) => (permission: string) => {
      if (state.user?.role === 'Admin') return true
      if (!state.permissions) return false
      
      // Handle nested permissions (e.g., 'sms_banking.dashboard')
      if (state.permissions.all) return true
      return !!state.permissions[permission]
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

    initialize() {
      if (import.meta.client) {
        const token = localStorage.getItem('auth_token')
        const userJson = localStorage.getItem('auth_user')
        
        if (token && userJson) {
          try {
            this.token = token
            this.user = JSON.parse(userJson)
          } catch (e) {
            this.logout()
          }
        }
      }
    }
  }
})
