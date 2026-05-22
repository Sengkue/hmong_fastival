<template>
  <v-container fluid class="pa-6">
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <div v-else>
      <!-- ========================================================== -->
      <!-- ADMIN ROLE HOMEPAGE -->
      <!-- ========================================================== -->
      <div v-if="authStore.isAdmin" class="animate-fade">
        <v-row class="mb-6">
          <v-col cols="12" class="d-flex align-center justify-space-between flex-wrap gap-4">
            <div>
              <div class="d-flex align-center text-primary mb-1">
                <v-icon icon="mdi-shield-crown" class="mr-2"></v-icon>
                <span class="text-overline font-weight-bold">ADMIN PORTAL</span>
              </div>
              <h1 class="text-h3 font-weight-black text-primary">
                ສະບາຍດີ, {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
              </h1>
              <p class="text-subtitle-1 text-grey-darken-1">
                ຍິນດີຕ້ອນຮັບເຂົ້າສູ່ລະບົບຈັດການບູດບຸນກິນຈຽງ (Admin Console)
              </p>
            </div>
            
            <v-chip color="primary" class="pa-4 font-weight-bold" variant="flat" size="large">
              ORGANIZER PORTAL ACTIVE
            </v-chip>
          </v-col>
        </v-row>

        <!-- Stats row -->
        <v-row class="mb-6">
          <v-col cols="12" sm="6" md="3" v-for="stat in adminStats" :key="stat.title">
            <v-card class="glass-card pa-5 rounded-xl border border-left-thick shadow-sm" :class="'border-' + stat.color">
              <div class="d-flex align-center">
                <v-avatar :color="stat.color + '-lighten-5'" size="60" class="mr-4 shadow-sm">
                  <v-icon :icon="stat.icon" :color="stat.color" size="30"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-caption text-grey text-uppercase font-weight-bold">{{ stat.title }}</div>
                  <div class="text-h4 font-weight-bold text-grey-darken-3">{{ stat.value }}</div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Dynamic Menu Cards -->
        <v-row>
          <v-col cols="12" md="4" v-for="item in adminMenuItems" :key="item.title">
            <v-hover v-slot:default="{ isHovering, props }">
              <v-card 
                v-bind="props"
                :to="localePath(item.to)" 
                class="glass-card pa-6 rounded-2xl text-center hover-card transition-all"
                :elevation="isHovering ? 12 : 2"
              >
                <v-avatar :color="item.color + '-lighten-5'" size="80" class="mb-4">
                  <v-icon :icon="item.icon" :color="item.color" size="40"></v-icon>
                </v-avatar>
                <div class="text-h5 font-weight-black mb-2 text-grey-darken-3">{{ item.title }}</div>
                <div class="text-body-2 text-grey mb-6">{{ item.subtitle }}</div>
                
                <v-btn 
                  block 
                  :color="item.color" 
                  variant="tonal" 
                  class="rounded-lg font-weight-bold"
                  height="44"
                >
                  ເປີດລະບົບ (Open Panel)
                </v-btn>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </div>

      <!-- ========================================================== -->
      <!-- OWNER ROLE HOMEPAGE -->
      <!-- ========================================================== -->
      <div v-else-if="authStore.isOwner" class="animate-fade">
        <v-row class="mb-6">
          <v-col cols="12">
            <div class="d-flex align-center text-warning mb-1">
              <v-icon icon="mdi-shield-account" class="mr-2"></v-icon>
              <span class="text-overline font-weight-bold">ZONE OWNER PORTAL</span>
            </div>
            <h1 class="text-h3 font-weight-black text-primary">
              ສະບາຍດີ, {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
            </h1>
            <p class="text-subtitle-1 text-grey-darken-1">
              ຈັດການບູດ ແລະ ອະນຸມັດການຈອງໃນເຂດ (Zone) ທີ່ທ່ານໄດ້ຮັບຜິດຊອບ
            </p>
          </v-col>
        </v-row>

        <!-- Stats row -->
        <v-row class="mb-6">
          <v-col cols="12" sm="6" md="3" v-for="stat in ownerStats" :key="stat.title">
            <v-card class="glass-card pa-5 rounded-xl border border-left-thick shadow-sm" :class="'border-' + stat.color">
              <div class="d-flex align-center">
                <v-avatar :color="stat.color + '-lighten-5'" size="60" class="mr-4 shadow-sm">
                  <v-icon :icon="stat.icon" :color="stat.color" size="30"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-caption text-grey text-uppercase font-weight-bold">{{ stat.title }}</div>
                  <div class="text-h4 font-weight-bold text-grey-darken-3">{{ stat.value }}</div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Owner navigation links -->
        <v-row>
          <v-col cols="12" md="6" v-for="item in ownerMenuItems" :key="item.title">
            <v-hover v-slot:default="{ isHovering, props }">
              <v-card 
                v-bind="props"
                :to="localePath(item.to)" 
                class="glass-card pa-6 rounded-2xl text-center hover-card transition-all"
                :elevation="isHovering ? 12 : 2"
              >
                <v-avatar :color="item.color + '-lighten-5'" size="80" class="mb-4">
                  <v-icon :icon="item.icon" :color="item.color" size="40"></v-icon>
                </v-avatar>
                <div class="text-h5 font-weight-black mb-2 text-grey-darken-3">{{ item.title }}</div>
                <div class="text-body-2 text-grey mb-6">{{ item.subtitle }}</div>
                
                <v-btn 
                  block 
                  :color="item.color" 
                  variant="tonal" 
                  class="rounded-lg font-weight-bold"
                  height="44"
                >
                  ເປີດລະບົບ (Open Panel)
                </v-btn>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </div>

      <!-- ========================================================== -->
      <!-- CUSTOMER UNAUTHORIZED MESSAGE -->
      <!-- ========================================================== -->
      <div v-else class="animate-fade text-center py-12">
        <v-card theme="dark" class="premium-glass-card rounded-xl pa-8 max-width-600 mx-auto border-red shadow-red-lg">
          <v-avatar color="rgba(211, 47, 47, 0.15)" size="88" class="mb-6 border-red">
            <v-icon icon="mdi-cellphone-link" size="48" color="red-accent-2"></v-icon>
          </v-avatar>
          <h2 class="text-h4 font-weight-black text-red-accent-1 mb-3">PORTAL NOT DESIGNED FOR CUSTOMERS</h2>
          <p class="text-body-1 text-blue-grey-lighten-2 mb-6" style="line-height: 1.6;">
            The Administrative portal is restricted to festival organizers and zone owners.<br>
            Please use the **Hmong Festival Customer Portal** optimized specifically for your mobile phone screens.
          </p>
          <v-btn color="red-accent-2" size="large" class="rounded-lg font-weight-bold px-6" @click="handleLogout">
            <v-icon icon="mdi-logout" class="mr-2"></v-icon>
            Sign Out
          </v-btn>
        </v-card>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const localePath = useLocalePath()
const router = useRouter()

const loading = ref(false)

// Admin Dashboard stats
const adminStats = ref([
  { title: 'ງານບຸນປະເພນີທັງໝົດ', value: '3', icon: 'mdi-party-popper', color: 'primary' },
  { title: 'ເຂດຈັດງານທັງໝົດ', value: '6', icon: 'mdi-map-marker-radius', color: 'warning' },
  { title: 'ຈອງແລ້ວທັງໝົດ', value: '18', icon: 'mdi-store-check', color: 'success' },
  { title: 'ລໍຖ້າກວດສອບ', value: '4', icon: 'mdi-clock-alert', color: 'error' }
])

const adminMenuItems = [
  { title: 'ຈັດການງານບຸນປະເພນີ', subtitle: 'Hmong Festivals configuration & detail records', icon: 'mdi-party-popper', color: 'primary', to: '/admin/festivals' },
  { title: 'ຈັດການເຂດ (Zones)', subtitle: 'Design zones using map drawing module', icon: 'mdi-map-marker-radius-outline', color: 'warning', to: '/admin/zones' },
  { title: 'ອະນຸມັດການຈອງບູດ', subtitle: 'Approve or reject customer requests & slips', icon: 'mdi-store-cog-outline', color: 'success', to: '/admin/booths' }
]

// Owner Dashboard stats
const ownerStats = ref([
  { title: 'ເຂດຂອງຂ້ອຍ (My Zones)', value: '1', icon: 'mdi-shield-home', color: 'primary' },
  { title: 'ບູດຫວ່າງ (Available)', value: '12', icon: 'mdi-store-remove', color: 'info' },
  { title: 'ຈອງແລ້ວ (Booked)', value: '8', icon: 'mdi-store-check', color: 'success' },
  { title: 'ລໍຖ້າກວດສອບ', value: '2', icon: 'mdi-clock-alert', color: 'error' }
])

const ownerMenuItems = [
  { title: 'ຈັດການບູດໃນເຂດ', subtitle: 'Create, modify and monitor booths inside your assigned zones', icon: 'mdi-storefront-outline', color: 'primary', to: '/owner/booths' },
  { title: 'ອະນຸມັດໃບຈອງບູດ', subtitle: 'Check payment receipts and approve/reject bookings', icon: 'mdi-file-document-check-outline', color: 'warning', to: '/owner/bookings' }
]

onMounted(async () => {
  loading.value = true
  try {
    await authStore.initialize()
  } catch (e) {
    console.error('Failed to load page index dependencies', e)
  } finally {
    loading.value = false
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.gap-4 { gap: 16px; }

.glass-card {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  transition: all 0.4s ease;
}

.border-left-thick {
  border-left-width: 6px !important;
  border-left-style: solid !important;
}

.border-primary { border-left-color: #1976D2 !important; }
.border-success { border-left-color: #4CAF50 !important; }
.border-warning { border-left-color: #FF9800 !important; }
.border-error { border-left-color: #F44336 !important; }

.hover-card:hover {
  transform: translateY(-8px);
  background-color: rgba(255, 255, 255, 0.95) !important;
}

.max-width-600 {
  max-width: 600px;
}

.premium-glass-card {
  background: rgba(10, 15, 30, 0.7) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.border-red {
  border-color: rgba(211, 47, 47, 0.4) !important;
}

.shadow-red-lg {
  box-shadow: 0 12px 40px rgba(211, 47, 47, 0.15) !important;
}

.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-fade {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
