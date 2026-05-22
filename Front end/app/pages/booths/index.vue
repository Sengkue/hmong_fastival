<template>
  <v-container class="pa-6">
    <v-row>
      <v-col cols="12" class="text-center mb-6">
        <h1 class="text-h4 font-weight-bold text-primary">{{ $t('menu.booth_management') }}</h1>
        <p class="text-subtitle-1 text-grey">ເລືອກບູດທີ່ທ່ານຕ້ອງການຈອງໃນແຜນຜັງລຸ່ມນີ້</p>
      </v-col>

      <v-col cols="12">
        <v-card class="glass-card rounded-xl border shadow-premium pa-4 overflow-hidden">
          <AdminBoothMap 
            :booth-statuses="boothStatuses"
            @select-booth="onBoothSelect"
          />
        </v-card>
      </v-col>

      <v-col cols="12" class="text-center mt-4">
        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-magnify"
          :to="localePath('/booths/my-booking')"
          class="rounded-lg"
        >
          ກວດສອບສະຖານະການຈອງຂອງຂ້ອຍ
        </v-btn>
      </v-col>
    </v-row>

    <!-- Booking Dialog -->
    <BoothBookingDialog
      v-model="bookingDialog"
      :booth-id="selectedBoothId"
      :price="selectedBoothPrice"
      @submit="handleBookingSubmit"
    />

    <!-- Success Snackbar -->
    <v-snackbar v-model="success" color="success" timeout="3000">
      ການຈອງຖືກສົ່ງສຳເລັດ! ລະຫັດອ້າງອີງ: {{ refCode }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
const localePath = useLocalePath()

const boothStatuses = ref<Record<string, any>>({
  'A1': 'Booked',
  'B2': 'Pending',
  'C3': 'Available',
  // ... rest are available by default
})

const bookingDialog = ref(false)
const selectedBoothId = ref('')
const selectedBoothPrice = ref('')
const success = ref(false)
const refCode = ref('')

const prices: Record<string, string> = {
  'A': '500,000',
  'B': '400,000',
  'C': '350,000',
  'D': '300,000',
  'E': '800,000'
}

const onBoothSelect = (id: string) => {
  const status = boothStatuses.value[id] || 'Available'
  if (status === 'Available') {
    selectedBoothId.value = id
    const zone = id.charAt(0)
    selectedBoothPrice.value = prices[zone] || '0'
    bookingDialog.value = true
  } else {
    // Show alert if not available
  }
}

const handleBookingSubmit = (data: any) => {
  // Mock submission
  console.log('Submitting booking:', data)
  boothStatuses.value[data.boothId] = 'Pending'
  refCode.value = 'REF' + Math.floor(Math.random() * 100000)
  success.value = true
  
  // Navigate to success page after a delay
  setTimeout(() => {
    navigateTo(localePath('/booths/success?ref=' + refCode.value))
  }, 1000)
}
</script>
