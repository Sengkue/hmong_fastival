<template>
  <v-app>
    <v-navigation-drawer 
      v-model="drawer" 
      :permanent="$vuetify.display.mdAndUp"
      :temporary="$vuetify.display.smAndDown"
      elevation="3"
      class="sidebar-enhanced"
      :color="isDark ? 'background' : undefined"
    >
      <!-- Sidebar Header with Gradient -->
      <div class="sidebar-header" :class="{ 'dark-mode-header': isDark }">
        <div class="header-content">
          <v-img
            src="/images/logo.png"
            max-width="60"
            class="mx-auto mb-1 logo-circle"
            alt="Logo"
            cover
          ></v-img>
          <div class="header-title">{{ systemName }}</div>
          <div class="header-subtitle">{{ $t('menu.report') }}</div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <v-list density="compact" nav class="px-3 py-2 menu-list">
        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          :title="$t('menu.home') || 'Home'"
          :to="localePath('/')"
          rounded="lg"
          class="nav-item"
        ></v-list-item>

        <!-- Festival & Booths Group -->
        <v-list-group v-if="authStore.canView('booths')" value="FestivalManagement">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-store-cog-outline"
              :title="$t('menu.festival_management')"
              rounded="lg"
              class="nav-item group-activator"
            ></v-list-item>
          </template>

          <v-list-item
            :title="$t('menu.booth_management') + ' (Admin)'"
            :to="localePath('/admin/booths')"
            prepend-icon="mdi-shield-account-outline"
            rounded="lg"
            class="nav-item sub-item"
          ></v-list-item>

          <v-list-item
            title="Booth Booking (Customer)"
            :to="localePath('/booths')"
            prepend-icon="mdi-store-search-outline"
            rounded="lg"
            class="nav-item sub-item"
          ></v-list-item>
        </v-list-group>

        <!-- SMS Banking -->
        <v-list-item
          v-if="authStore.canView('sms_banking')"
          prepend-icon="mdi-message-text-clock-outline"
          :title="$t('menu.sms_reports')"
          :to="localePath('/sms_banking/transaction-detail')"
          rounded="lg"
          class="nav-item"
        ></v-list-item>

        <!-- Admin & Utility Links -->
        <div class="menu-divider my-2"></div>

        <v-list-item
          v-if="authStore.canView('users')"
          prepend-icon="mdi-account-group-outline"
          :title="$t('menu.users') || 'Users'"
          :to="localePath('/admin/users')"
          rounded="lg"
          class="nav-item"
        ></v-list-item>

        <v-list-item
          v-if="authStore.canView('settings')"
          prepend-icon="mdi-cog-outline"
          :title="$t('menu.settings')"
          :to="localePath('/settings')"
          rounded="lg"
          class="nav-item"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>


    <v-app-bar :color="isDark ? 'background' : 'primary'" :elevation="isDark ? 0 : 2" :class="isDark ? 'gold-border-b' : ''">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title v-show="!drawer || $vuetify.display.smAndDown">{{ systemName }}</v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- User Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            variant="text"
            v-bind="props"
            class="mr-2 d-flex flex-column align-center justify-center"
            height="auto"
            style="min-width: 0; padding: 4px 8px;"
          >
            <v-avatar color="surface" size="32" class="mb-1">
              <v-img v-if="authStore.user?.profile_image" :src="`${config.public.apiBase}${authStore.user.profile_image}`" cover></v-img>
              <v-icon v-else icon="mdi-account-circle" size="32"></v-icon>
            </v-avatar>
            <span class="text-caption font-weight-bold" style="line-height: 1; max-width: 80px; font-size: 10px !important;">
              {{ truncatedUsername }}
            </span>
          </v-btn>
        </template>
        <v-list width="200">
          <v-list-item
            prepend-icon="mdi-account-circle"
            :title="$t('profile.personal_info') || 'Profile'"
            :to="localePath('/profile')"
          ></v-list-item>
          <v-divider class="my-2"></v-divider>
          <v-list-item
            prepend-icon="mdi-logout"
            title="Logout"
            @click="handleLogout"
            color="error"
          ></v-list-item>
        </v-list>
      </v-menu>

      <!-- Dark Mode Toggle -->
      <v-btn
        icon
        @click="toggleTheme"
        variant="text"
      >
        <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <!-- Language Switcher -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="text" class="text-none">
            <v-avatar size="24" class="mr-2">
              <v-img :src="`/${locale}-flag.png`" :alt="locale"></v-img>
            </v-avatar>
            {{ currentLocaleName }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="loc in availableLocales"
            :key="loc.code"
            @click="setLocale(loc.code)"
          >
            <template v-slot:prepend>
              <v-avatar size="24" class="mr-2">
                <v-img :src="`/${loc.code}-flag.png`" :alt="loc.code"></v-img>
              </v-avatar>
            </template>
            <v-list-item-title>{{ loc.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { useTheme, useDisplay } from 'vuetify'
import { useAuthStore } from '~/stores/auth'

const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { smAndDown } = useDisplay()
const drawer = ref(!smAndDown.value)
const theme = useTheme()
const isDark = ref(false)
const authStore = useAuthStore()
const config = useRuntimeConfig()

// Watch for route changes to close drawer on mobile
watch(() => route.fullPath, () => {
  if (smAndDown.value) {
    drawer.value = false
  }
})

const availableLocales = computed(() => {
  return locales.value
})

const currentLocaleName = computed(() => {
  const current = locales.value.find(l => l.code === locale.value)
  return current?.name || locale.value
})

const systemName = computed(() => {
  return locale.value === 'la' ? t('system_name.la') : t('system_name.en')
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light' // Default Vuetify themes
  if (process.client) {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }
}

const handleLogout = () => {
  authStore.logout()
  navigateTo('/login')
}

// Load saved theme on mount
onMounted(() => {
  if (process.client) {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      isDark.value = true
      theme.global.name.value = 'dark'
    }
  }
})

const truncatedUsername = computed(() => {
  const name = authStore.user?.username || 'User'
  if (name.length > 10) {
    return name.substring(0, 10) + '...'
  }
  return name
})

</script>

<style scoped>
/* Sidebar Enhanced Styling */
.sidebar-enhanced {
  border-right: 1px solid rgba(255, 215, 0, 0.3) !important; /* Premium Gold Border */
}

/* Custom Gold Bottom Border for Navbar */
.gold-border-b {
  border-bottom: 1px solid rgba(255, 215, 0, 0.3) !important;
}

/* Gradient Header */
.sidebar-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(var(--v-theme-primary), 0.85) 100%);
  padding: 24px 16px;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  transition: background 0.3s ease;
}

.dark-mode-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-background)) 0%, rgba(var(--v-theme-surface), 0.95) 100%) !important;
  border-bottom: 1px solid rgba(255, 215, 0, 0.1); /* Subtle gold border in dark mode */
}

.sidebar-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.6; }
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-title {
  color: rgb(var(--v-theme-on-primary));
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.dark-mode-header .header-title {
  color: #FFD700; /* Gold text in dark mode for premium look */
  text-shadow: 0 2px 10px rgba(255, 215, 0, 0.2);
}

.header-subtitle {
  color: rgba(var(--v-theme-on-primary), 0.75);
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.dark-mode-header .header-subtitle {
  color: rgba(255, 255, 255, 0.6);
}

/* Navigation Items */
.menu-list {
  background: transparent;
}

.nav-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px !important;
  border-radius: 8px !important;
  position: relative;
  overflow: hidden;
  color: rgba(var(--v-theme-on-surface), 0.8) !important;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10%;
  height: 80%;
  width: 4px;
  background: rgb(var(--v-theme-primary));
  transform: scaleY(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 4px 4px 0;
  z-index: 1;
}

.nav-item:hover {
  background: rgba(var(--v-theme-primary), 0.04) !important;
  transform: translateX(4px);
  color: rgb(var(--v-theme-primary)) !important;
}

.nav-item.v-list-item--active {
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 0.08) 0%, rgba(var(--v-theme-primary), 0.01) 100%) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600;
}

.nav-item.v-list-item--active::before {
  transform: scaleY(1);
}

/* Sub-items styling */
.sub-item {
  font-size: 0.85rem;
  padding-inline-start: 48px !important; /* Aligns sub-item icon vertically with main menu text */
  opacity: 0.85;
}

.sub-item::before {
  display: none !important;
}

.sub-item:hover {
  background: rgba(var(--v-theme-primary), 0.04) !important;
  opacity: 1;
  transform: translateX(4px);
}

.sub-item.v-list-item--active {
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 0.08) 0%, rgba(var(--v-theme-primary), 0.01) 100%) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600;
  opacity: 1;
}

/* Group activator */
.group-activator {
  font-weight: 600;
}

/* Icon spacing & styling */
.nav-item :deep(.v-list-item__spacer) {
  width: 9px !important;
}

.nav-item :deep(.v-list-item__prepend) {
  margin-inline-end: 12px !important;
}

.nav-item :deep(.v-list-item__prepend > .v-icon) {
  opacity: 0.7;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1.25rem;
}

.nav-item:hover :deep(.v-list-item__prepend > .v-icon),
.nav-item.v-list-item--active :deep(.v-list-item__prepend > .v-icon) {
  opacity: 1;
  transform: scale(1.1);
  color: rgb(var(--v-theme-primary));
}

.menu-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(var(--v-theme-on-surface), 0.1) 50%, transparent 100%);
  margin: 12px 0;
}

/* Scrollbar styling */
.sidebar-enhanced ::-webkit-scrollbar {
  width: 6px;
}

.sidebar-enhanced ::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-enhanced ::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 3px;
}

.sidebar-enhanced ::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface), 0.3);
}

/* Logo circle styling */
.sidebar-header .logo-circle {
  border-radius: 50%;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  border: 2px solid rgba(255,255,255,0.1);
  transition: transform 0.3s ease;
}

.sidebar-header .logo-circle:hover {
  transform: scale(1.05) rotate(5deg);
}
</style>
