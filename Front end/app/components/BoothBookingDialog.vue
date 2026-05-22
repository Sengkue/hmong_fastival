<template>
  <v-dialog v-model="internalModel" max-width="600" persistent>
    <v-card class="rounded-xl overflow-hidden">
      <v-toolbar color="primary" flat>
        <v-toolbar-title class="text-h6 font-weight-bold">
          {{ $t('booking.title') }} (Booking Booth {{ boothId }})
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="close" color="white">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-6">
        <v-stepper v-model="step" :items="[$t('booking.steps.info'), $t('booking.steps.payment'), $t('booking.steps.confirm')]" hide-actions>
          <template v-slot:item.1>
            <div class="mt-4">
              <div class="text-subtitle-1 font-weight-bold mb-4">{{ $t('booking.store_info_title') }}</div>
              <v-text-field
                v-model="form.store_name"
                :label="$t('booking.store_name') + ' (Store Name)'"
                prepend-inner-icon="mdi-store"
                required
              ></v-text-field>
              <v-text-field
                v-model="form.owner_name"
                :label="$t('booking.owner_name') + ' (Owner Name)'"
                prepend-inner-icon="mdi-account"
                required
              ></v-text-field>
              <v-text-field
                v-model="form.phone"
                :label="$t('booking.phone') + ' (Phone)'"
                prepend-inner-icon="mdi-phone"
                required
              ></v-text-field>
              <v-select
                v-model="form.category"
                :items="['ອາຫານ (Food)', 'ຫັດຖະກຳ (Handicraft)', 'ວັດທະນະທຳ (Culture)', 'ທົ່ວໄປ (General)']"
                :label="$t('booking.category') + ' (Category)'"
                prepend-inner-icon="mdi-tag"
                required
              ></v-select>
            </div>
          </template>

          <template v-slot:item.2>
            <div class="mt-4 text-center">
              <div class="text-subtitle-1 font-weight-bold mb-4">{{ $t('booking.payment_title') }}</div>
              <v-img
                src="/images/mock-qr.png"
                max-width="200"
                class="mx-auto mb-4 border rounded-lg"
              ></v-img>
              <div class="text-h6 text-primary font-weight-bold mb-4">{{ $t('booking.price') }}: {{ price }} KIP</div>
              
              <v-file-input
                v-model="form.payment_slip"
                :label="$t('booking.upload_slip') + ' (Upload Payment Slip)'"
                prepend-icon="mdi-camera"
                accept="image/*"
                show-size
                required
                class="mt-4"
              ></v-file-input>
            </div>
          </template>

          <template v-slot:item.3>
            <div class="mt-4">
              <div class="text-subtitle-1 font-weight-bold mb-4">{{ $t('booking.confirm_title') }}</div>
              <v-list density="compact">
                <v-list-item :title="$t('booking.booth')" :subtitle="boothId"></v-list-item>
                <v-list-item :title="$t('booking.store_name')" :subtitle="form.store_name"></v-list-item>
                <v-list-item :title="$t('booking.owner_name')" :subtitle="form.owner_name"></v-list-item>
                <v-list-item :title="$t('booking.phone')" :subtitle="form.phone"></v-list-item>
                <v-list-item :title="$t('booking.price')" :subtitle="price + ' KIP'"></v-list-item>
              </v-list>
              <v-alert
                type="info"
                variant="tonal"
                class="mt-4"
                :text="$t('booking.wait_approval')"
              ></v-alert>
            </div>
          </template>
        </v-stepper>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-btn v-if="step > 1" variant="text" @click="step--">{{ $t('booking.back') }}</v-btn>
        <v-spacer></v-spacer>
        <v-btn 
          color="primary" 
          variant="flat" 
          :disabled="!isStepValid"
          @click="nextStep"
        >
          {{ step === 3 ? $t('booking.confirm_booking') : $t('booking.next') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  boothId: string
  price: string
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const internalModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const step = ref(1)
const form = ref({
  store_name: '',
  owner_name: '',
  phone: '',
  category: '',
  payment_slip: null as any
})

const isStepValid = computed(() => {
  if (step.value === 1) {
    return form.value.store_name && form.value.owner_name && form.value.phone && form.value.category
  }
  if (step.value === 2) {
    return form.value.payment_slip
  }
  return true
})

const nextStep = () => {
  if (step.value < 3) {
    step.value++
  } else {
    emit('submit', { ...form.value, boothId: props.boothId })
    close()
  }
}

const close = () => {
  step.value = 1
  internalModel.value = false
}
</script>
