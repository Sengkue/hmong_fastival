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
              <v-icon icon="mdi-map-legend" class="mr-2"></v-icon>
              <span class="text-overline font-weight-bold">ADMIN PANEL</span>
            </div>
            <h1 class="text-h3 font-weight-black text-primary">
              ຈັດການເຂດຈັດງານ (Zones)
            </h1>
            <p class="text-subtitle-1 text-grey">
              ກຳນົດເຂດຈັດງານ, ແຕ້ມພິກັດແຜນຜັງ ແລະ ມອບໝາຍໃຫ້ເຈົ້າຂອງເຂດ (Owner)
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
            ເພີ່ມເຂດຈັດງານ (Add Zone)
          </v-btn>
        </v-col>
      </v-row>

      <!-- Zones Table / List -->
      <v-row>
        <v-col cols="12">
          <v-card class="glass-card rounded-2xl border overflow-hidden shadow-premium">
            <v-data-table
              :headers="headers"
              :items="zonesList"
              class="bg-transparent text-left"
              density="comfortable"
            >
              <!-- Color Indicator -->
              <template v-slot:item.color="{ item }">
                <div class="d-flex align-center">
                  <div 
                    class="color-dot mr-2 shadow-sm border" 
                    :style="{ backgroundColor: item.color || '#90A4AE' }"
                  ></div>
                  <span class="font-weight-medium text-caption">{{ item.color || 'N/A' }}</span>
                </div>
              </template>

              <!-- Festival Code -->
              <template v-slot:item.festival="{ item }">
                <v-chip color="primary" size="small" variant="flat" class="font-weight-bold">
                  {{ item.festival?.code || `ID: ${item.festivalId}` }}
                </v-chip>
              </template>

              <!-- Owner -->
              <template v-slot:item.owner="{ item }">
                <div v-if="item.owner" class="d-flex align-center">
                  <v-avatar color="primary-lighten-5" size="28" class="mr-2">
                    <v-icon icon="mdi-account" size="14" color="primary"></v-icon>
                  </v-avatar>
                  <span class="font-weight-bold">{{ item.owner.firstName }} {{ item.owner.lastName }}</span>
                </div>
                <span v-else class="text-grey font-weight-medium">ບໍ່ທັນມີເຈົ້າຂອງ (Unassigned)</span>
              </template>

              <!-- Shape type -->
              <template v-slot:item.shapeType="{ item }">
                <v-chip color="secondary" size="small" variant="tonal" class="font-weight-bold text-uppercase">
                  <v-icon 
                    :icon="getShapeIcon(item.shapeType)" 
                    size="small" 
                    class="mr-1"
                  ></v-icon>
                  {{ item.shapeType || 'N/A' }}
                </v-chip>
              </template>

              <!-- Actions -->
              <template v-slot:item.actions="{ item }">
                <div class="d-flex align-center justify-end gap-2">
                  <v-btn 
                    icon="mdi-pencil-outline" 
                    size="small" 
                    color="primary" 
                    variant="text" 
                    @click="editZone(item)"
                  ></v-btn>
                  <v-btn 
                    icon="mdi-delete-outline" 
                    size="small" 
                    color="error" 
                    variant="text" 
                    @click="deleteZone(item.id)"
                  ></v-btn>
                </div>
              </template>

              <template v-slot:no-data>
                <div class="pa-10 text-center text-grey">
                  <v-icon icon="mdi-map-legend" size="56" class="mb-2"></v-icon>
                  <p class="font-weight-bold">ບໍ່ທັນມີເຂດຈັດງານເທື່ອ</p>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Add/Edit Zone Dialog -->
    <v-dialog v-model="zoneDialog" max-width="950" persistent scrollable>
      <v-card class="rounded-xl overflow-hidden glass-dialog">
        <v-toolbar color="primary" flat dark>
          <v-toolbar-title class="font-weight-bold text-white">
            {{ isEditing ? 'ແກ້ໄຂເຂດຈັດງານ (Edit Zone)' : 'ເພີ່ມເຂດຈັດງານ (Add Zone)' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="zoneDialog = false" color="white" variant="text">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-6" style="max-height: 700px;">
          <v-row>
            <!-- Left Side: Basic Info Fields -->
            <v-col cols="12" md="5">
              <v-form ref="zoneFormRef">
                <v-select
                  v-model="form.festivalId"
                  :items="festivals"
                  item-title="name"
                  item-value="id"
                  label="ເລືອກງານບຸນປະເພນີ (Select Hmong Festival) *"
                  variant="outlined"
                  color="primary"
                  :rules="[v => !!v || 'ກະລຸນາເລືອກງານບຸນປະເພນີ']"
                  class="mb-4"
                ></v-select>

                <v-select
                  v-model="form.ownerId"
                  :items="owners"
                  item-title="fullName"
                  item-value="id"
                  label="ເລືອກເຈົ້າຂອງເຂດ (Select Owner)"
                  variant="outlined"
                  color="primary"
                  clearable
                  class="mb-4"
                ></v-select>

                <v-text-field
                  v-model="form.name"
                  label="ຊື່ເຂດຈັດງານ (Zone Name) *"
                  placeholder="ຕົວຢ່າງ: ເຂດ A"
                  prepend-inner-icon="mdi-map-marker"
                  variant="outlined"
                  color="primary"
                  :rules="[v => !!v || 'ກະລຸນາປ້ອນຊື່ເຂດ']"
                  class="mb-4"
                ></v-text-field>

                <v-row dense class="mb-4">
                  <v-col cols="8">
                    <v-text-field
                      v-model="form.color"
                      label="ສີເຂດ (Color Code) *"
                      prepend-inner-icon="mdi-palette"
                      variant="outlined"
                      color="primary"
                      :rules="[v => !!v || 'ກະລຸນາເລືອກ ຫຼື ປ້ອນສີ']"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4" class="d-flex align-center justify-center">
                    <input 
                      type="color" 
                      v-model="form.color" 
                      class="color-picker-input border rounded-lg shadow-sm"
                    >
                  </v-col>
                </v-row>

                <v-textarea
                  v-model="form.description"
                  label="ລາຍລະອຽດເຂດ (Description)"
                  prepend-inner-icon="mdi-text"
                  variant="outlined"
                  color="primary"
                  rows="4"
                ></v-textarea>
              </v-form>
            </v-col>

            <!-- Right Side: Interactive Map Drawing FALLBACK Designer -->
            <v-col cols="12" md="7">
              <div class="text-subtitle-1 font-weight-black text-primary mb-2">
                <v-icon icon="mdi-vector-combine" class="mr-1"></v-icon>
                ແຕ້ມຂອບເຂດຈັດງານ (Design Zone Boundaries)
              </div>
              <p class="text-caption text-grey mb-4">
                ແຕ້ມຮູບຊົງບົນແຜນຜັງເພື່ອໃຫ້ລະບົບເກັບພິກັດ JSON. ພິກັດນີ້ຈະໃຊ້ສະແດງໃນໜ້າແຜນຜັງຫຼັກ.
              </p>

              <!-- Map Drawing Module Integration -->
              <MapDrawingModule 
                :key="drawingKey"
                :initial-value="form.shapeCoordinates"
                @save="onShapeSaved"
              />
              
              <div v-if="shapeError" class="text-caption text-error mt-2 font-weight-bold">
                {{ shapeError }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4 bg-light">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="zoneDialog = false">ຍົກເລີກ</v-btn>
          <v-btn color="primary" variant="flat" class="px-6 rounded-lg font-weight-bold" :loading="dialogLoading" @click="saveZone">
            # ບັນທຶກ (Save)
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
const zonesList = ref<any[]>([])
const festivals = ref<any[]>([])
const owners = ref<any[]>([])
const zoneDialog = ref(false)
const isEditing = ref(false)
const editingZoneId = ref<number | null>(null)
const zoneFormRef = ref<any>(null)
const drawingKey = ref(0)
const shapeError = ref('')

const form = ref({
  festivalId: null as number | null,
  ownerId: null as number | null,
  name: '',
  description: '',
  color: '#3498db',
  shapeType: 'rectangle',
  shapeCoordinates: null as any
})

const toast = reactive({ show: false, text: '', color: '', icon: '' })

const headers = [
  { title: 'ຊື່ເຂດ (Zone Name)', key: 'name', sortable: true },
  { title: 'ງານບຸນ (Festival)', key: 'festival', sortable: true },
  { title: 'ເຈົ້າຂອງ (Owner)', key: 'owner', sortable: true },
  { title: 'ຮູບແບບ (Shape Type)', key: 'shapeType', sortable: true },
  { title: 'ສີເຂດ (Color)', key: 'color', sortable: false },
  { title: 'ຈັດການ (Actions)', key: 'actions', sortable: false, align: 'end' }
] as any

onMounted(async () => {
  await fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    authStore.initialize()
    
    // 1. Fetch Zones
    const zonesResponse = await $fetch<any>(`${config.public.apiBase}/zones`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (zonesResponse && zonesResponse.success) {
      zonesList.value = zonesResponse.data
    }

    // 2. Fetch Festivals
    const festivalsResponse = await $fetch<any>(`${config.public.apiBase}/festivals`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (festivalsResponse && festivalsResponse.success) {
      festivals.value = festivalsResponse.data
    }

    // 3. Fetch Owners
    const usersResponse = await $fetch<any>(`${config.public.apiBase}/users?role=owner`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (usersResponse && usersResponse.success) {
      owners.value = usersResponse.data.map((u: any) => ({
        id: u.id,
        fullName: `${u.firstName} ${u.lastName}`
      }))
    }
  } catch (e) {
    console.error('Failed to load zone dependencies', e)
    showToast('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນເຂດໄດ້', 'error', 'mdi-alert')
  } finally {
    loading.value = false
  }
}

const getShapeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'rectangle': return 'mdi-vector-rectangle'
    case 'polygon': return 'mdi-vector-polygon'
    case 'circle': return 'mdi-vector-circle'
    default: return 'mdi-vector-square'
  }
}

const openAddDialog = () => {
  isEditing.value = false
  editingZoneId.value = null
  shapeError.value = ''
  form.value = {
    festivalId: festivals.value.length > 0 ? festivals.value[0].id : null,
    ownerId: null,
    name: '',
    description: '',
    color: '#3498db',
    shapeType: 'rectangle',
    shapeCoordinates: null
  }
  drawingKey.value++
  zoneDialog.value = true
}

const editZone = (zone: any) => {
  isEditing.value = true
  editingZoneId.value = zone.id
  shapeError.value = ''
  form.value = {
    festivalId: zone.festivalId,
    ownerId: zone.ownerId,
    name: zone.name,
    description: zone.description || '',
    color: zone.color || '#3498db',
    shapeType: zone.shapeType || 'rectangle',
    shapeCoordinates: zone.shapeCoordinates ? (typeof zone.shapeCoordinates === 'string' ? JSON.parse(zone.shapeCoordinates) : zone.shapeCoordinates) : null
  }
  drawingKey.value++
  zoneDialog.value = true
}

const onShapeSaved = (shape: any) => {
  if (shape) {
    form.value.shapeType = shape.type
    form.value.shapeCoordinates = shape
    shapeError.value = ''
    showToast('ບັນທຶກພິກັດຮູບຊົງສຳເລັດ!', 'success', 'mdi-check-circle')
  } else {
    form.value.shapeCoordinates = null
  }
}

const saveZone = async () => {
  if (zoneFormRef.value) {
    const { valid } = await zoneFormRef.value.validate()
    if (!valid) return
  }

  if (!form.value.shapeCoordinates) {
    shapeError.value = 'ກະລຸນາແຕ້ມພິກັດເຂດຈັດງານ ແລະ ກົດປຸ່ມ ບັນທຶກພິກັດ'
    return
  }

  dialogLoading.value = true
  try {
    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value 
      ? `${config.public.apiBase}/zones/${editingZoneId.value}`
      : `${config.public.apiBase}/zones`

    const response = await $fetch<any>(url, {
      method,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: form.value
    })

    if (response && response.success) {
      showToast(isEditing.value ? 'ແກ້ໄຂເຂດຈັດງານສຳເລັດ!' : 'ເພີ່ມເຂດຈັດງານໃໝ່ສຳເລັດ!', 'success', 'mdi-check-circle')
      zoneDialog.value = false
      await fetchData()
    }
  } catch (e: any) {
    const err = e.response?._data?.message || 'ບໍ່ສາມາດບັນທຶກຂໍ້ມູນເຂດໄດ້'
    showToast(err, 'error', 'mdi-alert')
  } finally {
    dialogLoading.value = false
  }
}

const deleteZone = async (id: number) => {
  if (!confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບເຂດຈັດງານນີ້? ຂໍ້ມູນບູດທັງໝົດໃນເຂດນີ້ຈະຖືກລຶບ.')) return
  try {
    const response = await $fetch<any>(`${config.public.apiBase}/zones/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (response && response.success) {
      showToast('ລຶບເຂດຈັດງານສຳເລັດ!', 'success', 'mdi-check-circle')
      await fetchData()
    }
  } catch (e: any) {
    const err = e.response?._data?.message || 'ບໍ່ສາມາດລຶບເຂດຈັດງານໄດ້'
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

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
}

.color-picker-input {
  width: 100%;
  height: 48px;
  padding: 2px;
  cursor: pointer;
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
</style>
