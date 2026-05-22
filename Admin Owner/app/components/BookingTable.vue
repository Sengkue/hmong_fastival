<template>
  <v-card class="glass-card rounded-xl overflow-hidden mt-6">
    <v-data-table
      :headers="headers"
      :items="bookings"
      :loading="loading"
      class="bg-transparent"
      density="comfortable"
    >
      <template v-slot:item.status="{ item }">
        <v-chip
          :color="getStatusColor(item.status)"
          size="small"
          variant="tonal"
          class="font-weight-bold"
        >
          {{ getStatusText(item.status) }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          icon="mdi-eye-outline"
          size="small"
          variant="text"
          color="primary"
          @click="$emit('view', item)"
        ></v-btn>
        <v-btn
          v-if="item.status === 'Pending'"
          icon="mdi-check-circle-outline"
          size="small"
          variant="text"
          color="success"
          @click="$emit('approve', item)"
        ></v-btn>
        <v-btn
          v-if="item.status === 'Pending'"
          icon="mdi-close-circle-outline"
          size="small"
          variant="text"
          color="error"
          @click="$emit('reject', item)"
        ></v-btn>
      </template>

      <template v-slot:no-data>
        <div class="pa-10 text-center text-grey">
          <v-icon icon="mdi-database-off-outline" size="48" class="mb-2"></v-icon>
          <p>ບໍ່ມີຂໍ້ມູນການຈອງ (No bookings found)</p>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
interface Booking {
  id: string
  boothId: string
  storeName: string
  owner: string
  phone: string
  status: 'Pending' | 'Approved' | 'Rejected'
  createdAt: string
}

defineProps<{
  bookings: Booking[]
  loading?: boolean
}>()

defineEmits(['view', 'approve', 'reject'])

const headers = [
  { title: 'ບູດ (Booth)', key: 'boothId', sortable: true },
  { title: 'ຊື່ຮ້ານ (Store)', key: 'storeName', sortable: true },
  { title: 'ເຈົ້າຂອງ (Owner)', key: 'owner', sortable: true },
  { title: 'ເບີໂທ (Phone)', key: 'phone', sortable: false },
  { title: 'ສະຖານະ (Status)', key: 'status', sortable: true },
  { title: 'ວັນທີ (Date)', key: 'createdAt', sortable: true },
  { title: 'ຈັດການ (Actions)', key: 'actions', sortable: false, align: 'end' },
] as any

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'orange'
    case 'Approved': return 'success'
    case 'Rejected': return 'error'
    default: return 'grey'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'Pending': return 'ລໍຖ້າການກວດສອບ'
    case 'Approved': return 'ອະນຸມັດແລ້ວ'
    case 'Rejected': return 'ປະຕິເສດແລ້ວ'
    default: return status
  }
}
</script>

<style scoped>
.glass-card {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

:deep(.v-data-table__th) {
  font-weight: bold !important;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
}
</style>
