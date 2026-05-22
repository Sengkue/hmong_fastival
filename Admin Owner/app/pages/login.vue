<script setup lang="ts">
import { ref } from 'vue'
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const config = useRuntimeConfig()

definePageMeta({
  layout: false // Login page usually doesn't need the default layout
})

const email = ref('admin@festival.com')
const password = ref('Admin@123')
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const showTimeoutDialog = ref(false)

// Redirect if already logged in
if (authStore.isAuthenticated) {
  router.push('/')
}

// Check for timeout
if (route.query.timeout) {
  showTimeoutDialog.value = true
}

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter email and password'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    // DEV MODE: Bypass API if credentials are 'admin' / 'admin123' or 'admin@festival.com' / 'Admin@123'
    if (
      (email.value === 'admin' && password.value === 'admin123') ||
      (email.value === 'admin@festival.com' && password.value === 'Admin@123')
    ) {
      console.log('Using Mock Admin Login')
      authStore.login('mock-token-123', {
        id: '1',
        email: 'admin@festival.com',
        role: 'Admin',
        name: 'System Admin'
      }, { all: true })
      router.push('/')
      return
    }

    // Define response interface
    interface LoginResponse {
      success: boolean
      message?: string
      data?: {
        token: string
        user: any
        permissions?: Record<string, any>
      }
    }

    const response = await $fetch<LoginResponse>(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    if (response.success && response.data) {
      const { token, user, permissions } = response.data
      if (token && user) {
         authStore.login(token, user, permissions || {})
         router.push('/')
      } else {
         errorMessage.value = 'Invalid server response'
      }
    } else {
      errorMessage.value = response.message || 'Login failed'
    }
  } catch (error: any) {
    const errorData = error.response?._data
    if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      errorMessage.value = errorData.errors.map((e: any) => e.message).join(', ')
    } else {
      errorMessage.value = errorData?.message || 'Connection error. Please try again.'
    }
    console.error('Login Error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-app>
    <div class="login-container d-flex align-center justify-center fill-height">
      <!-- Dark Blue Overlay -->
      <div class="overlay"></div>

      <v-card theme="dark" class="premium-glass-card rounded-xl pa-2" width="420" max-width="90%" :loading="loading">
        <template v-slot:loader="{ isActive }">
          <v-progress-linear :active="isActive" color="#FFD700" height="4" indeterminate></v-progress-linear>
        </template>

        <v-card-title class="text-center pt-8 pb-4">
          <div class="logo-wrapper mx-auto mb-4">
            <v-img src="/images/logo.png" height="70" contain class="logo-img"></v-img>
          </div>
          <div class="text-h5 font-weight-black gold-text spacing-wide">
            HMONG FESTIVAL 2027
          </div>
          <div class="text-caption text-blue-grey-lighten-2 mt-1 font-weight-medium">
            SECURE ADMINISTRATION PORTAL
          </div>
        </v-card-title>

        <v-card-text class="px-8 pb-8">
          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              label="Email Address"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              color="#FFD700"
              bg-color="rgba(10, 15, 30, 0.4)"
              density="comfortable"
              class="mb-3 custom-input"
              :error-messages="errorMessage && !password ? errorMessage : ''"
              autofocus
            ></v-text-field>

            <v-text-field
              v-model="password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
              @click:append-inner="showPassword = !showPassword"
              variant="outlined"
              color="#FFD700"
              bg-color="rgba(10, 15, 30, 0.4)"
              density="comfortable"
              class="mb-6 custom-input"
              @keyup.enter="handleLogin"
            ></v-text-field>

            <v-fade-transition>
              <div v-if="errorMessage" class="red-alert rounded-lg pa-3 mb-6 d-flex align-center shadow-red">
                <v-icon icon="mdi-alert-circle-outline" color="red-accent-2" size="24" class="mr-3"></v-icon>
                <span class="text-body-2 text-red-1 font-weight-medium">{{ errorMessage }}</span>
              </div>
            </v-fade-transition>

            <v-btn
              block
              size="x-large"
              type="submit"
              :loading="loading"
              class="gold-btn rounded-lg mt-2 font-weight-black text-overline spacing-wider"
              height="54"
            >
              AUTHENTICATE
            </v-btn>
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-center pb-6">
          <div class="d-flex align-center text-caption text-blue-grey-lighten-1">
            <v-icon icon="mdi-lock-check" size="14" class="mr-1 gold-accent"></v-icon>
            Encrypted Connection
          </div>
        </v-card-actions>
      </v-card>
      
      <!-- Session Timeout Dialog -->
      <v-dialog v-model="showTimeoutDialog" max-width="420" persistent transition="dialog-bottom-transition">
        <v-card theme="dark" class="text-center pa-8 rounded-xl timeout-glass shadow-red-lg border-red">
          
          <div class="d-flex justify-center mb-6">
            <div class="pulse-container">
               <v-avatar color="rgba(211, 47, 47, 0.15)" size="88" class="border-red">
                  <v-icon icon="mdi-shield-alert-outline" size="48" color="red-accent-2"></v-icon>
               </v-avatar>
            </div>
          </div>

          <h3 class="text-h5 font-weight-bold mb-3 text-red-accent-1">
            SESSION EXPIRED
          </h3>
          
          <p class="text-body-1 text-blue-grey-lighten-2 mb-8" style="line-height: 1.6;">
            Your secure session has timed out due to inactivity.<br>
            Please re-authenticate to continue.
          </p>

          <v-btn
            class="gold-btn rounded-lg font-weight-bold text-button spacing-wide"
            height="52"
            block
            @click="showTimeoutDialog = false"
          >
            RE-AUTHENTICATE
          </v-btn>
        </v-card>
      </v-dialog>
    </div>
  </v-app>
</template>

