import React from 'react';
import { Box, useTheme } from '@mui/material';

interface FieldDropIndicatorProps {
  active: boolean;
}

const FieldDropIndicator: React.FC<FieldDropIndicatorProps> = ({ active }) => {
  const theme = useTheme();
  
  if (!active) return null;
  
  return (
    <Box
      sx={{
        width: '100%',
        height: '3px',
        backgroundColor: theme.palette.primary.main,
        my: 0.5,
        borderRadius: '3px',
        position: 'relative',
        // Add animated arrow indicator
        '&::before': {
          content: '""',
          position: 'absolute',
          left: -8,
          top: -7,
          width: 0,
          height: 0,
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderLeft: `8px solid ${theme.palette.primary.main}`,
          animation: 'bounce 0.8s infinite alternate'
        },
        '@keyframes bounce': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(5px)' }
        }
      }}
    />
  );
};

export default FieldDropIndicator;
