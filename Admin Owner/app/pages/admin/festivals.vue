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
              <v-icon icon="mdi-party-popper" class="mr-2"></v-icon>
              <span class="text-overline font-weight-bold">ADMIN PANEL</span>
            </div>
            <h1 class="text-h3 font-weight-black text-primary">
              ຈັດການຂໍ້ມູນງານບຸນປະເພນີ (Hmong Festivals)
            </h1>
            <p class="text-subtitle-1 text-grey">
              ເພີ່ມ, ແກ້ໄຂ ແລະ ຈັດການງານບຸນປະເພນີທີ່ເຂົ້າຮ່ວມລະບົບຈອງບູດ
            </p>
          </div>
          
          <v-btn 
            color="primary" 
            prepend-icon="mdi-plus" 
            rounded="xl" 
            height="48"
            class="px-6 shadow-md"
            @click="openAddDialog"
          >
            ເພີ່ມງານບຸນປະເພນີ (Add Festival)
          </v-btn>
        </v-col>
      </v-row>

      <!-- Grid list of Festivals -->
      <v-row>
        <v-col cols="12" md="6" lg="4" v-for="festival in festivalsList" :key="festival.id">
          <v-hover v-slot:default="{ isHovering, props }">
            <v-card 
              v-bind="props" 
              class="glass-card rounded-2xl overflow-hidden h-100 shadow-premium position-relative border"
              :elevation="isHovering ? 12 : 2"
            >
              <!-- Card Top Color Accent -->
              <div class="card-top-bar bg-primary"></div>
              
              <v-card-item class="pa-5 pb-2">
                <div class="d-flex align-center justify-space-between mb-3">
                  <v-chip color="primary" variant="flat" class="font-weight-black rounded-lg">
                    {{ festival.code }}
                  </v-chip>
                  <v-chip :color="festival.isActive ? 'success' : 'grey'" size="small" variant="tonal" class="font-weight-bold">
                    {{ festival.isActive ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ' }}
                  </v-chip>
                </div>
                
                <h3 class="text-h6 font-weight-black text-primary line-clamp-1 mb-1">
                  {{ festival.name }}
                </h3>
                <p class="text-caption text-grey-darken-1 mb-4 d-flex align-center">
                  <v-icon icon="mdi-map-marker" size="small" class="mr-1 text-primary"></v-icon>
                  {{ festival.city }}, {{ festival.country }}
                </p>
                
                <v-divider class="my-2 border-dashed"></v-divider>
                
                <div class="d-flex justify-space-between align-center py-2 text-body-2 text-grey-darken-3">
                  <span class="font-weight-bold">ທີ່ຕັ້ງ (Address):</span>
                  <span class="text-right text-truncate ml-4 max-width-200">{{ festival.address || 'N/A' }}</span>
                </div>
                
                <div class="d-flex justify-space-between align-center py-1 text-body-2 text-grey-darken-3">
                  <span class="font-weight-bold">ພິກັດ (Coordinates):</span>
                  <span>{{ festival.latitude?.toFixed(4) }}, {{ festival.longitude?.toFixed(4) }}</span>
                </div>
              </v-card-item>

              <v-card-text class="pa-5 pt-1 text-caption text-grey-darken-2">
                {{ festival.description || 'ບໍ່ມີລາຍລະອຽດເພີ່ມເຕີມ' }}
              </v-card-text>

              <v-card-actions class="pa-4 bg-white-50 border-t d-flex justify-end gap-2">
                <v-btn 
                  icon="mdi-pencil-outline" 
                  size="small" 
                  color="primary" 
                  variant="text" 
                  @click="editFestival(festival)"
                ></v-btn>
                <v-btn 
                  icon="mdi-delete-outline" 
                  size="small" 
                  color="error" 
                  variant="text" 
                  @click="deleteFestival(festival.id)"
                ></v-btn>
              </v-card-actions>
            </v-card>
          </v-hover>
        </v-col>
        
        <v-col cols="12" v-if="festivalsList.length === 0" class="text-center py-12 text-grey">
          <v-icon icon="mdi-party-popper" size="64" class="mb-2"></v-icon>
          <p class="font-weight-bold">ບໍ່ທັນມີຂໍ້ມູນງານບຸນໃນລະບົບເທື່ອ</p>
        </v-col>
      </v-row>
    </div>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="festivalDialog" max-width="600" persistent>
      <v-card class="rounded-xl overflow-hidden glass-dialog">
        <v-toolbar color="primary" flat dark>
          <v-toolbar-title class="font-weight-bold text-white">
            {{ isEditing ? 'ແກ້ໄຂງານບຸນປະເພນີ (Edit Festival)' : 'ເພີ່ມງານບຸນປະເພນີ (Add Festival)' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="festivalDialog = false" color="white" variant="text">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="festivalFormRef">
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="form.name"
                  label="ຊື່ງານບຸນປະເພນີ (Festival Name) *"
                  prepend-inner-icon="mdi-party-popper"
                  variant="outlined"
                  color="primary"
                  :rules="[v => !!v || 'ກະລຸນາປ້ອນຊື່ງານບຸນປະເພນີ']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.code"
                  label="ລະຫັດ (Festival Code) *"
                  placeholder="ຕົວຢ່າງ: HMF"
                  prepend-inner-icon="mdi-barcode"
                  variant="outlined"
                  color="primary"
                  :rules="[v => !!v || 'ກະລຸນາປ້ອນລະຫັດງານບຸນປະເພນີ']"
                  :disabled="isEditing"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.city"
                  label="ເມືອງ/ແຂວງ (City) *"
                  prepend-inner-icon="mdi-city"
                  variant="outlined"
                  color="primary"
                  :rules="[v => !!v || 'ກະລຸນາປ້ອນເມືອງ']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.country"
                  label="ປະເທດ (Country) *"
                  prepend-inner-icon="mdi-earth"
                  variant="outlined"
                  color="primary"
                  :rules="[v => !!v || 'ກະລຸນາປ້ອນປະເທດ']"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="form.address"
                  label="ທີ່ຢູ່ (Address)"
                  prepend-inner-icon="mdi-map-marker"
                  variant="outlined"
                  color="primary"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.latitude"
                  label="Latitude *"
                  type="number"
                  step="0.0001"
                  prepend-inner-icon="mdi-latitude"
                  variant="outlined"
                  color="primary"
                  :rules="[v => !!v || 'ກະລຸນາປ້ອນ Latitude']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.longitude"
                  label="Longitude *"
                  type="number"
                  step="0.0001"
                  prepend-inner-icon="mdi-longitude"
                  variant="outlined"
                  color="primary"
                  :rules="[v => !!v || 'ກະລຸນາປ້ອນ Longitude']"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  label="ລາຍລະອຽດ (Description)"
                  prepend-inner-icon="mdi-text"
                  variant="outlined"
                  color="primary"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 bg-light">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="festivalDialog = false">ຍົກເລີກ</v-btn>
          <v-btn color="primary" variant="flat" class="px-6 rounded-lg font-weight-bold" :loading="dialogLoading" @click="saveFestival">
            ບັນທຶກ (Save)
          </v-btn>
        </v-card-actions>
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
import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
  role: 'admin'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()

const loading = ref(false)
const dialogLoading = ref(false)
const festivalsList = ref<any[]>([])
const festivalDialog = ref(false)
const isEditing = ref(false)
const editingFestivalId = ref<number | null>(null)
const festivalFormRef = ref<any>(null)

const form = ref({
  name: '',
  code: '',
  city: '',
  country: '',
  address: '',
  latitude: 17.9883,
  longitude: 102.5633,
  description: ''
})

const toast = reactive({ show: false, text: '', color: '', icon: '' })

onMounted(async () => {
  await fetchFestivals()
})

const fetchFestivals = async () => {
  loading.value = true
  try {
    authStore.initialize()
    const response = await $fetch<any>(`${config.public.apiBase}/festivals`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (response && response.success) {
      festivalsList.value = response.data
    }
  } catch (e) {
    console.error('Failed to load festivals', e)
    showToast('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນງານບຸນໄດ້', 'error', 'mdi-alert')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEditing.value = false
  editingFestivalId.value = null
  form.value = {
    name: '',
    code: '',
    city: 'Vientiane',
    country: 'Laos',
    address: '',
    latitude: 17.9883,
    longitude: 102.5633,
    description: ''
  }
  festivalDialog.value = true
}

const editFestival = (festival: any) => {
  isEditing.value = true
  editingFestivalId.value = festival.id
  form.value = {
    name: festival.name,
    code: festival.code,
    city: festival.city,
    country: festival.country,
    address: festival.address || '',
    latitude: Number(festival.latitude),
    longitude: Number(festival.longitude),
    description: festival.description || ''
  }
  festivalDialog.value = true
}

const saveFestival = async () => {
  if (festivalFormRef.value) {
    const { valid } = await festivalFormRef.value.validate()
    if (!valid) return
  }

  dialogLoading.value = true
  try {
    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value 
      ? `${config.public.apiBase}/festivals/${editingFestivalId.value}`
      : `${config.public.apiBase}/festivals`

    const response = await $fetch<any>(url, {
      method,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: form.value
    })

    if (response && response.success) {
      showToast(isEditing.value ? 'ແກ້ໄຂຂໍ້ມູນງານບຸນປະເພນີສຳເລັດ!' : 'ເພີ່ມງານບຸນປະເພນີໃໝ່ສຳເລັດ!', 'success', 'mdi-check-circle')
      festivalDialog.value = false
      await fetchFestivals()
    }
  } catch (e: any) {
    const err = e.response?._data?.message || 'ບໍ່ສາມາດບັນທຶກຂໍ້ມູນງານບຸນປະເພນີໄດ້'
    showToast(err, 'error', 'mdi-alert')
  } finally {
    dialogLoading.value = false
  }
}

const deleteFestival = async (id: number) => {
  if (!confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບງານບຸນປະເພນີນີ້? ທຸກເຂດໃນງານບຸນນີ້ຈະປິດໃຊ້ງານ.')) return
  try {
    const response = await $fetch<any>(`${config.public.apiBase}/festivals/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (response && response.success) {
      showToast('ລຶບງານບຸນປະເພນີສຳເລັດ!', 'success', 'mdi-check-circle')
      await fetchFestivals()
    }
  } catch (e: any) {
    const err = e.response?._data?.message || 'ບໍ່ສາມາດລຶບງານບຸນປະເພນີໄດ້'
    showToast(err, 'error', 'mdi-alert')
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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.shadow-premium {
  box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.08) !important;
}

.card-top-bar {
  height: 4px;
  width: 100%;
}

.max-width-200 {
  max-width: 200px;
}

.glass-dialog {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.bg-light {
  background-color: #F8F9FA;
}

.animate-fade {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
