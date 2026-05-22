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
              <v-icon icon="mdi-shield-account" class="mr-2"></v-icon>
              <span class="text-overline font-weight-bold">ADMIN PANEL</span>
            </div>
            <h1 class="text-h3 font-weight-black text-primary">
              {{ $t('menu.user_management') || 'ຈັດການຜູ້ໃຊ້ງານ' }}
            </h1>
            <p class="text-subtitle-1 text-grey">
              ຈັດການຂໍ້ມູນຜູ້ໃຊ້ງານ, ບົດບາດ ແລະ ສະຖານະການເຂົ້າໃຊ້ລະບົບ
            </p>
          </div>
          
          <v-btn 
            color="primary" 
            prepend-icon="mdi-account-plus" 
            rounded="xl" 
            height="48"
            class="px-6 shadow-md"
            @click="openAddDialog"
          >
            {{ $t('menu.add_user') || 'ເພີ່ມຜູ້ໃຊ້ງານ' }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Dynamic Stats -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.title">
          <v-card class="glass-card pa-4 rounded-xl d-flex align-center border shadow-sm">
            <v-avatar :color="stat.color + '-lighten-5'" size="56" class="mr-4">
              <v-icon :icon="stat.icon" :color="stat.color" size="28"></v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-grey font-weight-bold">{{ stat.title }}</div>
              <div class="text-h5 font-weight-bold" :class="`text-${stat.color}`">{{ stat.value }}</div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Users Table -->
      <v-row>
        <v-col cols="12">
          <v-card class="glass-card rounded-2xl border overflow-hidden shadow-premium">
            <v-card-title class="pa-4 bg-white-50 border-b d-flex align-center flex-wrap gap-4">
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="ຄົ້ນຫາຊື່, ນາມສະກຸນ ຫຼື ອີເມວ..."
                variant="outlined"
                density="compact"
                hide-details
                class="max-width-300 mr-4"
                rounded="lg"
              ></v-text-field>
              <v-spacer></v-spacer>
              <v-btn icon="mdi-refresh" variant="text" color="primary" @click="fetchUsers" :loading="tableLoading"></v-btn>
            </v-card-title>
            
            <v-data-table
              :headers="headers"
              :items="usersList"
              :search="search"
              :loading="tableLoading"
              class="bg-transparent"
              density="comfortable"
            >
              <!-- Name Column -->
              <template v-slot:item.fullName="{ item }">
                <div class="d-flex align-center py-2">
                  <v-avatar color="primary-lighten-4" size="36" class="mr-3 text-primary font-weight-bold">
                    {{ item.firstName ? item.firstName.charAt(0).toUpperCase() : 'U' }}
                  </v-avatar>
                  <div>
                    <div class="font-weight-bold text-grey-darken-3">
                      {{ item.firstName }} {{ item.lastName }}
                    </div>
                    <div class="text-caption text-grey">ID: {{ item.id }}</div>
                  </div>
                </div>
              </template>

              <!-- Role Column -->
              <template v-slot:item.role="{ item }">
                <v-chip
                  :color="getRoleColor(item.role)"
                  size="small"
                  variant="flat"
                  class="font-weight-black text-capitalize rounded-lg px-3"
                >
                  {{ getRoleText(item.role) }}
                </v-chip>
              </template>

              <!-- Status Column -->
              <template v-slot:item.isActive="{ item }">
                <div class="d-flex align-center">
                  <v-switch
                    :model-value="item.isActive"
                    @change="toggleStatus(item)"
                    color="success"
                    hide-details
                    density="compact"
                    class="ma-0 pa-0"
                    :disabled="isCurrentUser(item.id)"
                  ></v-switch>
                  <span 
                    class="text-caption ml-2 font-weight-bold" 
                    :class="item.isActive ? 'text-success' : 'text-grey'"
                  >
                    {{ item.isActive ? 'ເປີດໃຊ້' : 'ປິດໃຊ້' }}
                  </span>
                </div>
              </template>

              <!-- Actions Column -->
              <template v-slot:item.actions="{ item }">
                <div class="d-flex gap-2 justify-end">
                  <v-btn 
                    icon="mdi-pencil-outline" 
                    variant="text" 
                    size="small" 
                    color="primary" 
                    @click="editUser(item)"
                  ></v-btn>
                  <v-btn 
                    icon="mdi-delete-outline" 
                    variant="text" 
                    size="small" 
                    color="error" 
                    @click="deleteUser(item)"
                    :disabled="isCurrentUser(item.id)"
                  ></v-btn>
                </div>
              </template>

              <!-- Empty State -->
              <template v-slot:no-data>
                <div class="pa-8 text-center text-grey">
                  <v-icon icon="mdi-account-off-outline" size="48" class="mb-2"></v-icon>
                  <p>ບໍ່ມີຂໍ້ມູນຜູ້ໃຊ້ງານ (No users found)</p>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="550" persistent>
      <v-card class="rounded-xl overflow-hidden glass-dialog">
        <v-toolbar color="primary" flat dark>
          <v-toolbar-title class="font-weight-bold text-white">
            {{ editedIndex === -1 ? 'ເພີ່ມຜູ້ໃຊ້ງານໃໝ່ (Add User)' : 'ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ງານ (Edit User)' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="close" color="white" variant="text">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="formRef">
            <v-row>
              <!-- First Name -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.firstName"
                  label="ຊື່ (First Name) *"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  color="primary"
                  :rules="[v => !!v || 'ກະລຸນາປ້ອນຊື່']"
                ></v-text-field>
              </v-col>

              <!-- Last Name -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.lastName"
                  label="ນາມສະກຸນ (Last Name) *"
                  prepend-inner-icon="mdi-account-outline"
                  variant="outlined"
                  color="primary"
                  :rules="[v => !!v || 'ກະລຸນາປ້ອນນາມສະກຸນ']"
                ></v-text-field>
              </v-col>

              <!-- Email -->
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.email"
                  label="ອີເມວ (Email) *"
                  prepend-inner-icon="mdi-email-outline"
                  variant="outlined"
                  color="primary"
                  type="email"
                  :rules="[
                    v => !!v || 'ກະລຸນາປ້ອນອີເມວ',
                    v => /.+@.+\..+/.test(v) || 'ກະລຸນາປ້ອນອີເມວທີ່ຖືກຕ້ອງ'
                  ]"
                ></v-text-field>
              </v-col>

              <!-- Phone -->
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.phone"
                  label="ເບີໂທ (Phone Number)"
                  prepend-inner-icon="mdi-phone"
                  variant="outlined"
                  color="primary"
                  placeholder="ຕົວຢ່າງ: 020 XXXXXXXX"
                ></v-text-field>
              </v-col>

              <!-- Role select -->
              <v-col cols="12">
                <v-select
                  v-model="editedItem.role"
                  :items="roleOptions"
                  item-title="label"
                  item-value="value"
                  label="ບົດບາດ (Role) *"
                  prepend-inner-icon="mdi-shield-key-outline"
                  variant="outlined"
                  color="primary"
                  :rules="[v => !!v || 'ກະລຸນາເລືອກບົດບາດ']"
                ></v-select>
              </v-col>

              <!-- Password (only on Add User) -->
              <v-col cols="12" v-if="editedIndex === -1">
                <v-text-field
                  v-model="editedItem.password"
                  label="ລະຫັດຜ່ານ (Password) *"
                  prepend-inner-icon="mdi-lock-outline"
                  variant="outlined"
                  color="primary"
                  type="password"
                  :rules="[
                    v => !!v || 'ກະລຸນາປ້ອນລະຫັດຜ່ານ',
                    v => (v && v.length >= 6) || 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ'
                  ]"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 bg-light">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="close">ຍົກເລີກ</v-btn>
          <v-btn 
            color="primary" 
            variant="flat" 
            class="px-6 rounded-lg font-weight-bold" 
            :loading="dialogLoading" 
            @click="save"
          >
            ບັນທຶກ (Save)
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SnackBar Toast Alert -->
    <v-snackbar v-model="toast.show" :color="toast.color" timeout="4000" location="top right" rounded="xl" elevation="12">
      <div class="d-flex align-center">
        <v-icon :icon="toast.icon" class="mr-2"></v-icon>
        <span class="font-weight-bold">{{ toast.text }}</span>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
  role: 'admin'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()

const loading = ref(false)
const tableLoading = ref(false)
const dialogLoading = ref(false)
const dialog = ref(false)
const search = ref('')
const usersList = ref<any[]>([])
const editedIndex = ref(-1)
const formRef = ref<any>(null)

const toast = reactive({ show: false, text: '', color: '', icon: '' })

const roleOptions = [
  { label: 'Admin (ແອດມິນ)', value: 'admin' },
  { label: 'Owner (ເຈົ້າຂອງເຂດ)', value: 'owner' },
  { label: 'Customer (ລູກຄ້າ)', value: 'customer' }
]

const headers = [
  { title: 'ຊື່ ແລະ ນາມສະກຸນ (Name)', key: 'fullName', sortable: true },
  { title: 'ອີເມວ (Email)', key: 'email', sortable: true },
  { title: 'ເບີໂທ (Phone)', key: 'phone', sortable: false },
  { title: 'ບົດບາດ (Role)', key: 'role', sortable: true },
  { title: 'ສະຖານະ (Status)', key: 'isActive', sortable: true },
  { title: 'ຈັດການ (Actions)', key: 'actions', sortable: false, align: 'end' }
] as any

const editedItem = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'customer',
  password: ''
})

const defaultItem = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'customer',
  password: ''
}

// Check if specific ID is current logged-in user to prevent disabling or deleting self
const isCurrentUser = (userId: number) => {
  return authStore.user && authStore.user.id === userId
}

// Compute statistics dynamically from users list
const stats = computed(() => {
  const total = usersList.value.length
  const admins = usersList.value.filter(u => u.role === 'admin').length
  const owners = usersList.value.filter(u => u.role === 'owner').length
  const customers = usersList.value.filter(u => u.role === 'customer').length

  return [
    { title: 'ຜູ້ໃຊ້ທັງໝົດ (Total Users)', value: total, icon: 'mdi-account-group-outline', color: 'primary' },
    { title: 'Admin (ແອດມິນ)', value: admins, icon: 'mdi-shield-check-outline', color: 'error' },
    { title: 'Owner (ເຈົ້າຂອງເຂດ)', value: owners, icon: 'mdi-account-tie-outline', color: 'warning' },
    { title: 'Customer (ລູກຄ້າ)', value: customers, icon: 'mdi-account-outline', color: 'success' }
  ]
})

onMounted(async () => {
  await fetchUsers(true)
})

const fetchUsers = async (showInitialLoader = false) => {
  if (showInitialLoader) loading.value = true
  else tableLoading.value = true

  try {
    authStore.initialize()
    const response = await $fetch<any>(`${config.public.apiBase}/users?limit=100`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })

    if (response && response.success) {
      usersList.value = response.data
    }
  } catch (e) {
    console.error('Failed to load users', e)
    showToast('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຜູ້ໃຊ້ໄດ້', 'error', 'mdi-alert')
  } finally {
    loading.value = false
    tableLoading.value = false
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'error'
    case 'owner': return 'warning'
    case 'customer': return 'success'
    default: return 'grey'
  }
}

const getRoleText = (role: string) => {
  switch (role) {
    case 'admin': return 'Admin'
    case 'owner': return 'Owner'
    case 'customer': return 'Customer'
    default: return role
  }
}

const openAddDialog = () => {
  editedIndex.value = -1
  editedItem.value = { ...defaultItem }
  dialog.value = true
}

const editUser = (item: any) => {
  editedIndex.value = usersList.value.findIndex(u => u.id === item.id)
  editedItem.value = { 
    firstName: item.firstName || '',
    lastName: item.lastName || '',
    email: item.email || '',
    phone: item.phone || '',
    role: item.role || 'customer',
    password: '' // Don't pre-populate password
  } as any
  dialog.value = true
}

const toggleStatus = async (item: any) => {
  try {
    const response = await $fetch<any>(`${config.public.apiBase}/users/${item.id}/toggle-active`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })

    if (response && response.success) {
      showToast(response.message || 'ປ່ຽນສະຖານະສຳເລັດ', 'success', 'mdi-check-circle')
      await fetchUsers()
    }
  } catch (e: any) {
    const err = e.response?._data?.message || 'ບໍ່ສາມາດປ່ຽນສະຖານະຜູ້ໃຊ້ໄດ້'
    showToast(err, 'error', 'mdi-alert')
    await fetchUsers() // Reload to reset switch status in UI
  }
}

const deleteUser = async (item: any) => {
  if (!confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ (ປິດໃຊ້ງານ) ຜູ້ໃຊ້: ${item.firstName} ${item.lastName}?`)) return

  try {
    const response = await $fetch<any>(`${config.public.apiBase}/users/${item.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })

    if (response && response.success) {
      showToast('ປິດໃຊ້ງານຜູ້ໃຊ້ສຳເລັດ!', 'success', 'mdi-check-circle')
      await fetchUsers()
    }
  } catch (e: any) {
    const err = e.response?._data?.message || 'ບໍ່ສາມາດລຶບຜູ້ໃຊ້ໄດ້'
    showToast(err, 'error', 'mdi-alert')
  }
}

const close = () => {
  dialog.value = false
  editedIndex.value = -1
}

const save = async () => {
  if (formRef.value) {
    const { valid } = await formRef.value.validate()
    if (!valid) return
  }

  dialogLoading.value = true
  try {
    const method = editedIndex.value > -1 ? 'PUT' : 'POST'
    const url = editedIndex.value > -1 
      ? `${config.public.apiBase}/users/${usersList.value[editedIndex.value].id}`
      : `${config.public.apiBase}/users`

    const payload = editedIndex.value > -1 
      ? {
          firstName: editedItem.value.firstName,
          lastName: editedItem.value.lastName,
          email: editedItem.value.email,
          phone: editedItem.value.phone,
          role: editedItem.value.role
        }
      : editedItem.value

    const response = await $fetch<any>(url, {
      method,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: payload
    })

    if (response && response.success) {
      showToast(editedIndex.value > -1 ? 'ແກ້ໄຂຂໍ້ມູນສຳເລັດ!' : 'ເພີ່ມຜູ້ໃຊ້ງານໃໝ່ສຳເລັດ!', 'success', 'mdi-check-circle')
      dialog.value = false
      await fetchUsers()
    }
  } catch (e: any) {
    const err = e.response?._data?.message || 'ບໍ່ສາມາດບັນທຶກຂໍ້ມູນຜູ້ໃຊ້ໄດ້'
    showToast(err, 'error', 'mdi-alert')
  } finally {
    dialogLoading.value = false
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

.bg-white-50 {
  background-color: rgba(255, 255, 255, 0.5) !important;
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

.max-width-300 {
  max-width: 300px;
}

.animate-fade {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
