<template>
  <v-container fluid class="pa-4 max-width-600 mx-auto">
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <div v-else class="animate-fade">
      <!-- Welcome Header -->
      <v-row class="mb-4 text-center">
        <v-col cols="12">
          <div class="logo-wrapper mx-auto mb-2">
            <v-img src="/images/logo.png" height="80" contain class="logo-img"></v-img>
          </div>
          <h1 class="text-h4 font-weight-black text-primary spacing-wide">
            ບຸນກິນຈຽງ 2027
          </h1>
          <p class="text-caption text-grey-darken-1 font-weight-medium uppercase">
            Hmong Festival Booth Booking System
          </p>
        </v-col>
      </v-row>

      <!-- Search & Select Festival Box -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card class="premium-glass-card pa-4 rounded-xl border shadow-sm">
            <div class="d-flex align-center mb-3">
              <v-icon icon="mdi-party-popper" color="primary" class="mr-2"></v-icon>
              <span class="text-subtitle-2 font-weight-bold text-grey-darken-3">ເລືອກງານບຸນປະເພນີ (Select Hmong Festival)</span>
            </div>
            
            <v-select
              v-model="selectedFestival"
              :items="festivals"
              item-title="name"
              item-value="id"
              label="ງານບຸນຈັດງານ *"
              placeholder="ແຕະເພື່ອເລືອກ..."
              prepend-inner-icon="mdi-map-marker-radius"
              variant="outlined"
              color="primary"
              density="comfortable"
              class="rounded-lg mb-0"
              hide-details
              @update:model-value="fetchZonesForFestival"
            ></v-select>
          </v-card>
        </v-col>
      </v-row>

      <!-- Active Zones Layout -->
      <v-row v-if="selectedFestival && zones.length > 0">
        <v-col cols="12">
          <v-card class="premium-glass-card rounded-xl border overflow-hidden shadow-premium">
            <div class="card-header-gradient pa-4 text-white d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-avatar color="rgba(255,255,255,0.15)" size="36" class="mr-3">
                  <v-icon icon="mdi-map-search" color="white"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-black">ແຜນຜັງເຂດຈັດງານ (Zones Layout)</div>
                  <div class="text-caption text-white-70">ແຕະເລືອກເຂດ (Zone) ເພື່ອຈອງບູດ</div>
                </div>
              </div>
              <v-chip color="white" variant="flat" size="small" class="text-primary font-weight-black">
                {{ zones.length }} Zones
              </v-chip>
            </div>

            <!-- Map View Canvas -->
            <div class="pa-2 bg-light relative">
              <div class="map-wrapper rounded-lg overflow-hidden border bg-white relative">
                <svg viewBox="0 0 1000 500" class="w-100 h-auto block" preserveAspectRatio="xMidYMid meet">
                  <pattern id="custGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f4f4f4" stroke-width="0.75"/>
                  </pattern>
                  <rect width="1000" height="500" fill="url(#custGrid)"></rect>

                  <!-- Render active zones -->
                  <g v-for="zone in zones" :key="zone.id" class="zone-group cursor-pointer" @click="goToZone(zone.id)">
                    <!-- Rectangle -->
                    <rect
                      v-if="zone.shapeCoordinates?.type === 'rectangle'"
                      :x="zone.shapeCoordinates.coords.x"
                      :y="zone.shapeCoordinates.coords.y"
                      :width="zone.shapeCoordinates.coords.width"
                      :height="zone.shapeCoordinates.coords.height"
                      :fill="zone.color || '#1976D2'"
                      class="zone-svg-shape"
                    />
                    <!-- Circle -->
                    <circle
                      v-if="zone.shapeCoordinates?.type === 'circle'"
                      :cx="zone.shapeCoordinates.coords.cx"
                      :cy="zone.shapeCoordinates.coords.cy"
                      :r="zone.shapeCoordinates.coords.r"
                      :fill="zone.color || '#4CAF50'"
                      class="zone-svg-shape"
                    />
                    <!-- Polygon -->
                    <polygon
                      v-if="zone.shapeCoordinates?.type === 'polygon'"
                      :points="polygonPointsString(zone.shapeCoordinates.coords.points)"
                      :fill="zone.color || '#FF9800'"
                      class="zone-svg-shape"
                    />

                    <!-- Label -->
                    <text
                      :x="getShapeCenter(zone.shapeCoordinates).x"
                      :y="getShapeCenter(zone.shapeCoordinates).y"
                      text-anchor="middle"
                      class="font-weight-black fill-white text-h6 shadow-text"
                    >
                      {{ zone.name }}
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Empty State -->
      <v-row v-else-if="selectedFestival && zones.length === 0" justify="center">
        <v-col cols="12" class="text-center py-10">
          <v-icon icon="mdi-map-marker-off" size="56" color="grey-lighten-1" class="mb-3"></v-icon>
          <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-2">ບໍ່ທັນມີເຂດຈັດງານ</h3>
          <p class="text-caption text-grey">ງານບຸນນີ້ຍັງບໍ່ທັນໄດ້ຮັບການກຳນົດເຂດ (Zones) ຈັດງານເທື່ອ.</p>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const loading = ref(false)
const selectedFestival = ref<number | null>(null)
const festivals = ref<any[]>([])
const zones = ref<any[]>([])

onMounted(async () => {
  loading.value = true
  try {
    await authStore.initialize()
    
    // Fetch festivals list
    const response = await $fetch<any>(`${config.public.apiBase}/festivals`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (response && response.success) {
      festivals.value = response.data
      if (festivals.value.length > 0) {
        selectedFestival.value = festivals.value[0].id
        await fetchZonesForFestival()
      }
    }
  } catch (e) {
    console.error('Failed to load customer festival list', e)
  } finally {
    loading.value = false
  }
})

const fetchZonesForFestival = async () => {
  if (!selectedFestival.value) return
  try {
    const response = await $fetch<any>(`${config.public.apiBase}/zones?festivalId=${selectedFestival.value}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (response && response.success) {
      zones.value = response.data.map((z: any) => {
        let coords = z.shapeCoordinates
        if (typeof coords === 'string') {
          try {
            coords = JSON.parse(coords)
          } catch (e) {
            coords = null
          }
        }
        return {
          ...z,
          shapeCoordinates: coords
        }
      }).filter((z: any) => z.shapeCoordinates)
    }
  } catch (e) {
    console.error('Failed to fetch zones', e)
  }
}

const polygonPointsString = (points: {x: number, y: number}[]) => {
  return points.map(p => `${p.x},${p.y}`).join(' ')
}

const getShapeCenter = (shape: any) => {
  if (!shape) return { x: 500, y: 250 }
  if (shape.type === 'rectangle') {
    return {
      x: shape.coords.x + shape.coords.width / 2,
      y: shape.coords.y + shape.coords.height / 2
    }
  }
  if (shape.type === 'circle') {
    return {
      x: shape.coords.cx,
      y: shape.coords.cy
    }
  }
  if (shape.type === 'polygon' && shape.coords.points && shape.coords.points.length > 0) {
    const pts = shape.coords.points
    const sumX = pts.reduce((sum: number, p: any) => sum + p.x, 0)
    const sumY = pts.reduce((sum: number, p: any) => sum + p.y, 0)
    return {
      x: sumX / pts.length,
      y: sumY / pts.length
    }
  }
  return { x: 500, y: 250 }
}

const goToZone = (zoneId: number) => {
  navigateTo(localePath(`/booths?zoneId=${zoneId}`))
}
</script>

<style scoped>
.max-width-600 {
  max-width: 600px;
}

.logo-wrapper {
  width: 80px;
  height: 80px;
}

.spacing-wide {
  letter-spacing: 1px;
}

.premium-glass-card {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
}

.card-header-gradient {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.map-wrapper {
  min-height: 250px;
  background-color: #ffffff;
}

.zone-svg-shape {
  fill-opacity: 0.3;
  stroke: #ffffff;
  stroke-width: 3;
  transition: all 0.3s ease;
}

.zone-group:hover .zone-svg-shape {
  fill-opacity: 0.65;
  stroke: #2a5298;
  stroke-width: 4;
}

.shadow-text {
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  font-family: 'Noto Sans Lao', sans-serif;
  pointer-events: none;
}

.fill-white {
  fill: #ffffff;
}

.text-white-70 {
  color: rgba(255, 255, 255, 0.75);
}

.bg-light {
  background-color: #fafafa;
}

.animate-fade {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
