<template>
  <v-container fluid class="pa-6">
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <div v-else class="animate-fade">
      <v-row class="mb-6">
        <v-col cols="12" class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div>
            <div class="d-flex align-center text-primary mb-1">
              <v-icon icon="mdi-calendar-text" class="mr-2"></v-icon>
              <span class="text-overline font-weight-bold">CUSTOMER REGISTRY</span>
            </div>
            <h1 class="text-h3 font-weight-black text-primary">
              ປະຫວັດການຈອງຂອງຂ້ອຍ (My Bookings)
            </h1>
            <p class="text-subtitle-1 text-grey">
              ກວດສອບສະຖານະການຈອງບູດຮ້ານຄ້າ ແລະ ການຊຳລະເງິນຂອງທ່ານ
            </p>
          </div>
          
          <v-btn 
            color="primary" 
            prepend-icon="mdi-store-search" 
            rounded="xl" 
            height="48"
            class="px-6 shadow-md"
            :to="localePath('/booths')"
          >
            ຈອງບູດເພີ່ມ (Book More)
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card class="glass-card rounded-2xl border overflow-hidden shadow-premium">
            <v-table class="bg-transparent text-left" density="comfortable">
              <thead>
                <tr class="bg-slate font-weight-black">
                  <th class="text-subtitle-2 font-weight-bold py-4">ລະຫັດຈອງ (Booking ID)</th>
                  <th class="text-subtitle-2 font-weight-bold">ບູດ (Booth Code)</th>
                  <th class="text-subtitle-2 font-weight-bold">ຊື່ຮ້ານ (Store Name)</th>
                  <th class="text-subtitle-2 font-weight-bold">ປະເພດ (Category)</th>
                  <th class="text-subtitle-2 font-weight-bold">ລາຄາ (Price)</th>
                  <th class="text-subtitle-2 font-weight-bold">ສະຖານະການຈອງ (Booking)</th>
                  <th class="text-subtitle-2 font-weight-bold">ສະຖານະການຊຳລະ (Payment)</th>
                  <th class="text-subtitle-2 font-weight-bold text-right">ຈັດການ (Actions)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in myBookings" :key="booking.id" class="border-b hover-bg">
                  <td class="font-weight-black text-primary py-4">#BK-0{{ booking.id }}</td>
                  <td class="font-weight-bold">{{ booking.booth?.code || 'N/A' }}</td>
                  <td>{{ booking.storeName }}</td>
                  <td>
                    <v-chip size="x-small" color="secondary" variant="flat" class="font-weight-bold">
                      {{ booking.category }}
                    </v-chip>
                  </td>
                  <td class="font-weight-bold text-primary">{{ formatKip(booking.totalPrice) }} LAK</td>
                  <td>
                    <v-chip :color="getBookingStatusColor(booking.status)" size="small" variant="flat" class="font-weight-bold">
                      {{ getBookingStatusLaoText(booking.status) }}
                    </v-chip>
                  </td>
                  <td>
                    <v-chip :color="getPaymentStatusColor(booking.payment?.status)" size="small" variant="tonal" class="font-weight-bold">
                      {{ getPaymentStatusLaoText(booking.payment?.status) }}
                    </v-chip>
                  </td>
                  <td class="text-right">
                    <div class="d-flex align-center justify-end gap-2">
                      <!-- Details -->
                      <v-btn icon="mdi-eye" size="small" color="primary" variant="text" @click="viewDetails(booking)"></v-btn>
                      
                      <!-- Cancel Booking -->
                      <v-btn 
                        v-if="booking.status === 'pending'" 
                        icon="mdi-cancel" 
                        size="small" 
                        color="error" 
                        variant="text" 
                        @click="cancelBooking(booking.id)"
                      ></v-btn>
                    </div>
                  </td>
                </tr>

                <tr v-if="myBookings.length === 0">
                  <td colspan="8" class="text-center py-12 text-grey">
                    <v-icon icon="mdi-receipt-text-minus-outline" size="56" class="mb-2"></v-icon>
                    <p class="font-weight-bold">ທ່ານຍັງບໍ່ມີປະຫວັດການຈອງເທື່ອ</p>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Booking Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="600">
      <v-card v-if="selectedBooking" class="rounded-xl overflow-hidden glass-dialog">
        <v-toolbar color="primary" flat dark>
          <v-toolbar-title class="font-weight-bold text-white">ລາຍລະອຽດການຈອງ (Booking Details)</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="detailsDialog = false" color="white" variant="text">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-row dense>
            <v-col cols="6" class="pb-3">
              <span class="text-caption text-grey d-block">ລະຫັດການຈອງ</span>
              <span class="text-subtitle-2 font-weight-black text-primary">#BK-0{{ selectedBooking.id }}</span>
            </v-col>
            <v-col cols="6" class="pb-3">
              <span class="text-caption text-grey d-block">ບູດທີ່ຈອງ</span>
              <span class="text-subtitle-2 font-weight-black text-primary">{{ selectedBooking.booth?.code }}</span>
            </v-col>

            <v-col cols="12"><v-divider class="my-2"></v-divider></v-col>

            <v-col cols="12" class="py-2">
              <span class="text-caption text-grey d-block">ຊື່ຮ້ານຄ້າ</span>
              <span class="text-subtitle-1 font-weight-bold">{{ selectedBooking.storeName }}</span>
            </v-col>

            <v-col cols="6" class="py-2">
              <span class="text-caption text-grey d-block">ຊື່ເຈົ້າຂອງຮ້ານ</span>
              <span class="text-subtitle-2 font-weight-bold">{{ selectedBooking.ownerName }}</span>
            </v-col>
            <v-col cols="6" class="py-2">
              <span class="text-caption text-grey d-block">ເບີໂທລະສັບ</span>
              <span class="text-subtitle-2 font-weight-bold">{{ selectedBooking.phone }}</span>
            </v-col>

            <v-col cols="12"><v-divider class="my-2"></v-divider></v-col>

            <v-col cols="6" class="py-2">
              <span class="text-caption text-grey d-block">ເລກອ້າງອີງການໂອນ</span>
              <span class="text-subtitle-2 font-weight-bold text-primary">{{ selectedBooking.payment?.transactionRef || 'N/A' }}</span>
            </v-col>
            <v-col cols="6" class="py-2 text-right">
              <span class="text-caption text-grey d-block">ລາຄາທັງໝົດ</span>
              <span class="text-h6 font-weight-black text-primary">{{ formatKip(selectedBooking.totalPrice) }} LAK</span>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- SnackBar Alerts -->
    <v-snackbar v-model="toast.show" :color="toast.color" timeout="3000" location="top right" rounded="xl">
      <div class="d-flex align-center">
        <v-icon :icon="toast.icon" class="mr-2"></v-icon>
        <span class="font-weight-bold">{{ toast.text }}</span>
      </div>
    </v-snackbar>
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
const config = useRuntimeConfig()

const loading = ref(false)
const myBookings = ref<any[]>([])
const detailsDialog = ref(false)
const selectedBooking = ref<any>(null)

const toast = reactive({ show: false, text: '', color: '', icon: '' })

onMounted(async () => {
  await fetchMyBookings()
})

const fetchMyBookings = async () => {
  loading.value = true
  try {
    authStore.initialize()
    const response = await $fetch<any>(`${config.public.apiBase}/bookings/my/list`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (response && response.success) {
      myBookings.value = response.data.map((booking: any) => {
        let extra = {} as any
        try {
          if (booking.notes && booking.notes.startsWith('{')) {
            extra = JSON.parse(booking.notes)
          }
        } catch (e) {}
        return {
          ...booking,
          storeName: extra.storeName || booking.notes || 'N/A',
          ownerName: extra.ownerName || (booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName}` : 'N/A'),
          phone: extra.phone || booking.customer?.phone || 'N/A',
          category: extra.category || 'General'
        }
      })
    }
  } catch (e) {
    console.error('Failed to load my bookings', e)
  } finally {
    loading.value = false
  }
}

const cancelBooking = async (id: number) => {
  if (!confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຍົກເລີກການຈອງນີ້?')) return
  try {
    const response = await $fetch<any>(`${config.public.apiBase}/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (response && response.success) {
      showToast('ຍົກເລີກການຈອງສຳເລັດ!', 'success', 'mdi-check-circle')
      await fetchMyBookings()
    }
  } catch (e: any) {
    const err = e.response?._data?.message || 'ບໍ່ສາມາດຍົກເລີກການຈອງໄດ້'
    showToast(err, 'error', 'mdi-alert')
  }
}

const formatKip = (val: number | string) => {
  const num = Number(val)
  if (isNaN(num)) return val
  return num.toLocaleString()
}

const viewDetails = (booking: any) => {
  selectedBooking.value = booking
  detailsDialog.value = true
}

const getBookingStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'orange'
    case 'confirmed': return 'success'
    case 'cancelled': return 'error'
    case 'completed': return 'blue'
    default: return 'grey'
  }
}

const getBookingStatusLaoText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'ລໍຖ້າກວດສອບ'
    case 'confirmed': return 'ອະນຸມັດແລ້ວ'
    case 'cancelled': return 'ຍົກເລີກແລ້ວ'
    case 'completed': return 'ສຳເລັດແລ້ວ'
    default: return status
  }
}

const getPaymentStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'orange'
    case 'completed': return 'success'
    case 'failed': return 'error'
    case 'refunded': return 'purple'
    default: return 'grey'
  }
}

const getPaymentStatusLaoText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'ລໍຖ້າການໂອນ'
    case 'completed': return 'ຊຳລະສຳເລັດ'
    case 'failed': return 'ຜິດພາດ'
    case 'refunded': return 'ຄືນເງິນແລ້ວ'
    default: return status || 'ລໍຖ້າການໂອນ'
  }
}

const showToast = (text: string, color: string, icon: string) => {
  toast.text = text
  toast.color = color
  toast.icon = icon
  toast.show = true
}
</script>

<style scoped>
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }

.glass-card {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
}

.shadow-premium {
  box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.08) !important;
}

.hover-bg:hover {
  background-color: rgba(0,0,0,0.01);
}

.bg-slate {
  background-color: #F8F9FA;
}

.glass-dialog {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.animate-fade {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
