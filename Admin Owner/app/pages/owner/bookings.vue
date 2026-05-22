<template>
  <v-container fluid class="pa-6">
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <div v-else class="animate-fade">
      <!-- Header -->
      <v-row class="mb-6">
        <v-col cols="12" class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div>
            <div class="d-flex align-center text-primary mb-1">
              <v-icon icon="mdi-calendar-check" class="mr-2"></v-icon>
              <span class="text-overline font-weight-bold">OWNER PORTAL</span>
            </div>
            <h1 class="text-h3 font-weight-black text-primary">
              ກວດສອບການຈອງບູດ (Zone Bookings)
            </h1>
            <p class="text-subtitle-1 text-grey">
              ກວດສອບສະລິບໂອນເງິນ ແລະ ອະນຸມັດ/ປະຕິເສດ ການຈອງບູດໃນເຂດຂອງທ່ານ
            </p>
          </div>
          
          <v-btn 
            color="primary" 
            prepend-icon="mdi-refresh" 
            rounded="xl" 
            height="48"
            class="px-6 shadow-md"
            @click="fetchBookings"
            :loading="loading"
          >
            ໂຫຼດຄືນໃໝ່ (Refresh)
          </v-btn>
        </v-col>
      </v-row>

      <!-- Premium Stats Overview -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.title">
          <v-card class="glass-card pa-4 rounded-xl d-flex align-center border shadow-sm">
            <v-avatar :color="stat.color + '-lighten-5'" size="56" class="mr-4">
              <v-icon :icon="stat.icon" :color="stat.color" size="28"></v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-grey font-weight-bold">{{ stat.title }}</div>
              <div class="text-h5 font-weight-bold" :class="`text-${stat.color}`">{{ stat.value }}</div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Bookings Table Section -->
      <v-row>
        <v-col cols="12">
          <v-card class="glass-card rounded-2xl border overflow-hidden shadow-premium">
            <div class="pa-6 border-b d-flex align-center justify-space-between flex-wrap gap-4 bg-white-50">
              <div class="d-flex align-center">
                <v-text-field
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  label="ຄົ້ນຫາຊື່ຮ້ານ ຫຼື ເບີໂທ..."
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="max-width-300 mr-4"
                  rounded="lg"
                ></v-text-field>
              </div>

              <!-- Modern Segmented Control -->
              <div class="segmented-control glass-panel pa-1 rounded-xl d-flex align-center">
                <v-btn 
                  v-for="status in filterOptions" 
                  :key="status.value"
                  :value="status.value"
                  variant="flat"
                  :color="filterStatus === status.value ? 'primary' : 'transparent'"
                  class="rounded-lg px-4 transition-all"
                  :class="filterStatus === status.value ? 'shadow-md font-weight-bold text-white' : 'text-grey'"
                  height="36"
                  @click="filterStatus = status.value"
                >
                  <span class="text-caption font-weight-bold">{{ status.label }}</span>
                </v-btn>
              </div>
            </div>

            <BookingTable 
              :bookings="filteredBookings" 
              :loading="loading"
              @view="viewBooking"
              @approve="approveBooking"
              @reject="rejectBooking"
              class="mt-0 border-0"
            />
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Details Dialog -->
    <BookingActionDialog
      v-slot:default
      v-model="showDialog"
      :booking="selectedBooking"
      @approve="handleApprove"
      @reject="handleReject"
    />

    <!-- Toast Notification -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top right" rounded="xl" elevation="12">
      <div class="d-flex align-center">
        <v-icon :icon="snackbar.icon" class="mr-2"></v-icon>
        <span class="font-weight-bold">{{ snackbar.text }}</span>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
  role: 'owner'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()

const loading = ref(false)
const showDialog = ref(false)
const selectedBooking = ref<any>(null)
const filterStatus = ref('all')
const search = ref('')
const bookingsList = ref<any[]>([])

const snackbar = reactive({ show: false, text: '', color: '', icon: 'mdi-information' })

const filterOptions = [
  { label: 'ທັງໝົດ (All)', value: 'all' },
  { label: 'ລໍຖ້າກວດສອບ (Pending)', value: 'Pending' },
  { label: 'ອະນຸມັດແລ້ວ (Approved)', value: 'Approved' },
  { label: 'ປະຕິເສດແລ້ວ (Rejected)', value: 'Rejected' }
]

const stats = computed(() => {
  return [
    { title: 'ທັງໝົດ (Total)', value: bookingsList.value.length, icon: 'mdi-layers-outline', color: 'primary' },
    { title: 'ລໍຖ້າກວດສອບ (Pending)', value: bookingsList.value.filter(b => b.status === 'Pending').length, icon: 'mdi-clock-outline', color: 'orange' },
    { title: 'ອະນຸມັດແລ້ວ (Approved)', value: bookingsList.value.filter(b => b.status === 'Approved').length, icon: 'mdi-check-decagram-outline', color: 'success' },
    { title: 'ປະຕິເສດແລ້ວ (Rejected)', value: bookingsList.value.filter(b => b.status === 'Rejected').length, icon: 'mdi-close-circle-outline', color: 'error' },
  ]
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
      b.id?.toString().includes(q)
    )
  }

  return result
})

onMounted(async () => {
  await fetchBookings()
})

const fetchBookings = async () => {
  loading.value = true
  try {
    authStore.initialize()
    const response = await $fetch<any>(`${config.public.apiBase}/bookings`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    
    if (response && response.success) {
      bookingsList.value = response.data.map((b: any) => {
        let extra = {} as any
        try {
          if (b.notes && b.notes.startsWith('{')) {
            extra = JSON.parse(b.notes)
          }
        } catch (e) {}

        let uiStatus = 'Pending'
        if (b.status === 'confirmed') uiStatus = 'Approved'
        else if (b.status === 'cancelled') uiStatus = 'Rejected'

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
  } catch (e) {
    console.error('Failed to load owner bookings', e)
    showToast('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນການຈອງໄດ້', 'error', 'mdi-alert')
  } finally {
    loading.value = false
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
      await fetchBookings()
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
      await fetchBookings()
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
</script>

<style scoped>
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

.bg-white-50 {
  background-color: rgba(255, 255, 255, 0.5) !important;
}

.segmented-control {
  border: 1px solid rgba(0,0,0,0.05);
}

.max-width-300 {
  max-width: 300px;
}

.animate-fade {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
