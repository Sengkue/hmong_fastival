<template>
  <v-dialog v-model="internalModel" max-width="650" persistent scrollable>
    <v-card class="rounded-xl overflow-hidden glass-dialog shadow-premium">
      <v-toolbar color="primary" flat dark class="px-2">
        <v-avatar color="white" size="36" class="mr-3 shadow-sm">
          <v-icon icon="mdi-store-clock" color="primary"></v-icon>
        </v-avatar>
        <v-toolbar-title class="text-h6 font-weight-bold text-white">
          {{ $t('booking.title') || 'ຈອງບູດ' }} ({{ boothCode }})
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="close" color="white" variant="text" class="mr-2">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-6" style="max-height: 550px;">
        <!-- Modern Steps Indicator -->
        <div class="stepper-indicator mb-6 d-flex align-center justify-space-between px-4">
          <div class="step-node" :class="{ active: step >= 1, completed: step > 1 }">
            <span class="node-num">1</span>
            <span class="node-label">{{ $t('booking.steps.info') || 'ຂໍ້ມູນ' }}</span>
          </div>
          <div class="step-connector" :class="{ completed: step > 1 }"></div>
          <div class="step-node" :class="{ active: step >= 2, completed: step > 2 }">
            <span class="node-num">2</span>
            <span class="node-label">{{ $t('booking.steps.payment') || 'ຊຳລະເງິນ' }}</span>
          </div>
          <div class="step-connector" :class="{ completed: step > 2 }"></div>
          <div class="step-node" :class="{ active: step === 3 }">
            <span class="node-num">3</span>
            <span class="node-label">{{ $t('booking.steps.confirm') || 'ຢືນຢັນ' }}</span>
          </div>
        </div>

        <!-- Step 1: Store Information -->
        <v-window v-model="step" class="py-2">
          <v-window-item :value="1">
            <div class="animate-fade">
              <h3 class="text-h6 font-weight-bold text-primary mb-1">
                {{ $t('booking.store_info_title') || 'ກະລຸນາປ້ອນຂໍ້ມູນຮ້ານຄ້າ' }}
              </h3>
              <p class="text-caption text-grey mb-6">
                ຂໍ້ມູນເຫຼົ່ານີ້ຈະຖືກສະແດງໃນລະບົບແຜນຜັງຫຼັງຈາກໄດ້ຮັບການອະນຸມັດ.
              </p>

              <v-form ref="form1Ref">
                <v-text-field
                  v-model="form.store_name"
                  :label="($t('booking.store_name') || 'ຊື່ຮ້ານຄ້າ') + ' *'"
                  prepend-inner-icon="mdi-store"
                  variant="outlined"
                  color="primary"
                  density="comfortable"
                  :rules="[v => !!v || 'ກະລຸນາປ້ອນຊື່ຮ້ານຄ້າ']"
                  class="mb-4 rounded-lg"
                ></v-text-field>

                <v-text-field
                  v-model="form.owner_name"
                  :label="($t('booking.owner_name') || 'ຊື່ເຈົ້າຂອງຮ້ານ') + ' *'"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  color="primary"
                  density="comfortable"
                  :rules="[v => !!v || 'ກະລຸນາປ້ອນຊື່ເຈົ້າຂອງ']"
                  class="mb-4 rounded-lg"
                ></v-text-field>

                <v-text-field
                  v-model="form.phone"
                  :label="($t('booking.phone') || 'ເບີໂທລະສັບ') + ' *'"
                  prepend-inner-icon="mdi-phone"
                  variant="outlined"
                  color="primary"
                  density="comfortable"
                  placeholder="020 XXXXXXXX"
                  :rules="[
                    v => !!v || 'ກະລຸນາປ້ອນເບີໂທລະສັບ',
                    v => /^\d{8,11}$/.test(v.replace(/\s+/g, '')) || 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ'
                  ]"
                  class="mb-4 rounded-lg"
                ></v-text-field>

                <v-select
                  v-model="form.category"
                  :items="['Food', 'Handicraft', 'Culture', 'General']"
                  :label="($t('booking.category') || 'ປະເພດຮ້ານຄ້າ') + ' *'"
                  prepend-inner-icon="mdi-tag"
                  variant="outlined"
                  color="primary"
                  density="comfortable"
                  :rules="[v => !!v || 'ກະລຸນາເລືອກປະເພດ']"
                  class="mb-4 rounded-lg"
                ></v-select>
              </v-form>
            </div>
          </v-window-item>

          <!-- Step 2: Payment Details -->
          <v-window-item :value="2">
            <div class="animate-fade text-center">
              <h3 class="text-h6 font-weight-bold text-primary mb-2">
                {{ $t('booking.payment_title') || 'ຊຳລະເງິນຜ່ານ QR Code' }}
              </h3>
              <p class="text-caption text-grey mb-4">
                ສະແກນ QR ດ້ານລຸ່ມເພື່ອໂອນຄ່າຈອງບູດ ຫຼັງຈາກນັ້ນອັບໂຫຼດໃບບິນເພື່ອຢືນຢັນ.
              </p>

              <div class="qr-payment-card pa-4 rounded-2xl mx-auto mb-4 border d-inline-block shadow-sm">
                <!-- BCEL One Style Mock Layout -->
                <div class="d-flex align-center justify-space-between mb-3 border-bottom pb-2">
                  <span class="text-caption font-weight-bold text-primary">BCEL One QR Pay</span>
                  <v-chip color="primary" size="x-small" class="font-weight-black">FAST PAY</v-chip>
                </div>
                
                <!-- Dynamic QR representation -->
                <v-img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=HMONG-FESTIVAL-BOOTH-BOOKING"
                  width="180"
                  height="180"
                  class="mx-auto mb-2"
                ></v-img>
                
                <div class="text-caption font-weight-bold text-grey-darken-2">HMONG FESTIVAL ORG</div>
                <div class="text-caption font-weight-bold text-primary">A/C: 160-12-000098234-001</div>
              </div>

              <div class="price-badge pa-3 rounded-xl bg-primary-lighten-5 mb-5 border-primary">
                <span class="text-body-2 text-grey-darken-3 font-weight-bold">ຄ່າທຳນຽມທັງໝົດ:</span>
                <span class="text-h5 font-weight-black text-primary ml-2">{{ formatKip(price) }} LAK</span>
              </div>

              <!-- Upload File -->
              <v-form ref="form2Ref">
                <v-text-field
                  v-model="form.transaction_ref"
                  label="ເລກອ້າງອີງການໂອນ (Transfer Ref Code) *"
                  prepend-inner-icon="mdi-swap-horizontal"
                  variant="outlined"
                  color="primary"
                  density="comfortable"
                  :rules="[v => !!v || 'ກະລຸນາປ້ອນເລກອ້າງອີງການໂອນ']"
                  class="mb-3 rounded-lg"
                ></v-text-field>

                <div class="slip-uploader-box rounded-xl pa-4 border-dashed text-center position-relative hover-shadow cursor-pointer" @click="triggerFileInput">
                  <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="onFileSelected">
                  
                  <div v-if="!form.slip_preview" class="py-4">
                    <v-icon icon="mdi-cloud-upload-outline" size="40" color="primary" class="mb-2"></v-icon>
                    <div class="text-subtitle-2 font-weight-bold">ຄລິກເພື່ອອັບໂຫຼດໃບບິນ (Slip) *</div>
                    <div class="text-caption text-grey mt-1">ຮອງຮັບໄຟລ໌ຮູບພາບ JPG, PNG</div>
                  </div>

                  <div v-else class="position-relative">
                    <v-img :src="form.slip_preview" height="180" class="rounded-lg shadow-sm" cover></v-img>
                    <v-btn icon="mdi-close" color="error" size="x-small" class="position-absolute top-0 right-0 m-2" @click.stop="clearFile"></v-btn>
                  </div>
                </div>
                <div v-if="fileError" class="text-caption text-error mt-1">{{ fileError }}</div>
              </v-form>
            </div>
          </v-window-item>

          <!-- Step 3: Review & Confirmation -->
          <v-window-item :value="3">
            <div class="animate-fade">
              <div class="d-flex align-center mb-4">
                <v-icon icon="mdi-clipboard-check-outline" color="success" size="30" class="mr-3"></v-icon>
                <h3 class="text-h6 font-weight-bold text-primary">
                  {{ $t('booking.confirm_title') || 'ກວດສອບ ແລະ ຢືນຢັນ' }}
                </h3>
              </div>
              <p class="text-caption text-grey mb-4">
                ກະລຸນາກວດສອບຂໍ້ມູນຂອງທ່ານໃຫ້ຖືກຕ້ອງກ່ອນກົດປຸ່ມຢືນຢັນການຈອງ.
              </p>

              <v-card class="pa-4 bg-slate rounded-xl border mb-4" flat>
                <v-row dense>
                  <v-col cols="6" class="pb-2">
                    <div class="text-caption text-grey">ບູດທີ່ຈອງ</div>
                    <div class="text-subtitle-2 font-weight-black text-primary">{{ boothCode }}</div>
                  </v-col>
                  <v-col cols="6" class="pb-2">
                    <div class="text-caption text-grey">ປະເພດຮ້ານ</div>
                    <div class="text-subtitle-2 font-weight-black">{{ form.category }}</div>
                  </v-col>
                  <v-col cols="12" class="py-1"><v-divider></v-divider></v-col>
                  
                  <v-col cols="12" class="py-2">
                    <div class="text-caption text-grey">ຊື່ຮ້ານຄ້າ</div>
                    <div class="text-subtitle-1 font-weight-bold text-grey-darken-3">{{ form.store_name }}</div>
                  </v-col>
                  
                  <v-col cols="6" class="py-2">
                    <div class="text-caption text-grey">ຊື່ເຈົ້າຂອງຮ້ານ</div>
                    <div class="text-subtitle-2 font-weight-bold">{{ form.owner_name }}</div>
                  </v-col>
                  <v-col cols="6" class="py-2">
                    <div class="text-caption text-grey">ເບີໂທລະສັບ</div>
                    <div class="text-subtitle-2 font-weight-bold">{{ form.phone }}</div>
                  </v-col>
                  
                  <v-col cols="12" class="py-1"><v-divider></v-divider></v-col>
                  <v-col cols="6" class="py-2">
                    <div class="text-caption text-grey">ເລກອ້າງອີງການໂອນ</div>
                    <div class="text-subtitle-2 font-weight-bold text-primary">{{ form.transaction_ref }}</div>
                  </v-col>
                  <v-col cols="6" class="py-2 text-right">
                    <div class="text-caption text-grey">ຍອດເງິນທັງໝົດ</div>
                    <div class="text-h6 font-weight-black text-primary">{{ formatKip(price) }} LAK</div>
                  </v-col>
                </v-row>
              </v-card>

              <v-alert
                type="info"
                variant="tonal"
                icon="mdi-clock-check-outline"
                class="rounded-xl font-weight-medium text-caption"
                color="primary"
              >
                {{ $t('booking.wait_approval') || 'ຫຼັງຈາກຢືນຢັນ, ຜູ້ຈັດງານຈະກວດສອບພາຍໃນ 24 ຊົ່ວໂມງ.' }}
              </v-alert>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4 bg-light">
        <v-btn 
          v-if="step > 1" 
          variant="outlined" 
          color="primary"
          rounded="lg" 
          prepend-icon="mdi-arrow-left"
          @click="step--"
          :disabled="loading"
        >
          {{ $t('booking.back') || 'ກັບຄືນ' }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn 
          color="primary" 
          variant="flat" 
          class="px-6 rounded-lg font-weight-bold elevation-4"
          :loading="loading"
          @click="nextStep"
        >
          <span>{{ step === 3 ? ($t('booking.confirm_booking') || 'ຢືນຢັນການຈອງ') : ($t('booking.next') || 'ຖັດໄປ') }}</span>
          <v-icon right class="ml-1" v-if="step < 3">mdi-arrow-right</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  boothId: number | string
  boothCode: string
  price: number | string
  loading?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const step = ref(1)
const fileInput = ref<HTMLInputElement | null>(null)
const fileError = ref('')

const form = ref({
  store_name: '',
  owner_name: '',
  phone: '',
  category: 'Food',
  transaction_ref: '',
  slip_file: null as File | null,
  slip_preview: ''
})

const form1Ref = ref<any>(null)
const form2Ref = ref<any>(null)

const internalModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formatKip = (val: number | string) => {
  const num = Number(val)
  if (isNaN(num)) return val
  return num.toLocaleString()
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const onFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // Validate size limit 5MB
    if (file.size > 5 * 1024 * 1024) {
      fileError.value = 'ຂະໜາດໄຟລ໌ບໍ່ໃຫ້ເກີນ 5MB'
      return
    }
    
    fileError.value = ''
    form.value.slip_file = file
    form.value.slip_preview = URL.createObjectURL(file)
  }
}

const clearFile = () => {
  form.value.slip_file = null
  form.value.slip_preview = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const nextStep = async () => {
  if (step.value === 1) {
    if (form1Ref.value) {
      const { valid } = await form1Ref.value.validate()
      if (!valid) return
    }
    step.value = 2
  } else if (step.value === 2) {
    if (form2Ref.value) {
      const { valid } = await form2Ref.value.validate()
      if (!valid) return
    }
    if (!form.value.slip_file) {
      fileError.value = 'ກະລຸນາອັບໂຫຼດໃບບິນການໂອນ'
      return
    }
    step.value = 3
  } else {
    // Complete wizard, emit submit
    emit('submit', {
      boothId: props.boothId,
      storeName: form.value.store_name,
      ownerName: form.value.owner_name,
      phone: form.value.phone,
      category: form.value.category,
      transactionRef: form.value.transaction_ref,
      slipFile: form.value.slip_file
    })
  }
}

const close = () => {
  step.value = 1
  form.value = {
    store_name: '',
    owner_name: '',
    phone: '',
    category: 'Food',
    transaction_ref: '',
    slip_file: null,
    slip_preview: ''
  }
  fileError.value = ''
  internalModel.value = false
}
</script>

<style scoped>
.glass-dialog {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.shadow-premium {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
}

/* Stepper Custom Nodes */
.stepper-indicator {
  position: relative;
}

.step-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  position: relative;
}

.node-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ECEFF1;
  color: #78909C;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.step-node.active .node-num {
  background: #1976D2;
  color: white;
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
  transform: scale(1.1);
}

.step-node.completed .node-num {
  background: #4CAF50;
  color: white;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.node-label {
  font-size: 11px;
  font-weight: 700;
  margin-top: 4px;
  color: #90A4AE;
}

.step-node.active .node-label {
  color: #1976D2;
}

.step-node.completed .node-label {
  color: #4CAF50;
}

.step-connector {
  flex-grow: 1;
  height: 3px;
  background: #ECEFF1;
  margin: 0 8px;
  margin-bottom: 20px;
  border-radius: 2px;
  transition: background 0.3s ease;
}

.step-connector.completed {
  background: #4CAF50;
}

.qr-payment-card {
  width: 250px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
}

.border-dashed {
  border: 2px dashed #B0BEC5 !important;
  transition: all 0.3s ease;
}

.slip-uploader-box:hover {
  border-color: #1976D2 !important;
  background: rgba(25, 118, 210, 0.02);
}

.bg-slate {
  background: #F8F9FA !important;
}

.border-primary {
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.animate-fade {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
