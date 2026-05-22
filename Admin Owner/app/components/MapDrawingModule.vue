<template>
  <div class="map-drawing-wrapper">
    <!-- Action Controls -->
    <v-sheet class="pa-3 mb-4 rounded-xl d-flex align-center justify-space-between border bg-slate">
      <div class="d-flex align-center gap-2">
        <span class="text-subtitle-2 font-weight-bold text-grey-darken-3">ເລືອກຮູບແບບການແຕ້ມ (Drawing Mode):</span>
        <v-btn-toggle v-model="selectedShape" color="primary" mandatory density="comfortable" class="rounded-lg border">
          <v-btn value="rectangle" prepend-icon="mdi-vector-rectangle" size="small">Rectangle</v-btn>
          <v-btn value="polygon" prepend-icon="mdi-vector-polygon" size="small">Polygon</v-btn>
          <v-btn value="circle" prepend-icon="mdi-vector-circle" size="small">Circle</v-btn>
        </v-btn-toggle>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn color="error" size="small" variant="outlined" prepend-icon="mdi-delete" class="rounded-lg" @click="clearShapes">
          ລ້າງການແຕ້ມ (Clear)
        </v-btn>
        <v-btn color="primary" size="small" prepend-icon="mdi-check" class="rounded-lg" @click="saveAndEmit">
          ບັນທຶກພິກັດ (Save Coordinates)
        </v-btn>
      </div>
    </v-sheet>

    <!-- Canvas area -->
    <v-card class="drawing-canvas-card border rounded-2xl overflow-hidden position-relative" elevation="2">
      <!-- Fallback Interactive Canvas -->
      <div 
        class="interactive-svg-canvas"
        @mousedown="handleCanvasMouseDown"
        @mousemove="handleCanvasMouseMove"
        @mouseup="handleCanvasMouseUp"
      >
        <svg 
          viewBox="0 0 1000 600" 
          class="designer-svg"
          ref="svgRef"
        >
          <!-- Grid Pattern background -->
          <defs>
            <pattern id="drawingGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ECEFF1" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="1000" height="600" fill="url(#drawingGrid)"></rect>

          <!-- Draw instructions overlay -->
          <text x="500" y="40" text-anchor="middle" class="text-caption font-weight-bold fill-grey">
            ຄລິກ ແລະ ລາກ ເພື່ອແຕ້ມຮູບຊົງໃນແຜນຜັງ (Click and drag/click points to design the Zone layout)
          </text>

          <!-- Render All Drawn Shapes -->
          <g v-if="shapes.length > 0">
            <g v-for="(shp, idx) in shapes" :key="idx" class="drawn-shape-group">
              <!-- Rectangle -->
              <rect
                v-if="shp.type === 'rectangle'"
                :x="shp.coords.x"
                :y="shp.coords.y"
                :width="shp.coords.width"
                :height="shp.coords.height"
                class="designer-shape active-shape"
              />
              <!-- Circle -->
              <circle
                v-if="shp.type === 'circle'"
                :cx="shp.coords.cx"
                :cy="shp.coords.cy"
                :r="shp.coords.r"
                class="designer-shape active-shape"
              />
              <!-- Polygon -->
              <polygon
                v-if="shp.type === 'polygon' && shp.coords.points && shp.coords.points.length > 0"
                :points="polygonPointsString(shp.coords.points)"
                class="designer-shape active-shape"
              />
              
              <!-- Polygon points circles -->
              <g v-if="shp.type === 'polygon'">
                <circle 
                  v-for="(p, pIdx) in shp.coords.points" 
                  :key="pIdx"
                  :cx="p.x" 
                  :cy="p.y" 
                  r="6" 
                  fill="#E91E63" 
                  stroke="white" 
                  stroke-width="2"
                />
              </g>
            </g>
          </g>

          <!-- Render Current Drawing Shape (Ghost/Active) -->
          <g v-if="isDrawing && currentShapeCoords">
            <rect
              v-if="selectedShape === 'rectangle'"
              :x="currentShapeCoords.x"
              :y="currentShapeCoords.y"
              :width="currentShapeCoords.width"
              :height="currentShapeCoords.height"
              class="designer-shape drawing-ghost"
            />
            <circle
              v-if="selectedShape === 'circle'"
              :cx="currentShapeCoords.cx"
              :cy="currentShapeCoords.cy"
              :r="currentShapeCoords.r"
              class="designer-shape drawing-ghost"
            />
            <!-- Polygon Draft Lines -->
            <g v-if="selectedShape === 'polygon' && polygonPoints.length > 0">
              <polyline
                :points="polygonPointsString(polygonPoints)"
                class="designer-shape drawing-ghost"
              />
              <line
                :x1="polygonPoints[polygonPoints.length - 1].x"
                :y1="polygonPoints[polygonPoints.length - 1].y"
                :x2="mousePos.x"
                :y2="mousePos.y"
                stroke="#1976D2"
                stroke-width="2"
                stroke-dasharray="4,4"
              />
              <circle 
                v-for="(p, pIdx) in polygonPoints" 
                :key="pIdx"
                :cx="p.x" 
                :cy="p.y" 
                r="6" 
                fill="#1976D2" 
                stroke="white" 
                stroke-width="1.5"
              />
            </g>
          </g>
        </svg>

        <!-- Dynamic Overlay Alert Info -->
        <div class="position-absolute bottom-0 left-0 m-4 pa-3 bg-white-glass rounded-xl border max-width-350 shadow-sm text-left">
          <div class="text-caption font-weight-black text-primary mb-1">
            <v-icon icon="mdi-information-outline" class="mr-1" size="14"></v-icon>
            ຂໍ້ມູນພິກັດແຜນຜັງ (Shape JSON Data):
          </div>
          <pre class="json-preview text-caption">{{ formattedJSON }}</pre>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  initialValue?: any
}>()

const emit = defineEmits(['save'])

const selectedShape = ref<'rectangle' | 'polygon' | 'circle'>('rectangle')
const shapes = ref<any[]>([])
const isDrawing = ref(false)
const svgRef = ref<SVGSVGElement | null>(null)

// For dragging drag-rect / drag-circle
const startPos = ref({ x: 0, y: 0 })
const mousePos = ref({ x: 0, y: 0 })
const currentShapeCoords = ref<any>(null)

// For drawing polygon clicks
const polygonPoints = ref<{x: number, y: number}[]>([])

// Populate initial value if exists
onMounted(() => {
  if (props.initialValue) {
    try {
      const parsed = typeof props.initialValue === 'string' ? JSON.parse(props.initialValue) : props.initialValue
      if (parsed && parsed.type) {
        shapes.value = [parsed]
      }
    } catch (e) {
      console.error('Failed to parse initial drawing value', e)
    }
  }
})

const formattedJSON = computed(() => {
  if (shapes.value.length === 0) return '{ "type": null, "coordinates": [] }'
  return JSON.stringify(shapes.value[0], null, 2)
})

const polygonPointsString = (points: {x: number, y: number}[]) => {
  return points.map(p => `${p.x},${p.y}`).join(' ')
}

const clearShapes = () => {
  shapes.value = []
  polygonPoints.value = []
  isDrawing.value = false
  currentShapeCoords.value = null
}

const getMouseCoords = (e: MouseEvent) => {
  if (!svgRef.value) return { x: 0, y: 0 }
  const rect = svgRef.value.getBoundingClientRect()
  const scaleX = 1000 / rect.width
  const scaleY = 600 / rect.height
  return {
    x: Math.round((e.clientX - rect.left) * scaleX),
    y: Math.round((e.clientY - rect.top) * scaleY)
  }
}

const handleCanvasMouseDown = (e: MouseEvent) => {
  const coords = getMouseCoords(e)
  
  if (selectedShape.value === 'polygon') {
    if (!isDrawing.value) {
      isDrawing.value = true
      polygonPoints.value = [coords]
    } else {
      // Double click or click near first point to close polygon
      const first = polygonPoints.value[0]
      const dist = Math.hypot(coords.x - first.x, coords.y - first.y)
      if (dist < 15 && polygonPoints.value.length >= 3) {
        // Complete polygon
        shapes.value = [{
          type: 'polygon',
          coords: {
            points: [...polygonPoints.value]
          }
        }]
        isDrawing.value = false
        polygonPoints.value = []
        currentShapeCoords.value = null
      } else {
        polygonPoints.value.push(coords)
      }
    }
  } else {
    // Rectangle or Circle dragging start
    isDrawing.value = true
    startPos.value = coords
    mousePos.value = coords
    updateCurrentShape(coords)
  }
}

const handleCanvasMouseMove = (e: MouseEvent) => {
  const coords = getMouseCoords(e)
  mousePos.value = coords
  
  if (isDrawing.value && selectedShape.value !== 'polygon') {
    updateCurrentShape(coords)
  }
}

const handleCanvasMouseUp = (e: MouseEvent) => {
  if (isDrawing.value && selectedShape.value !== 'polygon') {
    const coords = getMouseCoords(e)
    updateCurrentShape(coords)
    
    // Save shapes
    shapes.value = [{
      type: selectedShape.value,
      coords: { ...currentShapeCoords.value }
    }]
    
    isDrawing.value = false
    currentShapeCoords.value = null
  }
}

const updateCurrentShape = (endCoords: {x: number, y: number}) => {
  if (selectedShape.value === 'rectangle') {
    const x = Math.min(startPos.value.x, endCoords.x)
    const y = Math.min(startPos.value.y, endCoords.y)
    const width = Math.abs(startPos.value.x - endCoords.x)
    const height = Math.abs(startPos.value.y - endCoords.y)
    currentShapeCoords.value = { x, y, width, height }
  } else if (selectedShape.value === 'circle') {
    const cx = startPos.value.x
    const cy = startPos.value.y
    const r = Math.round(Math.hypot(endCoords.x - cx, endCoords.y - cy))
    currentShapeCoords.value = { cx, cy, r }
  }
}

const saveAndEmit = () => {
  if (shapes.value.length > 0) {
    emit('save', shapes.value[0])
  } else {
    emit('save', null)
  }
}
</script>

<style scoped>
.gap-2 { gap: 8px; }

.bg-slate {
  background: #F8F9FA !important;
}

.drawing-canvas-card {
  min-height: 400px;
  background: #fff;
}

.interactive-svg-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.designer-svg {
  width: 100%;
  height: auto;
  display: block;
  user-select: none;
}

.designer-shape {
  stroke-width: 3;
  fill-opacity: 0.2;
}

.active-shape {
  stroke: #4CAF50;
  fill: #81C784;
}

.drawing-ghost {
  stroke: #1976D2;
  fill: #64B5F6;
  stroke-dasharray: 4,4;
}

.bg-white-glass {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}

.max-width-350 {
  max-width: 350px;
}

.json-preview {
  font-family: monospace;
  font-size: 10px;
  color: #37474F;
  margin: 0;
  max-height: 120px;
  overflow: auto;
}

.fill-grey {
  fill: #90A4AE;
}
</style>
