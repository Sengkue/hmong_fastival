<template>
  <v-app class="mobile-app-layout">
    <!-- Sleek Top Header Bar -->
    <v-app-bar 
      :color="isDark ? 'background' : 'primary'" 
      elevation="2" 
      class="gold-border-b px-2"
      density="comfortable"
    >
      <div class="d-flex align-center">
        <v-avatar size="32" class="mr-2 border-gold logo-mini">
          <v-img src="/images/logo.png" alt="Logo" cover></v-img>
        </v-avatar>
        <span class="text-subtitle-1 font-weight-black gold-text font-accent">
          {{ systemName }}
        </span>
      </div>

      <v-spacer></v-spacer>

      <!-- Language Toggle -->
      <v-menu offset-y transition="scale-transition">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon variant="text" size="small" class="mr-1">
            <v-avatar size="22" class="border">
              <v-img :src="`/${locale}-flag.png`" :alt="locale"></v-img>
            </v-avatar>
          </v-btn>
        </template>
        <v-list density="compact" class="py-1 rounded-lg">
          <v-list-item
            v-for="loc in availableLocales"
            :key="loc.code"
            @click="setLocale(loc.code)"
            class="py-1"
          >
            <template v-slot:prepend>
              <v-avatar size="18" class="mr-2">
                <v-img :src="`/${loc.code}-flag.png`"></v-img>
              </v-avatar>
            </template>
            <v-list-item-title class="text-caption font-weight-bold">{{ loc.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Light / Dark Mode Toggle -->
      <v-btn
        icon
        size="small"
        @click="toggleTheme"
        variant="text"
        class="mr-1"
      >
        <v-icon size="20">{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <!-- Logout / Action Button -->
      <v-btn
        v-if="authStore.isAuthenticated"
        icon
        size="small"
        @click="handleLogout"
        variant="text"
        color="red-lighten-2"
      >
        <v-icon size="20">mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main Content Container with Bottom Padding for Navigation Bar -->
    <v-main class="mobile-main bg-pattern">
      <div class="content-wrapper px-3 py-4">
        <slot />
      </div>
    </v-main>

    <!-- Gorgeous Premium Bottom Navigation Tab Bar -->
    <v-bottom-navigation
      v-if="authStore.isAuthenticated"
      v-model="activeTab"
      grow
      color="primary"
      class="premium-bottom-bar elevation-8 gold-border-t"
      density="comfortable"
      mandatory
    >
      <v-btn 
        value="home" 
        :to="localePath('/')"
        class="bottom-nav-btn"
      >
        <v-icon size="22">mdi-store-search-outline</v-icon>
        <span class="text-overline-custom">ຄົ້ນຫາບູດ</span>
      </v-btn>

      <v-btn 
        value="bookings" 
        :to="localePath('/booths/my-booking')"
        class="bottom-nav-btn"
      >
        <v-badge 
          v-if="pendingCount > 0"
          :content="pendingCount" 
          color="error"
          overlap
          size="small"
        >
          <v-icon size="22">mdi-ticket-confirmation-outline</v-icon>
        </v-badge>
        <v-icon v-else size="22">mdi-ticket-confirmation-outline</v-icon>
        <span class="text-overline-custom">ການຈອງ</span>
      </v-btn>

      <v-btn 
        value="profile" 
        :to="localePath('/settings')"
        class="bottom-nav-btn"
      >
        <v-icon size="22">mdi-cog-outline</v-icon>
        <span class="text-overline-custom">ຕັ້ງຄ່າ</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useTheme } from 'vuetify'
import { useAuthStore } from '~/stores/auth'

const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const theme = useTheme()
const isDark = ref(false)
const authStore = useAuthStore()
const activeTab = ref('home')

// Count pending bookings for badge
const pendingCount = ref(0)

const availableLocales = computed(() => locales.value)

const currentLocaleName = computed(() => {
  const current = locales.value.find(l => l.code === locale.value)
  return current?.name || locale.value
})

const systemName = computed(() => {
  return locale.value === 'la' ? t('system_name.la') : t('system_name.en')
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light'
  if (process.client) {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }
}

const handleLogout = () => {
  authStore.logout()
  navigateTo('/login')
}

// Watch route to sync active tab
watch(() => route.path, (newPath) => {
  if (newPath.includes('/my-booking')) {
    activeTab.value = 'bookings'
  } else if (newPath.includes('/settings')) {
    activeTab.value = 'profile'
  } else {
    activeTab.value = 'home'
  }
}, { immediate: true })

onMounted(() => {
  if (process.client) {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      isDark.value = true
      theme.global.name.value = 'dark'
    }
  }
})
</script>

<style scoped>
.mobile-app-layout {
  max-width: 600px !important;
  margin: 0 auto !important;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.15);
  background-color: #fafafa;
  min-height: 100vh;
}

.gold-border-b {
  border-bottom: 1.5px solid rgba(255, 215, 0, 0.5) !important;
}

.gold-border-t {
  border-top: 1.5px solid rgba(255, 215, 0, 0.4) !important;
}

.border-gold {
  border: 1px solid rgba(255, 215, 0, 0.6);
}

.logo-mini {
  background: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.gold-text {
  color: #FFD700 !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.font-accent {
  font-family: 'Outfit', 'Noto Sans Lao', sans-serif;
  font-weight: 900 !important;
  letter-spacing: 0.5px;
}

.mobile-main {
  padding-bottom: 64px !important; /* Spacing for the bottom navigation bar */
  min-height: calc(100vh - 56px);
}

.bg-pattern {
  background-color: #fafafa;
  background-image: radial-gradient(rgba(13, 71, 161, 0.03) 1.5px, transparent 1.5px);
  background-size: 24px 24px;
}

.content-wrapper {
  max-width: 100%;
  overflow-x: hidden;
}

/* Bottom Bar styling */
.premium-bottom-bar {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  max-width: 600px !important;
  margin: 0 auto !important;
  height: 62px !important;
  background: rgba(255, 255, 255, 0.88) !important;
  backdrop-filter: blur(20px);
  z-index: 1000;
  transition: all 0.3s ease;
}

.v-theme--dark .premium-bottom-bar {
  background: rgba(10, 15, 30, 0.9) !important;
}

.bottom-nav-btn {
  height: 100% !important;
  min-width: 70px !important;
  padding: 4px 0 !important;
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
  transition: all 0.2s ease;
}

.bottom-nav-btn.v-btn--active {
  color: rgb(var(--v-theme-primary)) !important;
  transform: translateY(-2px);
}

.text-overline-custom {
  font-size: 10px !important;
  font-weight: 700 !important;
  margin-top: 3px;
  letter-spacing: 0.2px !important;
  text-transform: none !important;
  font-family: 'Noto Sans Lao', sans-serif;
}

.bottom-nav-btn.v-btn--active .text-overline-custom {
  font-weight: 900 !important;
}
</style>
