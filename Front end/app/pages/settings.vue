<template>
  <v-container fluid class="pa-6 fill-height">
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="glass-card rounded-xl border-thin shadow-premium overflow-hidden text-center pa-10">
          <v-avatar color="primary-lighten-4" size="100" class="mb-6 elevation-2">
            <v-icon icon="mdi-cog-outline" size="50" color="primary"></v-icon>
          </v-avatar>
          <h1 class="text-h3 font-weight-black text-primary mb-2">System Settings</h1>
          <p class="text-subtitle-1 text-grey-darken-1 mb-8">
            System configuration and advanced preferences will be available here.
          </p>
          <v-btn color="primary" variant="elevated" prepend-icon="mdi-arrow-left" rounded="lg" to="/">
            Return to Dashboard
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>

<style scoped>
.glass-card {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
}
.shadow-premium {
  box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.08) !important;
}
</style>
