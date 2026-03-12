import { themeConfig } from '@themeConfig'

const theme = {
  defaultTheme: localStorage.getItem(`${themeConfig.app.title}-theme`) || themeConfig.app.theme.value,
  themes: {
    light: {
      dark: false,
      colors: {
        'primary': localStorage.getItem(`${themeConfig.app.title}-lightThemePrimaryColor`) || '#003678',
        'secondary': '#C2C2C2',
        'on-secondary': '#fff',
        'success': '#56CA00',
        'info': '#50B0D1',
        'warning': '#FFB400',
        'error': '#FF4C51',
        'on-primary': '#FFFFFF',
        'on-success': '#FFFFFF',
        'on-warning': '#FFFFFF',
        'background': '#F2F4F8',
        'on-background': '#1A1A2E',
        'on-surface': '#1A1A2E',
        'grey-50': '#FAFAFA',
        'grey-100': '#F5F5F5',
        'grey-200': '#E6E6E6',
        'grey-300': '#E0E0E0',
        'grey-400': '#C2C2C2',
        'grey-500': '#9E9E9E',
        'grey-600': '#757575',
        'grey-700': '#616161',
        'grey-800': '#424242',
        'grey-900': '#212121',
        'perfect-scrollbar-thumb': '#C2C2C2',
      },
      variables: {
        'border-color': '#1A1A2E',

        // Shadows
        'shadow-key-umbra-opacity': 'rgba(var(--v-theme-on-surface), 0.08)',
        'shadow-key-penumbra-opacity': 'rgba(var(--v-theme-on-surface), 0.12)',
        'shadow-key-ambient-opacity': 'rgba(var(--v-theme-on-surface), 0.04)',
      },
    },
    dark: {
      dark: true,
      colors: {
        'primary': localStorage.getItem(`${themeConfig.app.title}-darkThemePrimaryColor`) || '#003678',
        'secondary': '#C2C2C2',
        'on-secondary': '#fff',
        'success': '#56CA00',
        'info': '#50B0D1',
        'warning': '#FFB400',
        'error': '#FF4C51',
        'on-primary': '#FFFFFF',
        'on-success': '#FFFFFF',
        'on-warning': '#FFFFFF',
        'background': '#0E1929',
        'on-background': '#E0E6ED',
        'surface': '#152238',
        'on-surface': '#E0E6ED',
        'grey-50': '#1A2A3E',
        'grey-100': '#1F3044',
        'grey-200': '#2A4060',
        'grey-300': '#3A5578',
        'grey-400': '#5A7A9E',
        'grey-500': '#7A9AB8',
        'grey-600': '#9AB5CC',
        'grey-700': '#B0C7D8',
        'grey-800': '#C8D8E6',
        'grey-900': '#E0E8F0',
        'perfect-scrollbar-thumb': '#2A4060',
      },
      variables: {
        'border-color': '#E0E6ED',

        // Shadows
        'shadow-key-umbra-opacity': 'rgba(10, 20, 35, 0.08)',
        'shadow-key-penumbra-opacity': 'rgba(10, 20, 35, 0.12)',
        'shadow-key-ambient-opacity': 'rgba(10, 20, 35, 0.04)',
      },
    },
  },
}

export default theme
