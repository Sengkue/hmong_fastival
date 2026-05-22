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
              {{ $t('booths.title') }} <span class="text-grey-darken-1 font-weight-light">(Bookings Cockpit)</span>
            </h1>
            <p class="text-subtitle-1 text-grey-darken-1 d-flex align-center mt-1">
              <v-icon icon="mdi-information-outline" size="small" class="mr-1 text-primary"></v-icon>
              {{ $t('booths.subtitle') || 'ກວດສອບ ແລະ ອະນຸມັດການຈອງບູດທັງໝົດໃນລະບົບ' }}
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
                <div class="activity-dot-pulse animate-pulse" :class="activity.color"></div>
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
          <div class="pa-6 border-b d-flex align-center flex-wrap gap-4 bg-white-50">
            <v-avatar color="primary" variant="tonal" size="48" class="mr-4">
              <v-icon icon="mdi-format-list-bulleted" color="primary" size="24"></v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="text-h4 font-weight-bold text-primary">{{ $t('booths.booking_list') }}</div>
              <div class="text-subtitle-2 text-grey font-weight-medium">{{ $t('booths.booking_requests') }}</div>
            </div>
            
            <!-- Dynamic Search input -->
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="ຄົ້ນຫາຊື່ຮ້ານ, ເບີໂທ ຫຼື ບູດ..."
              variant="outlined"
              density="compact"
              hide-details
              class="max-width-300 mr-4"
              rounded="lg"
            ></v-text-field>
            
            <!-- Modern Segmented Control -->
            <div class="segmented-control glass-panel pa-1 rounded-xl d-flex align-center shadow-inner">
              <v-btn 
                v-for="status in filterOptions" 
                :key="status.value"
                :value="status.value"
                variant="flat"
                :color="filterStatus === status.value ? 'primary' : 'transparent'"
                class="rounded-lg px-4 transition-all"
                :class="filterStatus === status.value ? 'shadow-md elevation-2 text-white font-weight-bold' : 'text-grey'"
                height="36"
                @click="filterStatus = status.value"
              >
                <span class="text-caption font-weight-bold">{{ status.label }}</span>
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
              class="mt-0 border-0"
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
        <span class="font-weight-bold text-subtitle-2 text-grey-darken-4">{{ snackbar.text }}</span>
      </div>
      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" size="small" @click="snackbar.show = false"></v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Page Metadata for Auth Middleware
definePageMeta({
  middleware: 'auth',
  role: 'admin'
})

const { t } = useI18n()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const loading = ref(false)
const showDialog = ref(false)
const selectedBooking = ref<any>(null)
const filterStatus = ref('all')
const search = ref('')

const boothsList = ref<any[]>([])
const bookingsList = ref<any[]>([])

const snackbar = reactive({ show: false, text: '', color: '', icon: 'mdi-information' })

const filterOptions = computed(() => [
  { label: 'ທັງໝົດ (All)', value: 'all' },
  { label: 'ລໍຖ້າກວດສອບ (Pending)', value: 'Pending' },
  { label: 'ອະນຸມັດແລ້ວ (Approved)', value: 'Approved' },
  { label: 'ປະຕິເສດແລ້ວ (Rejected)', value: 'Rejected' }
])

// Fetch both booths and bookings
const fetchData = async () => {
  loading.value = true
  try {
    authStore.initialize()
    
    // Fetch bookings
    const bookingsResponse = await $fetch<any>(`${config.public.apiBase}/bookings?limit=100`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    
    // Fetch booths
    const boothsResponse = await $fetch<any>(`${config.public.apiBase}/booths?limit=100`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })

    if (bookingsResponse && bookingsResponse.success) {
      bookingsList.value = bookingsResponse.data.map((b: any) => {
        let extra = {} as any
        try {
          if (b.notes && b.notes.startsWith('{')) {
            extra = JSON.parse(b.notes)
          }
        } catch (e) {}

        let uiStatus = 'Pending'
        if (b.status === 'confirmed') uiStatus = 'Approved'
        else if (b.status === 'cancelled') uiStatus = 'Rejected'
        else if (b.status === 'completed') uiStatus = 'Approved'

        return {
          id: b.id,
          boothId: b.booth?.name || `ບູດ ${b.boothId}`,
          storeName: extra.storeName || b.notes || 'N/A',
          owner: extra.ownerName || (b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : 'N/A'),
          phone: extra.phone || b.customer?.phone || 'N/A',
          status: uiStatus,
          category: extra.category || 'General',
          paymentProof: b.payment?.transactionRef ? 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800' : null,
          createdAt: b.created_at ? b.created_at.split('T')[0] : (b.createdAt ? b.createdAt.split('T')[0] : 'N/A')
        }
      })
    }

    if (boothsResponse && boothsResponse.success) {
      boothsList.value = boothsResponse.data
    }
    
    showToast(t('booths.toast.updated') || 'ຂໍ້ມູນຖືກອັບເດດແລ້ວ', 'primary', 'mdi-cached')
  } catch (e) {
    console.error('Failed to load admin booths cockpit data', e)
    showToast('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນລະບົບໄດ້', 'error', 'mdi-alert')
  } finally {
    loading.value = false
  }
}

// Compute dynamic statuses for the SVG Map
const boothStatuses = computed(() => {
  const statuses = {} as any
  const svgBoothIds = [
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
    'C1', 'C2', 'C3', 'C4',
    'D1', 'D2', 'D3', 'D4',
    'E1', 'E2', 'E3'
  ]
  
  // Set default status to Available
  svgBoothIds.forEach(id => {
    statuses[id] = 'Available'
  })

  // Override from database booths statuses
  boothsList.value.forEach((b: any) => {
    if (b.name) {
      let uiStatus = 'Available'
      if (b.status === 'booked') uiStatus = 'Booked'
      else if (b.status === 'maintenance') uiStatus = 'Booked'
      statuses[b.name] = uiStatus
    }
  })

  // Override to 'Pending' if there is any pending booking for that booth name
  bookingsList.value.forEach((b: any) => {
    if (b.status === 'Pending' && b.boothId) {
      statuses[b.boothId] = 'Pending'
    }
  })

  return statuses
})

// Dynamic stats overview
const stats = computed(() => {
  const total = 23 // Standard total SVG booths
  const booked = Object.values(boothStatuses.value).filter(s => s === 'Booked').length
  const pending = Object.values(boothStatuses.value).filter(s => s === 'Pending').length
  const available = Object.values(boothStatuses.value).filter(s => s === 'Available').length

  return [
    { title: t('booths.stats.total') || 'ບູດທັງໝົດ', value: total, icon: 'mdi-store-outline', color: 'primary' },
    { title: t('booths.stats.booked') || 'ຈອງແລ້ວ', value: booked, icon: 'mdi-check-decagram-outline', color: 'success' },
    { title: t('booths.stats.pending') || 'ລໍຖ້າອະນຸມັດ', value: pending, icon: 'mdi-clock-outline', color: 'orange' },
    { title: t('booths.stats.available') || 'ບູດຫວ່າງ', value: available, icon: 'mdi-store-remove-outline', color: 'purple' },
  ]
})

// Dynamic zone details
const zoneStats = computed(() => {
  const zones = ['A', 'B', 'C', 'D', 'E']
  const zoneBoothCounts: any = { A: 6, B: 6, C: 4, D: 4, E: 3 }

  return zones.map(zone => {
    const total = zoneBoothCounts[zone] || 6
    let booked = 0
    for (let i = 1; i <= total; i++) {
      const status = boothStatuses.value[`${zone}${i}`]
      if (status === 'Booked' || status === 'Pending') {
        booked++
      }
    }

    return {
      zone,
      booked,
      total
    }
  })
})

// Dynamic recent activities
const recentActivity = computed(() => {
  if (bookingsList.value.length === 0) {
    return [
      { text: 'ບໍ່ມີການເຄື່ອນໄຫວເທື່ອ', time: '-', color: 'grey-pulse' }
    ]
  }
  return bookingsList.value.slice(0, 4).map(b => {
    const isApproved = b.status === 'Approved'
    const isRejected = b.status === 'Rejected'
    let pulseColor = 'orange-pulse'
    let actionText = 'ໄດ້ຈອງບູດ'
    
    if (isApproved) {
      pulseColor = 'success-pulse'
      actionText = 'ໄດ້ຮັບການອະນຸມັດບູດ'
    } else if (isRejected) {
      pulseColor = 'danger-pulse'
      actionText = 'ຖືກປະຕິເສດບູດ'
    }

    return {
      text: `${b.owner || 'ລູກຄ້າ'} ${actionText} ${b.boothId}`,
      time: b.createdAt || 'N/A',
      color: pulseColor
    }
  })
})

const filteredBookings = computed(() => {
  let result = bookingsList.value
  
  if (filterStatus.value !== 'all') {
    result = result.filter(b => b.status === filterStatus.value)
  }

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(b => 
      b.storeName?.toLowerCase().includes(q) || 
      b.owner?.toLowerCase().includes(q) || 
      b.phone?.includes(q) ||
      b.id?.toString().includes(q) ||
      b.boothId?.toLowerCase().includes(q)
    )
  }

  return result
})

const getZoneColor = (zone: string) => {
  const colors: any = { A: 'primary', B: 'success', C: 'orange', D: 'purple', E: 'error' }
  return colors[zone] || 'grey'
}

const onBoothClick = (id: string) => {
  const booking = bookingsList.value.find(b => b.boothId === id && b.status === 'Pending') 
    || bookingsList.value.find(b => b.boothId === id && b.status === 'Approved')
    || bookingsList.value.find(b => b.boothId === id)
    
  if (booking) {
    viewBooking(booking)
  } else {
    showToast(t('booths.toast.available', { id }) || `ບູດ ${id} ຍັງຫວ່າງ`, 'primary', 'mdi-store-search')
  }
}

const viewBooking = (booking: any) => {
  selectedBooking.value = booking
  showDialog.value = true
}

const handleApprove = async (booking: any) => {
  try {
    const response = await $fetch<any>(`${config.public.apiBase}/bookings/${booking.id}/status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: { status: 'confirmed' }
    })

    if (response && response.success) {
      showToast('ອະນຸມັດການຈອງສຳເລັດ!', 'success', 'mdi-check-circle')
      showDialog.value = false
      await fetchData()
    }
  } catch (e: any) {
    const err = e.response?._data?.message || 'ບໍ່ສາມາດອະນຸມັດການຈອງໄດ້'
    showToast(err, 'error', 'mdi-alert')
  }
}

const handleReject = async (booking: any) => {
  try {
    const response = await $fetch<any>(`${config.public.apiBase}/bookings/${booking.id}/status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: { status: 'cancelled' }
    })

    if (response && response.success) {
      showToast('ປະຕິເສດການຈອງແລ້ວ!', 'error', 'mdi-close-circle')
      showDialog.value = false
      await fetchData()
    }
  } catch (e: any) {
    const err = e.response?._data?.message || 'ບໍ່ສາມາດປະຕິເສດການຈອງໄດ້'
    showToast(err, 'error', 'mdi-alert')
  }
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

.danger-pulse {
  background-color: #F44336;
  box-shadow: 0 0 0 rgba(244, 67, 54, 0.4);
  animation: pulse-danger 2s infinite;
}

.grey-pulse {
  background-color: #9E9E9E;
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

@keyframes pulse-danger {
  0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
  100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
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

.max-width-300 {
  max-width: 300px;
}
</style>
