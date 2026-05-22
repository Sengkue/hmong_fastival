<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600">
    <v-card v-if="booking" class="rounded-xl pa-2">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-information-outline" color="primary" class="mr-2"></v-icon>
        ລາຍລະອຽດການຈອງ (Booking Details)
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)"></v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-caption text-grey">ບູດ (Booth ID)</div>
            <div class="text-h6 font-weight-bold text-primary">{{ booking.boothId }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-grey">ສະຖານະ (Status)</div>
            <v-chip :color="getStatusColor(booking.status)" size="small" variant="flat">
              {{ booking.status }}
            </v-chip>
          </v-col>
          
          <v-col cols="12">
            <v-divider class="my-2"></v-divider>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption text-grey">ຊື່ຮ້ານ (Store Name)</div>
            <div class="text-body-1 font-weight-bold">{{ booking.storeName }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-grey">ປະເພດຮ້ານ (Category)</div>
            <div class="text-body-1">{{ booking.category || 'N/A' }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption text-grey">ເຈົ້າຂອງ (Owner)</div>
            <div class="text-body-1">{{ booking.owner }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-grey">ເບີໂທ (Phone)</div>
            <div class="text-body-1">{{ booking.phone }}</div>
          </v-col>

          <v-col cols="12">
            <div class="text-caption text-grey mb-2">ຫຼັກຖານການຊຳລະ (Payment Proof)</div>
            <v-img
              v-if="booking.paymentProof"
              :src="booking.paymentProof"
              class="rounded-lg bg-grey-lighten-4"
              max-height="300"
              cover
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                </v-row>
              </template>
            </v-img>
            <v-sheet v-else color="grey-lighten-4" class="rounded-lg pa-10 text-center text-grey">
              ບໍ່ມີຮູບຫຼັກຖານ (No image provided)
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn
          v-if="booking.status === 'Pending'"
          color="error"
          variant="tonal"
          class="flex-grow-1 text-none"
          rounded="lg"
          @click="$emit('reject', booking)"
        >
          ປະຕິເສດ (Reject)
        </v-btn>
        <v-btn
          v-if="booking.status === 'Pending'"
          color="success"
          variant="elevated"
          class="flex-grow-1 text-none"
          rounded="lg"
          @click="$emit('approve', booking)"
        >
          ອະນຸມັດ (Approve)
        </v-btn>
        <v-btn
          v-else
          color="primary"
          block
          variant="tonal"
          @click="$emit('update:modelValue', false)"
        >
          ປິດ (Close)
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  booking: any
}>()

defineEmits(['update:modelValue', 'approve', 'reject'])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'orange'
    case 'Approved': return 'success'
    case 'Rejected': return 'error'
    default: return 'grey'
  }
}
</script>
