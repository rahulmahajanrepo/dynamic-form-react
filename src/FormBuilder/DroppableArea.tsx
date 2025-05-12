import React from 'react';
import { Box, useTheme } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { alpha } from '@mui/material/styles';

interface DroppableAreaProps {
  id: string;
  children: React.ReactNode;
  isActive: boolean;
  onDragOver?: (e: React.DragEvent) => void;
}

const DroppableArea: React.FC<DroppableAreaProps> = ({ id, children, isActive, onDragOver }) => {
  const { setNodeRef } = useDroppable({ id });
  const theme = useTheme();
  
  return (
    <Box 
      ref={setNodeRef}
      sx={{ 
        minHeight: '50px',
        transition: 'all 0.15s ease-in-out',
        borderRadius: '4px',
        p: 1,
        position: 'relative',
        // Enhanced visual feedback
        border: isActive 
          ? `2px dashed ${theme.palette.primary.main}` 
          : `1px dashed ${theme.palette.divider}`,
        backgroundColor: isActive 
          ? alpha(theme.palette.primary.main, 0.08)
          : 'transparent',
        boxShadow: isActive 
          ? `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`
          : 'none',
        // Animation effect
        animation: isActive ? 'pulse 1.5s infinite' : 'none',
        '@keyframes pulse': {
          '0%': { boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}` },
          '50%': { boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.3)}` },
          '100%': { boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}` },
        }
      }}
      data-dropzone={id} // Add data attribute for easier debugging
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

export default DroppableArea;
