<template>
  <v-container fluid class="pa-6">
    <v-row>
      <!-- Header -->
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-2">
          <div>
            <h1 class="text-h4 font-weight-bold text-primary mb-1">{{ $t('menu.user_management') }}</h1>
            <p class="text-subtitle-1 text-grey">ຈັດການຂໍ້ມູນຜູ້ໃຊ້ລະບົບ ແລະ ກວດສອບບົດບາດ</p>
          </div>
          <v-btn color="primary" prepend-icon="mdi-account-plus" @click="openAddDialog">
            {{ $t('menu.add_user') }}
          </v-btn>
        </div>
      </v-col>

      <!-- Stats -->
      <v-col cols="12" md="3" v-for="stat in userStats" :key="stat.title">
        <v-card class="glass-card pa-4 rounded-xl d-flex align-center border">
          <v-avatar :color="stat.color + '-lighten-5'" size="56" class="mr-4">
            <v-icon :icon="stat.icon" :color="stat.color" size="28"></v-icon>
          </v-avatar>
          <div>
            <div class="text-caption text-grey">{{ stat.title }}</div>
            <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
          </div>
        </v-card>
      </v-col>

      <!-- Users Table -->
      <v-col cols="12">
        <v-card class="glass-card rounded-xl border" elevation="0">
          <v-card-title class="pa-4 d-flex align-center">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="ຄົ້ນຫາຊື່ຜູ້ໃຊ້ ຫຼື ເບີໂທ"
              variant="outlined"
              density="compact"
              hide-details
              class="max-width-300"
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-refresh" variant="text" @click="fetchUsers"></v-btn>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="users"
            :search="search"
            :loading="loading"
            class="bg-transparent"
          >
            <template v-slot:item.role="{ item }">
              <v-chip
                :color="getRoleColor(item.role)"
                size="small"
                variant="flat"
                class="font-weight-bold"
              >
                {{ item.role }}
              </v-chip>
            </template>

            <template v-slot:item.status="{ item }">
              <v-chip
                :color="item.status === 'Active' ? 'success' : 'error'"
                size="small"
                variant="tonal"
              >
                {{ item.status === 'Active' ? $t('user.active') : $t('user.inactive') }}
              </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="editUser(item)"></v-btn>
              <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="deleteUser(item)"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ editedIndex === -1 ? $t('menu.add_user') : $t('menu.edit_user') }}
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.username"
                :label="$t('user.username')"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.phone"
                :label="$t('user.phone')"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="editedItem.role"
                :items="['Admin', 'Staff', 'Manager']"
                :label="$t('user.role')"
                variant="outlined"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="editedItem.status"
                :items="['Active', 'Inactive']"
                :label="$t('user.status')"
                variant="outlined"
              ></v-select>
            </v-col>
            <v-col cols="12" v-if="editedIndex === -1">
              <v-text-field
                v-model="editedItem.password"
                label="ລະຫັດຜ່ານ (Password)"
                type="password"
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="close">{{ $t('common.cancel') || 'Cancel' }}</v-btn>
          <v-btn color="primary" variant="flat" class="px-6" @click="save">{{ $t('common.save') || 'Save' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { t } = useI18n()

const loading = ref(false)
const search = ref('')
const dialog = ref(false)
const editedIndex = ref(-1)

const headers = [
  { title: t('user.username'), key: 'username' },
  { title: t('user.phone'), key: 'phone' },
  { title: t('user.role'), key: 'role' },
  { title: t('user.status'), key: 'status' },
  { title: t('user.last_login'), key: 'last_login' },
  { title: t('user.actions'), key: 'actions', sortable: false, align: 'end' },
]

const userStats = ref([
  { title: 'ຜູ້ໃຊ້ທັງໝົດ', value: 12, icon: 'mdi-account-group', color: 'primary' },
  { title: 'Admin', value: 2, icon: 'mdi-shield-check', color: 'error' },
  { title: 'Manager', value: 4, icon: 'mdi-account-tie', color: 'warning' },
  { title: 'Staff', value: 6, icon: 'mdi-account', color: 'success' },
])

const users = ref([
  { username: 'admin', phone: '020 55551234', role: 'Admin', status: 'Active', last_login: '2026-05-09 10:30' },
  { username: 'somphone', phone: '020 22223333', role: 'Staff', status: 'Active', last_login: '2026-05-09 09:15' },
  { username: 'maly', phone: '020 99998888', role: 'Manager', status: 'Active', last_login: '2026-05-08 14:00' },
  { username: 'vang_test', phone: '020 77776666', role: 'Staff', status: 'Inactive', last_login: '2026-05-01 11:20' },
])

const editedItem = ref({
  username: '',
  phone: '',
  role: 'Staff',
  status: 'Active',
  password: ''
})

const defaultItem = {
  username: '',
  phone: '',
  role: 'Staff',
  status: 'Active',
  password: ''
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Admin': return 'error'
    case 'Manager': return 'warning'
    case 'Staff': return 'success'
    default: return 'grey'
  }
}

const fetchUsers = async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  loading.value = false
}

const openAddDialog = () => {
  editedIndex.value = -1
  editedItem.value = { ...defaultItem }
  dialog.value = true
}

const editUser = (item: any) => {
  editedIndex.value = users.value.indexOf(item)
  editedItem.value = { ...item }
  dialog.value = true
}

const deleteUser = (item: any) => {
  if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຜູ້ໃຊ້ນີ້?')) {
    const index = users.value.indexOf(item)
    users.value.splice(index, 1)
  }
}

const close = () => {
  dialog.value = false
  editedIndex.value = -1
}

const save = () => {
  if (editedIndex.value > -1) {
    Object.assign(users.value[editedIndex.value], editedItem.value)
  } else {
    users.value.push({ ...editedItem.value, last_login: '-' } as any)
  }
  close()
}
</script>

<style scoped>
.glass-card {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.max-width-300 {
  max-width: 300px;
}
</style>
