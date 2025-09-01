export const lightTheme = {
  colors: {
    // Primary colors (Telegram-like)
    primary: '#0088CC',
    primaryLight: '#40A9FF',
    primaryDark: '#005580',
    
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    backgroundTertiary: '#F1F3F4',
    backgroundElevated: '#FFFFFF',
    
    // Text colors
    text: '#1C1E21',
    textSecondary: '#65676B',
    textTertiary: '#8E8E93',
    textInverse: '#FFFFFF',
    
    // Border colors
    border: '#E4E6EA',
    borderLight: '#F0F2F5',
    borderDark: '#CCD0D5',
    
    // Status colors
    success: '#31A24C',
    warning: '#F7B928',
    error: '#FA383E',
    info: '#0088CC',
    
    // Chat colors
    chatBackground: '#FFFFFF',
    messageBackground: '#F0F2F5',
    messageBackgroundOwn: '#E3F2FD',
    messageText: '#1C1E21',
    messageTextOwn: '#1C1E21',
    
    // Sidebar colors
    sidebarBackground: '#F8F9FA',
    sidebarHover: '#E4E6EA',
    sidebarActive: '#E3F2FD',
    
    // Input colors
    inputBackground: '#FFFFFF',
    inputBorder: '#E4E6EA',
    inputFocus: '#0088CC',
    inputPlaceholder: '#8E8E93',
    
    // Button colors
    buttonPrimary: '#0088CC',
    buttonPrimaryHover: '#0077B3',
    buttonSecondary: '#F0F2F5',
    buttonSecondaryHover: '#E4E6EA',
    buttonText: '#FFFFFF',
    buttonTextSecondary: '#1C1E21',
    
    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowDark: 'rgba(0, 0, 0, 0.2)',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '50%',
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },
  
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      xxxl: '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease',
    slow: '0.35s ease',
  },
  
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px',
  },
};

export const darkTheme = {
  colors: {
    // Primary colors (Telegram-like)
    primary: '#0088CC',
    primaryLight: '#40A9FF',
    primaryDark: '#005580',
    
    // Background colors
    background: '#1C1E21',
    backgroundSecondary: '#2A2D31',
    backgroundTertiary: '#3A3D41',
    backgroundElevated: '#2A2D31',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#B0B3B8',
    textTertiary: '#8E8E93',
    textInverse: '#1C1E21',
    
    // Border colors
    border: '#3A3D41',
    borderLight: '#4A4D51',
    borderDark: '#2A2D31',
    
    // Status colors
    success: '#31A24C',
    warning: '#F7B928',
    error: '#FA383E',
    info: '#0088CC',
    
    // Chat colors
    chatBackground: '#1C1E21',
    messageBackground: '#2A2D31',
    messageBackgroundOwn: '#0D47A1',
    messageText: '#FFFFFF',
    messageTextOwn: '#FFFFFF',
    
    // Sidebar colors
    sidebarBackground: '#2A2D31',
    sidebarHover: '#3A3D41',
    sidebarActive: '#0D47A1',
    
    // Input colors
    inputBackground: '#2A2D31',
    inputBorder: '#3A3D41',
    inputFocus: '#0088CC',
    inputPlaceholder: '#8E8E93',
    
    // Button colors
    buttonPrimary: '#0088CC',
    buttonPrimaryHover: '#0077B3',
    buttonSecondary: '#3A3D41',
    buttonSecondaryHover: '#4A4D51',
    buttonText: '#FFFFFF',
    buttonTextSecondary: '#FFFFFF',
    
    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowLight: 'rgba(0, 0, 0, 0.2)',
    shadowDark: 'rgba(0, 0, 0, 0.5)',
  },
  
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  shadows: lightTheme.shadows,
  typography: lightTheme.typography,
  transitions: lightTheme.transitions,
  breakpoints: lightTheme.breakpoints,
};

export type Theme = typeof lightTheme;
