import { createTheme } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#0ea5e9', // Cyan/Blue
      light: '#7dd3fc',
      dark: '#075985',
    },
    secondary: {
      main: '#6366f1', // Indigo/Purple-Blue (for In Progress)
      light: '#a5b4fc',
      dark: '#4338ca',
    },
    background: mode === 'dark'
      ? { default: '#0b1120', paper: '#111827' }
      : { default: '#f1f5f9', paper: '#ffffff' },
    success: {
      main: '#22c55e', // Green
    },
    warning: {
      main: '#f97316', // Orange (for Pending)
    },
    error: {
      main: '#ef4444', // Red
    },
    info: {
      main: '#6366f1', // Using Indigo for In Progress as requested (purple/blue)
    },
    text: mode === 'dark'
      ? { primary: '#f8fafc', secondary: '#94a3b8' }
      : { primary: '#0f172a', secondary: '#475569' },
    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.01em' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === 'dark' ? '#0b1120' : '#f1f5f9',
          color: mode === 'dark' ? '#f8fafc' : '#0f172a',
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: mode === 'dark'
            ? '0 10px 30px rgba(0, 0, 0, 0.5)'
            : '0 4px 20px rgba(15, 23, 42, 0.05)',
        },
      },
    },
  },
});

export default getTheme;
