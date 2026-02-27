export const colors = {
  bg: '#F4F6FB',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2FF',
  border: '#D6DEEE',
  text: '#132238',
  textMuted: '#5C6C86',
  primary: '#2D6AF3',
  primaryPressed: '#1F56CC',
  success: '#1E9E63',
  warningBg: '#FFF5DD',
  warningText: '#8A6400',
  danger: '#D43F3A',
  chatUserBg: '#2D6AF3',
  chatAssistantBg: '#EAF0FF',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const typography = {
  title: 30,
  h1: 24,
  h2: 20,
  body: 15,
  caption: 12,
};

export const shadows = {
  card: {
    shadowColor: '#12345B',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
};

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
};

export type Theme = typeof theme;
