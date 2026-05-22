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
              <v-icon icon="mdi-storefront" class="mr-2"></v-icon>
              <span class="text-overline font-weight-bold">OWNER MANAGEMENT</span>
            </div>
            <h1 class="text-h3 font-weight-black text-primary">
              ຈັດການຂໍ້ມູນບູດຮ້ານຄ້າ (My Booths)
            </h1>
            <p class="text-subtitle-1 text-grey">
              ເພີ່ມ, ແກ້ໄຂ, ແລະ ຕິດຕາມສະຖານະບູດທັງໝົດໃນເຂດຈັດງານຂອງທ່ານ
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
            ເພີ່ມບູດໃໝ່ (Create Booth)
          </v-btn>
        </v-col>
      </v-row>

      <!-- Grid list -->
      <v-row>
        <v-col cols="12">
          <v-card class="glass-card rounded-2xl border overflow-hidden shadow-premium">
            <v-data-table
              :headers="headers"
              :items="boothsList"
              :search="search"
              class="bg-transparent text-left"
              density="comfortable"
            >
              <template v-slot:item.price="{ item }">
                <span class="font-weight-bold text-primary">{{ formatKip(item.price) }} LAK</span>
              </template>

              <template v-slot:item.status="{ item }">
                <v-chip :color="getBoothStatusColor(item.status)" size="small" variant="flat" class="font-weight-bold">
                  {{ getBoothStatusLaoText(item.status) }}
                </v-chip>
              </template>

              <template v-slot:item.actions="{ item }">
                <div class="d-flex align-center justify-end gap-2">
                  <v-btn icon="mdi-pencil" size="small" color="primary" variant="text" @click="editBooth(item)"></v-btn>
                  <v-btn icon="mdi-delete" size="small" color="error" variant="text" @click="deleteBooth(item.id)"></v-btn>
                </div>
              </template>

              <template v-slot:no-data>
                <div class="pa-10 text-center text-grey">
                  <v-icon icon="mdi-store-remove-outline" size="56" class="mb-2"></v-icon>
                  <p class="font-weight-bold">ບໍ່ທັນມີຂໍ້ມູນບູດຂອງທ່ານໃນລະບົບເທື່ອ</p>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Add/Edit Booth Dialog -->
    <v-dialog v-model="boothDialog" max-width="500">
      <v-card class="rounded-xl overflow-hidden glass-dialog">
        <v-toolbar color="primary" flat dark>
          <v-toolbar-title class="font-weight-bold text-white">
            {{ isEditing ? 'ແກ້ໄຂຂໍ້ມູນບູດ (Edit Booth)' : 'ເພີ່ມບູດໃໝ່ (Create Booth)' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="boothDialog = false" color="white" variant="text">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="boothFormRef">
            <v-select
              v-model="form.zoneId"
              :items="myZones"
              item-title="name"
              item-value="id"
              label="ເລືອກເຂດ (Select Zone) *"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'ກະລຸນາເລືອກເຂດ']"
              class="mb-4"
              :disabled="isEditing"
            ></v-select>

            <v-text-field
              v-model="form.code"
              label="ລະຫັດບູດ (Booth Code) *"
              placeholder="ຕົວຢ່າງ: A1"
              prepend-inner-icon="mdi-barcode"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'ກະລຸນາປ້ອນລະຫັດບູດ']"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="form.name"
              label="ຊື່ບູດ (Booth Name) *"
              placeholder="ຕົວຢ່າງ: ບູດ A1"
              prepend-inner-icon="mdi-storefront"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'ກະລຸນາປ້ອນຊື່ບູດ']"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="form.price"
              label="ລາຄາຈອງ (Price LAK) *"
              type="number"
              prepend-inner-icon="mdi-cash"
              variant="outlined"
              color="primary"
              :rules="[
                v => !!v || 'ກະລຸນາປ້ອນລາຄາບູດ',
                v => Number(v) >= 0 || 'ລາຄາຕ້ອງຫຼາຍກວ່າ ຫຼື ເທົ່າກັບ 0'
              ]"
              class="mb-4"
            ></v-text-field>

            <v-select
              v-model="form.status"
              :items="['available', 'booked', 'maintenance']"
              label="ສະຖານະບູດ (Booth Status) *"
              variant="outlined"
              color="primary"
              :rules="[v => !!v || 'ກະລຸນາເລືອກສະຖານະ']"
              class="mb-4"
            ></v-select>

            <v-textarea
              v-model="form.description"
              label="ລາຍລະອຽດເພີ່ມເຕີມ (Description)"
              prepend-inner-icon="mdi-text"
              variant="outlined"
              color="primary"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 bg-light">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="boothDialog = false">ຍົກເລີກ</v-btn>
          <v-btn color="primary" variant="flat" class="px-6 rounded-lg font-weight-bold" :loading="dialogLoading" @click="saveBooth">
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
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
  role: 'owner'
})

const authStore = useAuthStore()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const loading = ref(false)
const dialogLoading = ref(false)
const search = ref('')
const boothsList = ref<any[]>([])
const myZones = ref<any[]>([])
const boothDialog = ref(false)
const isEditing = ref(false)
const editingBoothId = ref<number | null>(null)
const boothFormRef = ref<any>(null)

const form = ref({
  zoneId: null as number | null,
  code: '',
  name: '',
  price: 0,
  status: 'available',
  description: ''
})

const toast = reactive({ show: false, text: '', color: '', icon: '' })

const headers = [
  { title: 'ລະຫັດບູດ (Code)', key: 'code', sortable: true },
  { title: 'ຊື່ບູດ (Name)', key: 'name', sortable: true },
  { title: 'ເຂດ (Zone)', key: 'zone.name', sortable: true },
  { title: 'ລາຄາຈອງ (Price)', key: 'price', sortable: true },
  { title: 'ສະຖານະ (Status)', key: 'status', sortable: true },
  { title: 'ຈັດການ (Actions)', key: 'actions', sortable: false, align: 'end' }
] as any

onMounted(async () => {
  await fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    authStore.initialize()
    
    // 1. Fetch Owner's booths
    const boothsResponse = await $fetch<any>(`${config.public.apiBase}/booths/my/list`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (boothsResponse && boothsResponse.success) {
      boothsList.value = boothsResponse.data.map((b: any) => ({
        ...b,
        price: b.pricePerDay,
        code: b.size || ''
      }))
    }

    // 2. Fetch all zones to find the ones managed by this owner
    const zonesResponse = await $fetch<any>(`${config.public.apiBase}/zones`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (zonesResponse && zonesResponse.success) {
      myZones.value = zonesResponse.data.filter((z: any) => z.ownerId === authStore.user?.id)
    }
  } catch (e) {
    console.error('Failed to load owner booths dependencies', e)
  } finally {
    loading.value = false
  }
}

const formatKip = (val: number | string) => {
  const num = Number(val)
  if (isNaN(num)) return val
  return num.toLocaleString()
}

const getBoothStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'available': return 'success'
    case 'booked': return 'primary'
    case 'maintenance': return 'grey'
    default: return 'grey'
  }
}

const getBoothStatusLaoText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'available': return 'ຫວ່າງ (Available)'
    case 'booked': return 'ຈອງແລ້ວ (Booked)'
    case 'maintenance': return 'ປິດປັບປຸງ (Maintenance)'
    default: return status
  }
}

const openAddDialog = () => {
  if (myZones.value.length === 0) {
    showToast('ທ່ານຍັງບໍ່ມີເຂດ (Zone) ທີ່ຮັບຜິດຊອບເທື່ອ!', 'error', 'mdi-alert')
    return
  }
  isEditing.value = false
  editingBoothId.value = null
  form.value = {
    zoneId: myZones.value[0].id,
    code: '',
    name: '',
    price: 0,
    status: 'available',
    description: ''
  }
  boothDialog.value = true
}

const editBooth = (booth: any) => {
  isEditing.value = true
  editingBoothId.value = booth.id
  form.value = {
    zoneId: booth.zoneId,
    code: booth.size || booth.code || '',
    name: booth.name,
    price: Number(booth.pricePerDay || booth.price),
    status: booth.status,
    description: booth.description || ''
  }
  boothDialog.value = true
}

const saveBooth = async () => {
  if (boothFormRef.value) {
    const { valid } = await boothFormRef.value.validate()
    if (!valid) return
  }

  dialogLoading.value = true
  try {
    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value 
      ? `${config.public.apiBase}/booths/${editingBoothId.value}`
      : `${config.public.apiBase}/booths`

    const payload = {
      zoneId: form.value.zoneId,
      name: form.value.name,
      description: form.value.description,
      size: form.value.code, // Map form code to size
      pricePerDay: Number(form.value.price), // Map form price to pricePerDay
      status: form.value.status
    }

    const response = await $fetch<any>(url, {
      method,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: payload
    })

    if (response && response.success) {
      showToast(isEditing.value ? 'ແກ້ໄຂຂໍ້ມູນບູດສຳເລັດ!' : 'ເພີ່ມບູດໃໝ່ສຳເລັດ!', 'success', 'mdi-check-circle')
      boothDialog.value = false
      await fetchData()
    }
  } catch (e: any) {
    const err = e.response?._data?.message || 'ບໍ່ສາມາດບັນທຶກຂໍ້ມູນບູດໄດ້'
    showToast(err, 'error', 'mdi-alert')
  } finally {
    dialogLoading.value = false
  }
}

const deleteBooth = async (id: number) => {
  if (!confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບບູດນີ້?')) return
  try {
    const response = await $fetch<any>(`${config.public.apiBase}/booths/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (response && response.success) {
      showToast('ລຶບບູດສຳເລັດ!', 'success', 'mdi-check-circle')
      await fetchData()
    }
  } catch (e: any) {
    const err = e.response?._data?.message || 'ບໍ່ສາມາດລຶບບູດໄດ້'
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
}

.shadow-premium {
  box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.08) !important;
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
