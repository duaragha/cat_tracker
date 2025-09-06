import { extendTheme } from '@chakra-ui/react';

// Custom theme for Cat Tracker
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'sm',
          border: '1px solid',
          borderColor: 'gray.200',
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          option: {
            bg: 'white',
            color: 'gray.800',
            _hover: {
              bg: 'gray.100',
            },
            _selected: {
              bg: 'blue.100',
              color: 'blue.800',
            },
            _dark: {
              bg: 'gray.800',
              color: 'white',
              _hover: {
                bg: 'gray.700',
              },
              _selected: {
                bg: 'blue.900',
                color: 'blue.100',
              },
            },
          },
        },
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme;