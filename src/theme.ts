import { type MantineColorsTuple, createTheme } from '@mantine/core';

// Custom color palette based on UI/UX documentation
const black: MantineColorsTuple = [
  '#f5f5f5',
  '#e7e7e7',
  '#cdcdcd',
  '#b2b2b2',
  '#9a9a9a',
  '#8b8b8b',
  '#848484',
  '#717171',
  '#656565',
  '#000000'
];

const deepBlue: MantineColorsTuple = [
  '#e8eaf6',
  '#c5cae9',
  '#9fa8da',
  '#7986cb',
  '#5c6bc0',
  '#3f51b5',
  '#3949ab',
  '#303f9f',
  '#283593',
  '#1a237e'
];

const silver: MantineColorsTuple = [
  '#f8f8f8',
  '#e8e8e8',
  '#d0d0d0',
  '#b8b8b8',
  '#a0a0a0',
  '#c0c0c0',
  '#888888',
  '#707070',
  '#585858',
  '#404040'
];

export const theme = createTheme({
  primaryColor: 'deepBlue',
  colors: {
    black,
    deepBlue,
    silver,
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
  },
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    sizes: {
      h1: { fontSize: '32px', fontWeight: '700' },
      h2: { fontSize: '24px', fontWeight: '600' },
      h3: { fontSize: '20px', fontWeight: '600' },
      h4: { fontSize: '18px', fontWeight: '500' },
      h5: { fontSize: '16px', fontWeight: '500' },
      h6: { fontSize: '14px', fontWeight: '500' },
    },
  },
  radius: {
    xs: '4px',
    sm: '8px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  breakpoints: {
    xs: '0px',
    sm: '768px',
    md: '1024px',
    lg: '1440px',
    xl: '1920px',
  },
  components: {
    Button: {
      styles: {
        root: {
          fontWeight: 500,
          minHeight: '44px', // Touch-friendly height for mobile
        },
      },
    },
    TextInput: {
      styles: {
        root: {
          minHeight: '44px',
        },
        input: {
          minHeight: '44px',
          fontSize: '16px', // Prevent zoom on iOS
        },
      },
    },
    Card: {
      styles: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});