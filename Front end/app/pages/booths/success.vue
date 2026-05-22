<template>
  <v-container class="fill-height justify-center align-center">
    <v-card class="glass-card pa-8 rounded-xl text-center" max-width="500">
      <v-avatar color="success-lighten-5" size="100" class="mb-6">
        <v-icon icon="mdi-check-decagram" color="success" size="60"></v-icon>
      </v-avatar>
      
      <h1 class="text-h4 font-weight-bold mb-2">ຈອງບູດສຳເລັດ!</h1>
      <p class="text-subtitle-1 text-grey mb-6">
        ການຈອງຂອງທ່ານຖືກສົ່ງເຂົ້າລະບົບແລ້ວ. ຜູ້ຈັດງານຈະກວດສອບ ແລະ ຢືນຢັນພາຍໃນ 24 ຊົ່ວໂມງ.
      </p>

      <v-divider class="mb-6"></v-divider>

      <div class="text-subtitle-2 text-grey mb-1">ລະຫັດອ້າງອີງ (Reference Code)</div>
      <div class="text-h3 font-weight-black text-primary mb-6">{{ refCode }}</div>

      <v-alert
        type="warning"
        variant="tonal"
        class="text-left mb-6"
        title="ໝາຍເຫດ"
        text="ກະລຸນາຖ່າຍຮູບໜ້ານີ້ ຫຼື ຈື່ລະຫັດອ້າງອີງໄວ້ເພື່ອໃຊ້ໃນການກວດສອບສະຖານະ."
      ></v-alert>

      <v-btn
        block
        color="primary"
        size="large"
        class="rounded-lg text-none"
        :to="localePath('/')"
      >
        ກັບຄືນໜ້າຫຼັກ
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()
const refCode = computed(() => route.query.ref || 'REF00000')
</script>

<style scoped>
.glass-card {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
