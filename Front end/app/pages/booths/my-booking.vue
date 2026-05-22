<template>
  <v-container class="fill-height justify-center align-center">
    <v-card class="glass-card pa-8 rounded-xl" max-width="500" width="100%">
      <div class="text-center mb-6">
        <v-icon icon="mdi-magnify-expand" color="primary" size="64" class="mb-4"></v-icon>
        <h1 class="text-h4 font-weight-bold">ກວດສອບສະຖານະ</h1>
        <p class="text-grey">ປ້ອນລະຫັດອ້າງອີງເພື່ອເບິ່ງສະຖານະການຈອງ</p>
      </div>

      <v-form @submit.prevent="searchBooking">
        <v-text-field
          v-model="searchQuery"
          label="ລະຫັດອ້າງອີງ (Reference Code)"
          placeholder="ຕົວຢ່າງ: REF12345"
          prepend-inner-icon="mdi-ticket-confirmation"
          variant="outlined"
          class="mb-4"
        ></v-text-field>

        <v-btn
          block
          color="primary"
          size="large"
          class="rounded-lg text-none"
          type="submit"
          :loading="searching"
        >
          ຄົ້ນຫາ (Search)
        </v-btn>
      </v-form>

      <v-expand-transition>
        <div v-if="searchResult" class="mt-8">
          <v-divider class="mb-6"></v-divider>
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="text-h6 font-weight-bold">ຜົນການຄົ້ນຫາ:</div>
            <v-chip :color="getStatusColor(searchResult.status)" variant="flat">
              {{ searchResult.status }}
            </v-chip>
          </div>

          <v-list density="compact" class="bg-transparent border rounded-lg">
            <v-list-item title="ບູດ" :subtitle="searchResult.boothId"></v-list-item>
            <v-list-item title="ຊື່ຮ້ານ" :subtitle="searchResult.storeName"></v-list-item>
            <v-list-item title="ວັນທີຈອງ" :subtitle="searchResult.date"></v-list-item>
          </v-list>

          <v-alert
            v-if="searchResult.status === 'Pending'"
            type="info"
            variant="tonal"
            class="mt-4"
            text="ການຈອງຂອງທ່ານກຳລັງລໍຖ້າການອະນຸມັດ."
          ></v-alert>
          <v-alert
            v-else-if="searchResult.status === 'Booked'"
            type="success"
            variant="tonal"
            class="mt-4"
            text="ຍິນດີດ້ວຍ! ການຈອງຂອງທ່ານໄດ້ຮັບການອະນຸມັດແລ້ວ."
          ></v-alert>
        </div>
      </v-expand-transition>
      
      <v-alert
        v-if="noResult"
        type="error"
        variant="tonal"
        class="mt-8"
        text="ບໍ່ພົບຂໍ້ມູນການຈອງສຳລັບລະຫັດນີ້."
      ></v-alert>

      <v-btn
        block
        variant="text"
        class="mt-6 text-none"
        :to="localePath('/booths')"
      >
        ກັບຄືນໄປແຜນຜັງ
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const searchQuery = ref('')
const searching = ref(false)
const searchResult = ref<any>(null)
const noResult = ref(false)

const mockBookings = [
  { id: 'REF12345', boothId: 'A1', storeName: 'Somchai Food', status: 'Booked', date: '2024-05-09' },
  { id: 'REF67890', boothId: 'A2', storeName: 'Hmong Silk', status: 'Pending', date: '2024-05-09' },
]

const searchBooking = async () => {
  if (!searchQuery.value) return
  
  searching.value = true
  searchResult.value = null
  noResult.value = false
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const result = mockBookings.find(b => b.id === searchQuery.value.toUpperCase())
  if (result) {
    searchResult.value = result
  } else {
    noResult.value = true
  }
  
  searching.value = false
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'orange'
    case 'Booked': return 'success'
    default: return 'grey'
  }
}
</script>

<style scoped>
.glass-card {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
