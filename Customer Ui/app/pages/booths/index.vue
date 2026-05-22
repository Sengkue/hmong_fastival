<template>
  <v-container fluid class="pa-6">
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <div v-else>
      <!-- Zone selection view if no zoneId provided -->
      <div v-if="!selectedZoneId" class="animate-fade">
        <v-row class="mb-6 text-center">
          <v-col cols="12">
            <h1 class="text-h3 font-weight-black text-primary mb-2">ເລືອກເຂດຈັດງານ (Select Zone)</h1>
            <p class="text-subtitle-1 text-grey">ເລືອກເຂດຈັດງານເພື່ອເບິ່ງຜັງບູດທັງໝົດ</p>
          </v-col>
        </v-row>

        <v-row justify="center">
          <v-col cols="12" md="4" v-for="zone in zoneList" :key="zone.id">
            <v-card class="glass-card pa-6 rounded-2xl text-center hover-card" elevation="2" @click="selectZone(zone.id)">
              <v-avatar :color="zone.color || 'primary'" size="64" class="mb-4 text-white font-weight-bold text-h5">
                {{ zone.name?.charAt(0) }}
              </v-avatar>
              <h3 class="text-h5 font-weight-bold mb-2">{{ zone.name }}</h3>
              <p class="text-body-2 text-grey mb-4">{{ zone.description || 'ເຂດບູດງານບຸນກິນຈຽງ' }}</p>
              <v-btn block color="primary" variant="tonal" class="rounded-lg font-weight-bold">
                ເບິ່ງແຜນຜັງບູດ (View Booths)
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Booth Grid view if zoneId selected -->
      <div v-else class="animate-fade">
        <v-row class="mb-4">
          <v-col cols="12" class="d-flex align-center justify-space-between flex-wrap gap-4">
            <div class="d-flex align-center">
              <v-btn icon="mdi-arrow-left" variant="outlined" color="primary" class="mr-4 rounded-xl" @click="backToZones"></v-btn>
              <div>
                <h1 class="text-h3 font-weight-black text-primary d-flex align-center">
                  ເຂດບູດ: {{ activeZoneName }}
                </h1>
                <p class="text-subtitle-1 text-grey">ຄລິກເລືອກບູດທີ່ຫວ່າງ (ສີຂາວ) ເພື່ອທຳການຈອງ</p>
              </div>
            </div>

            <!-- Stats Badge list -->
            <div class="d-flex align-center gap-3">
              <v-chip color="success" class="font-weight-bold" variant="flat">
                ຫວ່າງ: {{ stats.available }}
              </v-chip>
              <v-chip color="warning" class="font-weight-bold" variant="flat">
                ລໍຖ້າກວດສອບ: {{ stats.pending }}
              </v-chip>
              <v-chip color="primary" class="font-weight-bold" variant="flat">
                ຈອງແລ້ວ: {{ stats.booked }}
              </v-chip>
            </div>
          </v-col>
        </v-row>

        <!-- Search and filters -->
        <v-row class="mb-6">
          <v-col cols="12" md="6" lg="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="ຄົ້ນຫາລະຫັດບູດ..."
              variant="outlined"
              density="comfortable"
              hide-details
              class="rounded-lg bg-white"
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Interactive SVG Grid or Grid Cards Layout -->
        <v-card class="glass-card pa-6 rounded-2xl border mb-6 shadow-premium overflow-hidden">
          <div class="grid-layout-title mb-4 font-weight-black text-primary text-subtitle-1">
            <v-icon icon="mdi-apps" class="mr-2" size="20"></v-icon>
            ຜັງບູດຈັດງານ (Interactive Booths Grid Map):
          </div>

          <v-row v-if="filteredBooths.length > 0">
            <v-col cols="6" sm="4" md="3" lg="2" v-for="booth in filteredBooths" :key="booth.id">
              <v-hover v-slot:default="{ isHovering, props }">
                <v-card
                  v-bind="props"
                  class="booth-card pa-4 rounded-xl border text-center cursor-pointer transition-all position-relative"
                  :class="getBoothClass(booth.status)"
                  :elevation="isHovering && booth.status === 'available' ? 8 : 1"
                  @click="onBoothClick(booth)"
                >
                  <div class="text-caption text-grey-darken-1 font-weight-bold mb-1">ບູດ (Booth)</div>
                  <div class="text-h5 font-weight-black mb-2" :class="getBoothTextClass(booth.status)">
                    {{ booth.code }}
                  </div>
                  <div class="text-subtitle-2 font-weight-black text-primary mb-2">
                    {{ formatKip(booth.price) }} LAK
                  </div>
                  
                  <v-chip :color="getStatusColor(booth.status)" size="x-small" class="font-weight-black uppercase">
                    {{ getStatusLaoText(booth.status) }}
                  </v-chip>

                  <!-- Quick checkout hint on hover -->
                  <div v-if="isHovering && booth.status === 'available'" class="hover-checkout-indicator">
                    <v-icon icon="mdi-store-clock-outline" color="white" size="24"></v-icon>
                  </div>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>

          <div v-else class="text-center py-12 text-grey">
            <v-icon icon="mdi-store-remove" size="56" class="mb-2"></v-icon>
            <p>ບໍ່ພົບຂໍ້ມູນບູດໃນລະບົບ</p>
          </div>
        </v-card>
      </div>

      <!-- Booking Wizard Dialog -->
      <BoothBookingDialog
        v-model="bookingDialog"
        :booth-id="selectedBooth?.id || ''"
        :booth-code="selectedBooth?.code || ''"
        :price="selectedBooth?.price || 0"
        :loading="submitLoading"
        @submit="handleBookingSubmit"
      />

      <!-- Toast Alerts -->
      <v-snackbar v-model="toast.show" :color="toast.color" timeout="3000" location="top right" rounded="xl">
        <div class="d-flex align-center">
          <v-icon :icon="toast.icon" class="mr-2"></v-icon>
          <span class="font-weight-bold">{{ toast.text }}</span>
        </div>
      </v-snackbar>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const authStore = useAuthStore()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const loading = ref(false)
const submitLoading = ref(false)
const selectedZoneId = ref<number | null>(null)
const activeZoneName = ref('')
const zoneList = ref<any[]>([])
const booths = ref<any[]>([])
const search = ref('')

const bookingDialog = ref(false)
const selectedBooth = ref<any>(null)

const toast = reactive({ show: false, text: '', color: '', icon: '' })

onMounted(async () => {
  authStore.initialize()
  
  if (route.query.zoneId) {
    selectedZoneId.value = Number(route.query.zoneId)
    await fetchBooths()
  } else {
    await fetchZones()
  }
})

watch(() => route.query.zoneId, async (newVal) => {
  if (newVal) {
    selectedZoneId.value = Number(newVal)
    await fetchBooths()
  } else {
    selectedZoneId.value = null
    await fetchZones()
  }
})

const fetchZones = async () => {
  loading.value = true
  try {
    const response = await $fetch<any>(`${config.public.apiBase}/zones`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (response && response.success) {
      zoneList.value = response.data
    }
  } catch (e) {
    console.error('Failed to load zones', e)
  } finally {
    loading.value = false
  }
}

const fetchBooths = async () => {
  if (!selectedZoneId.value) return
  loading.value = true
  try {
    // First get zone detail name
    const zoneResponse = await $fetch<any>(`${config.public.apiBase}/zones/${selectedZoneId.value}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (zoneResponse && zoneResponse.success) {
      activeZoneName.value = zoneResponse.data.name
    }

    const response = await $fetch<any>(`${config.public.apiBase}/booths?zoneId=${selectedZoneId.value}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (response && response.success) {
      booths.value = response.data
    }
  } catch (e) {
    console.error('Failed to load booths', e)
  } finally {
    loading.value = false
  }
}

const filteredBooths = computed(() => {
  if (!search.value) return booths.value
  return booths.value.filter(b => b.code.toLowerCase().includes(search.value.toLowerCase()))
})

const stats = computed(() => {
  return {
    available: booths.value.filter(b => b.status === 'available').length,
    pending: booths.value.filter(b => b.status === 'booked' && !b.isConfirmed).length, // simulated or pending status
    booked: booths.value.filter(b => b.status === 'booked' || b.status === 'maintenance').length
  }
})

const formatKip = (val: number | string) => {
  const num = Number(val)
  if (isNaN(num)) return val
  return num.toLocaleString()
}

const selectZone = (id: number) => {
  navigateTo(localePath(`/booths?zoneId=${id}`))
}

const backToZones = () => {
  navigateTo(localePath('/booths'))
}

const onBoothClick = (booth: any) => {
  if (booth.status !== 'available') {
    showToast('ບູດນີ້ຖືກຈອງ ຫຼື ປິດປັບປຸງແລ້ວ!', 'error', 'mdi-close-circle')
    return
  }
  selectedBooth.value = booth
  bookingDialog.value = true
}

const getBoothClass = (status: string) => {
  if (status === 'available') return 'booth-available border-success-lighten-3 bg-white'
  if (status === 'booked') return 'booth-booked border-primary bg-primary-lighten-5'
  return 'booth-maintenance border-grey bg-grey-lighten-4'
}

const getBoothTextClass = (status: string) => {
  if (status === 'available') return 'text-success'
  if (status === 'booked') return 'text-primary'
  return 'text-grey'
}

const getStatusColor = (status: string) => {
  if (status === 'available') return 'success'
  if (status === 'booked') return 'primary'
  return 'grey'
}

const getStatusLaoText = (status: string) => {
  if (status === 'available') return 'ຫວ່າງ (Available)'
  if (status === 'booked') return 'ຈອງແລ້ວ (Booked)'
  return 'ປັບປຸງ (Maintenance)'
}

const handleBookingSubmit = async (data: any) => {
  submitLoading.value = true
  try {
    // 1. POST request to create Booking
    const bookingResponse = await $fetch<any>(`${config.public.apiBase}/bookings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: {
        boothId: data.boothId,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days
        notes: JSON.stringify({
          storeName: data.storeName,
          ownerName: data.ownerName,
          phone: data.phone,
          category: data.category
        })
      }
    })

    if (bookingResponse && bookingResponse.success && bookingResponse.data) {
      const bookingId = bookingResponse.data.id
      const amount = bookingResponse.data.totalPrice || selectedBooth.value.price

      // 2. POST request to submit Payment
      const paymentResponse = await $fetch<any>(`${config.public.apiBase}/payments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: {
          bookingId: bookingId,
          amount: amount,
          method: 'transfer',
          transactionRef: data.transactionRef
        }
      })

      if (paymentResponse && paymentResponse.success) {
        showToast('ສົ່ງການຈອງ ແລະ ຊຳລະເງິນສຳເລັດ!', 'success', 'mdi-check-circle')
        bookingDialog.value = false
        setTimeout(() => {
          navigateTo(localePath(`/booths/success?ref=REF-${bookingId}`))
        }, 800)
      } else {
        showToast('ບໍ່ສາມາດສ້າງລາຍການຊຳລະເງິນໄດ້', 'error', 'mdi-alert-circle')
      }
    } else {
      showToast('ບໍ່ສາມາດສ້າງການຈອງໄດ້', 'error', 'mdi-alert-circle')
    }
  } catch (e: any) {
    const errorMsg = e.response?._data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່'
    showToast(errorMsg, 'error', 'mdi-alert')
  } finally {
    submitLoading.value = false
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
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }

.glass-card {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
}

.shadow-premium {
  box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.08) !important;
}

.hover-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.hover-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.1) !important;
}

.booth-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  height: 100%;
}

.booth-available {
  border-width: 2px !important;
}

.booth-booked {
  border-width: 1px !important;
  opacity: 0.85;
}

.booth-maintenance {
  border-width: 1px !important;
  opacity: 0.6;
}

.hover-checkout-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(25, 118, 210, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.booth-card:hover .hover-checkout-indicator {
  opacity: 1;
}

.uppercase {
  text-transform: uppercase;
}

.animate-fade {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
