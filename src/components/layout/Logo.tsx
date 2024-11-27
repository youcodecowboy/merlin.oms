import { useTheme } from '@mui/material';

export const Logo = () => {
  const theme = useTheme();
  
  return (
    <img 
      src={theme.palette.mode === 'light' 
        ? 'https://i.imgur.com/7v1kfO2.png'  // Light mode logo
        : 'path/to/your/dark/logo.png'       // Your existing dark mode logo
      } 
      alt="Logo"
      style={{
        height: 'your-existing-height',
        width: 'your-existing-width'
      }}
    />
  );
}; 