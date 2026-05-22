import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { defineNuxtPlugin } from 'nuxt/app'

// --- GLOBAL COLOR CONFIGURATION (Change here to update all system) ---
const THEME_COLORS = {
  primary: '#0D47A1',      // Navy Dark Blue
  secondary: '#D4AF37',    // Gold
  accent: '#D32F2F',       // Red
  error: '#B71C1C',        // Deep Red
  info: '#2196F3',         // Light Blue
  success: '#4CAF50',      // Green
  warning: '#FFD700',      // Bright Gold
  background: '#F5F5F5',   // Off-white background
  surface: '#FFFFFF',      // White surfaces
}

const DARK_THEME_COLORS = {
  primary: '#042445ff',      // Visible Dark Blue for Dark Mode
  secondary: '#FFD700',    // Bright Gold
  accent: '#FF5252',       // Bright Red
  error: '#FF5252',        // Red
  info: '#4DD0E1',         // Light Blue
  success: '#4CAF50',      // Green
  warning: '#FFE066',      // Light Gold
  background: '#040914',   // Deep Dark Blue/Black
  surface: '#0A0F1E',      // Dark Surface
}
// -----------------------------------------------------------------------

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    theme: {
      defaultTheme: 'customLight',
      themes: {
        customLight: {
          dark: false,
          colors: THEME_COLORS,
        },
        customDark: {
          dark: true,
          colors: DARK_THEME_COLORS,
        },
      },
    },
    defaults: {
      VBtn: {
        style: 'font-family: "Noto Sans Lao", sans-serif; text-transform: none;',
        rounded: 'lg',
      },
      VCard: {
        style: 'font-family: "Noto Sans Lao", sans-serif;',
        rounded: 'lg',
        elevation: 2,
      },
      VDialog: {
        style: 'font-family: "Noto Sans Lao", sans-serif;',
      },
      VToolbar: {
        style: 'font-family: "Noto Sans Lao", sans-serif;',
      },
      VList: {
        style: 'font-family: "Noto Sans Lao", sans-serif;',
      },
      VSnackbar: {
        style: 'font-family: "Noto Sans Lao", sans-serif;',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VDataTable: {
        hover: true,
      },
      VAppBar: {
        elevation: 2,
      },
    },
  })
  nuxtApp.vueApp.use(vuetify)
})
