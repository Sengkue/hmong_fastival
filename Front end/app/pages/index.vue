<template>
  <v-container class="pa-6">
    <v-row>
      <v-col cols="12" class="text-center mb-6">
        <v-img src="/images/logo.png" height="120" class="mb-4" contain></v-img>
        <h1 class="text-h3 font-weight-bold text-primary">{{ $t('system_name.en') }}</h1>
        <p class="text-h6 text-grey mt-2">{{ $t('system_name.la') }}</p>
      </v-col>

      <v-col cols="12" md="4" v-for="item in menuItems" :key="item.title">
        <v-card 
          :to="item.to" 
          class="glass-card pa-6 rounded-xl text-center hover-card"
          elevation="0"
        >
          <v-avatar :color="item.color + '-lighten-5'" size="80" class="mb-4">
            <v-icon :icon="item.icon" :color="item.color" size="40"></v-icon>
          </v-avatar>
          <div class="text-h5 font-weight-bold mb-1">{{ $t(item.title) }}</div>
          <div class="text-body-2 text-grey">{{ $t(item.subtitle) }}</div>
          
          <v-btn 
            block 
            :color="item.color" 
            variant="tonal" 
            class="mt-6 rounded-lg text-none"
          >
            {{ $t('menu.open') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const menuItems = [
  { 
    title: 'menu.booth_management', 
    subtitle: 'menu.booth_subtitle', 
    icon: 'mdi-store-cog', 
    color: 'primary',
    to: '/admin/booths'
  },
  { 
    title: 'menu.sms_reports', 
    subtitle: 'menu.sms_subtitle', 
    icon: 'mdi-message-text-clock', 
    color: 'orange',
    to: '/sms-stats'
  },
  { 
    title: 'menu.settings', 
    subtitle: 'menu.settings_subtitle', 
    icon: 'mdi-cog-outline', 
    color: 'grey',
    to: '/settings'
  }
]
</script>

<style scoped>
.glass-card {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-8px);
  background-color: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1) !important;
}

.text-primary {
  color: #1976D2 !important;
}
</style>
