import '../styles/globals.css'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import Navbar from '../components/Navbar'

export default function App({ Component, pageProps }) {
  // Create custom theme
  const theme = createTheme({
    direction: 'rtl',
    palette: {
      primary: {
        main: '#667eea',
        light: '#8b9ff6',
        dark: '#4a5fd8',
      },
      secondary: {
        main: '#f093fb',
        light: '#f4b5ff',
        dark: '#c471d9',
      },
      background: {
        default: '#f8f9fa',
        paper: '#ffffff',
      },
    },
    typography: {
      fontFamily: 'Tajawal, Cairo, Roboto, Arial, sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        '@media (max-width: 600px)': {
          fontSize: '2rem',
        },
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        '@media (max-width: 600px)': {
          fontSize: '1.5rem',
        },
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        '@media (max-width: 600px)': {
          fontSize: '1.25rem',
        },
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        '@media (max-width: 600px)': {
          fontSize: '1.25rem',
        },
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        '@media (max-width: 600px)': {
          fontSize: '1.1rem',
        },
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.1rem',
        '@media (max-width: 600px)': {
          fontSize: '1rem',
        },
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            },
            '@media (max-width: 600px)': {
              borderRadius: 12,
              margin: '8px',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
            '@media (max-width: 600px)': {
              padding: '8px 16px',
              fontSize: '0.875rem',
            },
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            '@media (max-width: 600px)': {
              paddingLeft: '16px',
              paddingRight: '16px',
            },
          },
        },
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <div style={{ marginTop: '80px' }}>
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  )
}