<template>
  <v-container fluid class="pa-6">
    <v-row>
      <!-- Header with Breadcrumbs & Action -->
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-4">
          <div class="header-section">
            <div class="d-flex align-center text-primary mb-1">
              <v-icon icon="mdi-store-cog" class="mr-2"></v-icon>
              <span class="text-overline font-weight-bold letter-spacing-1">FESTIVAL MANAGEMENT</span>
            </div>
            <h1 class="text-h3 font-weight-bold text-primary">
              {{ $t('booths.title') }} <span class="text-grey-darken-1 font-weight-light">(Booth Management)</span>
            </h1>
            <p class="text-subtitle-1 text-grey-darken-1 d-flex align-center mt-1">
              <v-icon icon="mdi-information-outline" size="small" class="mr-1 text-primary"></v-icon>
              {{ $t('booths.subtitle') }}
            </p>
          </div>
          
          <div class="header-actions d-flex align-center gap-3">
            <v-btn 
              color="primary" 
              prepend-icon="mdi-refresh" 
              variant="elevated" 
              elevation="8"
              height="48"
              class="rounded-xl px-6 refresh-btn"
              @click="fetchData"
              :loading="loading"
            >
              <span class="font-weight-bold">{{ $t('booths.refresh') }}</span>
            </v-btn>
          </div>
        </div>
      </v-col>

      <!-- Premium Stats Overview -->
      <v-col cols="12" md="3" v-for="(stat, index) in stats" :key="stat.title">
        <v-hover v-slot:default="{ isHovering, props }">
          <v-card 
            v-bind="props"
            class="stat-card glass-card rounded-xl border-left-thick shadow-premium"
            :class="`border-${stat.color}`"
            :elevation="isHovering ? 16 : 2"
          >
            <div class="pa-5 d-flex align-center">
              <div class="stat-icon-wrapper mr-4" :class="`bg-${stat.color}-lighten-5 shadow-sm`">
                <v-icon :icon="stat.icon" :color="stat.color" size="32"></v-icon>
              </div>
              <div class="flex-grow-1">
                <div class="text-caption text-uppercase font-weight-bold text-grey mb-1">
                  {{ stat.title }}
                </div>
                <div class="d-flex align-baseline">
                  <span class="text-h4 font-weight-bold" :class="`text-${stat.color}`">{{ stat.value }}</span>
                  <span class="text-caption text-grey-darken-1 ml-2 font-weight-bold">Booths</span>
                </div>
              </div>
              <v-sparkline
                v-if="index === 1"
                :model-value="[0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0]"
                color="success"
                height="40"
                padding="8"
                stroke-linecap="round"
                smooth
                class="sparkline-overlay d-none d-sm-block"
              ></v-sparkline>
            </div>
            <div class="hover-overlay"></div>
          </v-card>
        </v-hover>
      </v-col>

      <!-- Main Content Layout -->
      <v-col cols="12" lg="9">
        <v-card class="glass-card rounded-xl border-thin h-100 overflow-hidden shadow-premium">
          <div class="card-header-gradient pa-4 d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-avatar color="white" size="36" class="mr-3 shadow-md">
                <v-icon icon="mdi-map-search" color="primary" size="20"></v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold text-white lh-1">{{ $t('booths.map_plan') }}</div>
                <div class="text-caption text-white-70 font-weight-bold">{{ $t('booths.interactive_map') }}</div>
              </div>
            </div>
            <v-chip size="small" color="white" variant="flat" class="text-primary font-weight-black shadow-sm">
              ZONE A-E ACTIVE
            </v-chip>
          </div>
          <div class="pa-2 bg-pattern">
            <AdminBoothMap 
              :booth-statuses="boothStatuses" 
              @select-booth="onBoothClick"
            />
          </div>
        </v-card>
      </v-col>

      <!-- Right Sidebar: Summary & Activity -->
      <v-col cols="12" lg="3">
        <v-card class="glass-card rounded-xl border-thin h-100 shadow-premium overflow-hidden">
          <div class="card-header-gradient-alt pa-4">
            <div class="d-flex align-center mb-1">
              <v-avatar color="white-20" size="32" class="mr-3">
                <v-icon icon="mdi-chart-pie" color="white" size="20"></v-icon>
              </v-avatar>
              <div class="text-h6 font-weight-bold text-white">{{ $t('booths.insights') }}</div>
            </div>
            <div class="text-caption text-white-70">{{ $t('booths.zone_details') }}</div>
          </div>
          
          <v-card-text class="pa-5">
            <div v-for="item in zoneStats" :key="item.zone" class="zone-progress-item mb-6">
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="d-flex align-center">
                  <v-avatar :color="getZoneColor(item.zone)" size="32" class="mr-3 text-white font-weight-black text-caption shadow-sm">
                    {{ item.zone }}
                  </v-avatar>
                  <span class="font-weight-bold text-grey-darken-3">Zone {{ item.zone }}</span>
                </div>
                <div class="text-caption font-weight-black">
                  <span class="text-h6 font-weight-black mr-1">{{ item.booked }}</span>
                  <span class="text-grey">/ {{ item.total }}</span>
                </div>
              </div>
              <v-progress-linear
                :model-value="(item.booked / item.total) * 100"
                :color="getZoneColor(item.zone)"
                height="12"
                rounded
                striped
                class="shadow-sm border"
              >
                <template v-slot:default="{ value }">
                  <div class="text-center text-white font-weight-black" style="font-size: 8px">
                    {{ Math.ceil(value) }}%
                  </div>
                </template>
              </v-progress-linear>
            </div>

            <v-divider class="my-6 border-dashed"></v-divider>

            <div class="d-flex align-center justify-space-between mb-4">
              <div class="text-subtitle-1 font-weight-bold text-primary">
                <v-icon icon="mdi-bell-ring-outline" class="mr-2" size="20"></v-icon>
                {{ $t('booths.latest_alerts') }}
              </div>
              <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">NEW</v-chip>
            </div>
            
            <div class="activity-feed">
              <div v-for="(activity, i) in recentActivity" :key="i" class="activity-item d-flex pb-5 border-left-thin pl-5 position-relative">
                <div class="activity-dot-pulse" :class="activity.color"></div>
                <div class="flex-grow-1">
                  <div class="text-body-2 font-weight-black text-grey-darken-3">{{ activity.text }}</div>
                  <div class="text-caption text-grey font-weight-medium">{{ activity.time }}</div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Bookings Table Section -->
      <v-col cols="12">
        <v-card class="glass-card rounded-xl border-thin shadow-premium mt-6 overflow-hidden">
          <div class="pa-6 border-b d-flex align-center flex-wrap gap-4">
            <v-avatar color="primary" variant="tonal" size="48" class="mr-4">
              <v-icon icon="mdi-format-list-bulleted" color="primary" size="24"></v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="text-h4 font-weight-bold text-primary">{{ $t('booths.booking_list') }}</div>
              <div class="text-subtitle-2 text-grey font-weight-medium">{{ $t('booths.booking_requests') }}</div>
            </div>
            
            <!-- Modern Segmented Control -->
            <div class="segmented-control glass-panel pa-1 rounded-xl d-flex align-center shadow-inner">
              <v-btn 
                v-for="status in filterOptions" 
                :key="status.value"
                :value="status.value"
                variant="flat"
                :color="filterStatus === status.value ? 'primary' : 'transparent'"
                class="rounded-lg px-6 flex-grow-1 transition-all"
                :class="filterStatus === status.value ? 'shadow-md elevation-2' : 'text-grey'"
                height="40"
                @click="filterStatus = status.value"
              >
                <v-icon :icon="status.icon" size="18" class="mr-2" v-if="filterStatus === status.value"></v-icon>
                <span class="font-weight-bold">{{ status.label }}</span>
              </v-btn>
            </div>
          </div>
          
          <div class="table-container bg-white-50">
            <BookingTable 
              :bookings="filteredBookings" 
              :loading="loading"
              @view="viewBooking"
              @approve="approveBooking"
              @reject="rejectBooking"
            />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Details Dialog -->
    <BookingActionDialog
      v-model="showDialog"
      :booking="selectedBooking"
      @approve="handleApprove"
      @reject="handleReject"
    />

    <!-- Toast Notification -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top right" rounded="xl" elevation="12" class="custom-snackbar">
      <div class="d-flex align-center">
        <v-avatar :color="snackbar.color + '-darken-1'" size="32" class="mr-3">
          <v-icon :icon="snackbar.icon" color="white" size="18"></v-icon>
        </v-avatar>
        <span class="font-weight-bold text-subtitle-2">{{ snackbar.text }}</span>
      </div>
      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" size="small" @click="snackbar.show = false"></v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
// Page Metadata for Auth Middleware
definePageMeta({
  middleware: 'auth',
  role: 'Admin'
})

const { t } = useI18n()
const loading = ref(false)
const showDialog = ref(false)
const selectedBooking = ref(null)
const filterStatus = ref('all')
const snackbar = reactive({ show: false, text: '', color: '', icon: 'mdi-information' })

const filterOptions = computed(() => [
  { label: 'All', value: 'all', icon: 'mdi-layers' },
  { label: 'Pending', value: 'Pending', icon: 'mdi-clock-fast' },
  { label: 'Approved', value: 'Approved', icon: 'mdi-check-all' }
])

// Mock Data
const stats = computed(() => [
  { title: t('booths.stats.total'), value: 23, icon: 'mdi-store-outline', color: 'primary' },
  { title: t('booths.stats.booked'), value: 6, icon: 'mdi-check-decagram-outline', color: 'success' },
  { title: t('booths.stats.pending'), value: 5, icon: 'mdi-clock-outline', color: 'orange' },
  { title: t('booths.stats.available'), value: 12, icon: 'mdi-store-remove-outline', color: 'purple' },
])

const zoneStats = ref([
  { zone: 'A', booked: 2, total: 6 },
  { zone: 'B', booked: 1, total: 6 },
  { zone: 'C', booked: 1, total: 4 },
  { zone: 'D', booked: 0, total: 4 },
  { zone: 'E', booked: 1, total: 3 },
])

const recentActivity = ref([
  { text: 'Somphone ຈອງບູດ A2', time: '10 ນາທີກ່ອນ', color: 'orange-pulse' },
  { text: 'Maly ຈອງບູດ C1', time: '1 ຊົ່ວໂມງກ່ອນ', color: 'orange-pulse' },
  { text: 'Admin ອະນຸມັດບູດ A1', time: '2 ຊົ່ວໂມງກ່ອນ', color: 'success-pulse' },
  { text: 'Somchai ຈອງບູດ A1', time: '3 ຊົ່ວໂມງກ່ອນ', color: 'success-pulse' },
])

const boothStatuses = ref({
  'A1': 'Booked', 'A2': 'Pending',
  'B1': 'Booked',
  'C1': 'Pending',
  'E1': 'Booked',
} as any)

const bookings = ref([
  { 
    id: 'BK001', 
    boothId: 'A2', 
    storeName: 'ຮ້ານອາຫານມົ້ງແຊບ', 
    owner: 'ທ້າວ ສົມພອນ', 
    phone: '020 55551234', 
    status: 'Pending', 
    category: 'Food',
    paymentProof: '/images/slip-placeholder.png',
    createdAt: '2026-05-09 10:30' 
  },
  { 
    id: 'BK002', 
    boothId: 'C1', 
    storeName: 'ເຄື່ອງນຸ່ງເຜົ່າມົ້ງ', 
    owner: 'ນາງ ມາລີ', 
    phone: '020 99998888', 
    status: 'Pending', 
    category: 'Clothes',
    paymentProof: '/images/slip-placeholder.png',
    createdAt: '2026-05-09 09:15' 
  },
  { 
    id: 'BK003', 
    boothId: 'A1', 
    storeName: 'ຮ້ານກາເຟ', 
    owner: 'ທ້າວ ບຸນມີ', 
    phone: '020 22223333', 
    status: 'Approved', 
    category: 'Food',
    paymentProof: '/images/slip-placeholder.png',
    createdAt: '2026-05-08 14:00' 
  },
])

const filteredBookings = computed(() => {
  if (filterStatus.value === 'all') return bookings.value
  return bookings.value.filter(b => b.status === filterStatus.value)
})

const getZoneColor = (zone: string) => {
  const colors: any = { A: 'primary', B: 'success', C: 'orange', D: 'purple', E: 'error' }
  return colors[zone] || 'grey'
}

const fetchData = async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  loading.value = false
  showToast(t('booths.toast.updated'), 'primary', 'mdi-cached')
}

const onBoothClick = (id: string) => {
  const booking = bookings.value.find(b => b.boothId === id)
  if (booking) {
    viewBooking(booking)
  } else {
    showToast(t('booths.toast.available', { id }), 'primary', 'mdi-store-search')
  }
}

const viewBooking = (booking: any) => {
  selectedBooking.value = booking
  showDialog.value = true
}

const handleApprove = async (booking: any) => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const b = bookings.value.find(item => item.id === booking.id)
  if (b) b.status = 'Approved'
  
  boothStatuses.value[booking.boothId] = 'Booked'
  
  showDialog.value = false
  loading.value = false
  showToast(t('booths.toast.approved'), 'success', 'mdi-check-circle')
}

const handleReject = async (booking: any) => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const b = bookings.value.find(item => item.id === booking.id)
  if (b) b.status = 'Rejected'
  
  boothStatuses.value[booking.boothId] = 'Available'
  
  showDialog.value = false
  loading.value = false
  showToast(t('booths.toast.rejected'), 'error', 'mdi-close-circle')
}

const approveBooking = (booking: any) => handleApprove(booking)
const rejectBooking = (booking: any) => handleReject(booking)

const showToast = (text: string, color: string, icon: string) => {
  snackbar.text = text
  snackbar.color = color
  snackbar.icon = icon
  snackbar.show = true
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.lh-1 { line-height: 1.1; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }

.glass-card {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-panel {
  background-color: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.shadow-premium {
  box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.08) !important;
}

.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05) !important;
}

.card-header-gradient {
  background: linear-gradient(135deg, #1976D2 0%, #0D47A1 100%);
}

.card-header-gradient-alt {
  background: linear-gradient(135deg, #37474F 0%, #263238 100%);
}

.segmented-control {
  min-width: 320px;
  border: 1px solid rgba(0,0,0,0.05);
}

.refresh-btn {
  transition: all 0.3s ease;
}
.refresh-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 20px -5px rgba(25, 118, 210, 0.5) !important;
}

.stat-card {
  overflow: hidden;
  position: relative;
  border-left: 0 !important;
}

.border-left-thick {
  border-left-width: 6px !important;
  border-left-style: solid !important;
}

.border-primary { border-left-color: #1976D2 !important; }
.border-success { border-left-color: #4CAF50 !important; }
.border-orange { border-left-color: #FB8C00 !important; }
.border-purple { border-left-color: #9C27B0 !important; }

.stat-icon-wrapper {
  padding: 14px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon-wrapper {
  transform: rotate(-10deg) scale(1.1);
}

.sparkline-overlay {
  position: absolute;
  bottom: 8px;
  right: 12px;
  width: 70px;
  opacity: 0.2;
}

.activity-feed {
  position: relative;
}

.border-left-thin {
  border-left: 2px solid #ECEFF1;
}

.activity-dot-pulse {
  position: absolute;
  left: -6px;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
  z-index: 1;
}

.orange-pulse { 
  background-color: #FB8C00;
  box-shadow: 0 0 0 rgba(251, 140, 0, 0.4);
  animation: pulse-orange 2s infinite;
}

.success-pulse { 
  background-color: #4CAF50;
  box-shadow: 0 0 0 rgba(76, 175, 80, 0.4);
  animation: pulse-success 2s infinite;
}

@keyframes pulse-orange {
  0% { box-shadow: 0 0 0 0 rgba(251, 140, 0, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(251, 140, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(251, 140, 0, 0); }
}

@keyframes pulse-success {
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}

.text-white-20 { background-color: rgba(255, 255, 255, 0.15); }
.text-white-70 { color: rgba(255, 255, 255, 0.75); }
.bg-white-50 { background-color: rgba(255, 255, 255, 0.5); }

.border-thin { border: 1px solid rgba(0,0,0,0.05) !important; }
.border-dashed { border-style: dashed !important; }

.transition-all { transition: all 0.3s ease; }

.custom-snackbar {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
}
</style>
