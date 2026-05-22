<template>
  <div class="booth-map-container">
    <!-- Compact Legend -->
    <div class="d-flex align-center justify-end mb-4 gap-4 px-2">
      <div v-for="status in statusLegend" :key="status.label" class="d-flex align-center">
        <div class="legend-color-box rounded-sm shadow-sm mr-2" :class="status.colorClass"></div>
        <span class="text-caption font-weight-bold text-grey-darken-2">{{ status.label }}</span>
      </div>
    </div>

    <!-- Map Area -->
    <div class="map-scroll-container glass-panel rounded-xl pa-4 shadow-inner position-relative">
      <svg 
        viewBox="0 0 1000 700" 
        class="festival-map"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Background/Ground -->
        <rect width="1000" height="700" fill="#f8f9fa" rx="20"></rect>
        
        <!-- Grid pattern -->
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e0e0" stroke-width="0.5"/>
        </pattern>
        <rect width="1000" height="700" fill="url(#grid)" rx="20"></rect>

        <!-- Zones and Booths Generation -->
        <g v-for="zone in zones" :key="zone.id">
          <!-- Zone Label -->
          <text 
            :x="zone.labelX" 
            :y="zone.labelY" 
            class="zone-label text-h5 font-weight-black"
            :fill="zone.color"
          >
            ZONE {{ zone.id }}
          </text>

          <!-- Booths in this Zone -->
          <g 
            v-for="booth in zone.booths" 
            :key="booth.id"
            class="booth-group cursor-pointer"
            @click="selectBooth(booth.id)"
          >
            <!-- Booth Rect -->
            <rect
              :x="booth.x"
              :y="booth.y"
              :width="booth.width"
              :height="booth.height"
              :class="['booth-rect', getBoothStatusClass(booth.id)]"
              rx="4"
            />
            <!-- Booth ID -->
            <text
              :x="booth.x + booth.width/2"
              :y="booth.y + booth.height/2 + 5"
              class="booth-text font-weight-bold"
              text-anchor="middle"
            >
              {{ booth.id }}
            </text>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  boothStatuses: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['select-booth'])

const statusLegend = [
  { label: 'Available', colorClass: 'bg-white border' },
  { label: 'Pending', colorClass: 'bg-orange-lighten-4 border-orange' },
  { label: 'Booked', colorClass: 'bg-primary-lighten-4 border-primary' }
]

const getBoothStatusClass = (id: string) => {
  const status = props.boothStatuses[id] || 'Available'
  if (status === 'Booked' || status === 'Approved') return 'status-booked'
  if (status === 'Pending') return 'status-pending'
  return 'status-available'
}

const selectBooth = (id: string) => {
  emit('select-booth', id)
}

// Generate some sample layout data for zones
const zones = [
  {
    id: 'A', color: '#1976D2', labelX: 50, labelY: 50,
    booths: [
      { id: 'A1', x: 50, y: 80, width: 80, height: 80 },
      { id: 'A2', x: 150, y: 80, width: 80, height: 80 },
      { id: 'A3', x: 250, y: 80, width: 80, height: 80 },
      { id: 'A4', x: 50, y: 180, width: 80, height: 80 },
      { id: 'A5', x: 150, y: 180, width: 80, height: 80 },
      { id: 'A6', x: 250, y: 180, width: 80, height: 80 },
    ]
  },
  {
    id: 'B', color: '#4CAF50', labelX: 450, labelY: 50,
    booths: [
      { id: 'B1', x: 450, y: 80, width: 80, height: 80 },
      { id: 'B2', x: 550, y: 80, width: 80, height: 80 },
      { id: 'B3', x: 650, y: 80, width: 80, height: 80 },
      { id: 'B4', x: 450, y: 180, width: 80, height: 80 },
      { id: 'B5', x: 550, y: 180, width: 80, height: 80 },
      { id: 'B6', x: 650, y: 180, width: 80, height: 80 },
    ]
  },
  {
    id: 'C', color: '#FB8C00', labelX: 50, labelY: 350,
    booths: [
      { id: 'C1', x: 50, y: 380, width: 80, height: 80 },
      { id: 'C2', x: 150, y: 380, width: 80, height: 80 },
      { id: 'C3', x: 250, y: 380, width: 80, height: 80 },
      { id: 'C4', x: 350, y: 380, width: 80, height: 80 },
    ]
  },
  {
    id: 'D', color: '#9C27B0', labelX: 550, labelY: 350,
    booths: [
      { id: 'D1', x: 550, y: 380, width: 80, height: 80 },
      { id: 'D2', x: 650, y: 380, width: 80, height: 80 },
      { id: 'D3', x: 550, y: 480, width: 80, height: 80 },
      { id: 'D4', x: 650, y: 480, width: 80, height: 80 },
    ]
  },
  {
    id: 'E', color: '#F44336', labelX: 800, labelY: 50,
    booths: [
      { id: 'E1', x: 800, y: 80, width: 80, height: 80 },
      { id: 'E2', x: 800, y: 180, width: 80, height: 80 },
      { id: 'E3', x: 800, y: 280, width: 80, height: 80 },
    ]
  }
]
</script>

<style scoped>
.legend-color-box {
  width: 16px;
  height: 16px;
}

.map-scroll-container {
  overflow: auto;
  min-height: 400px;
}

.festival-map {
  width: 100%;
  height: auto;
  min-width: 800px;
  display: block;
}

.booth-rect {
  transition: all 0.3s ease;
  stroke-width: 2;
}

.booth-group:hover .booth-rect {
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
  stroke: #000;
  stroke-width: 3;
}

.booth-text {
  font-size: 18px;
  fill: #333;
  pointer-events: none;
  font-family: "Noto Sans Lao", sans-serif;
}

.zone-label {
  font-family: "Noto Sans Lao", sans-serif;
  opacity: 0.8;
}

/* Status Colors */
.status-available {
  fill: #ffffff;
  stroke: #e0e0e0;
}
.status-available:hover {
  fill: #f5f5f5;
}

.status-pending {
  fill: #FFE0B2; /* orange-lighten-4 */
  stroke: #FB8C00; /* orange */
}

.status-booked {
  fill: #BBDEFB; /* primary-lighten-4 */
  stroke: #1976D2; /* primary */
}
</style>
