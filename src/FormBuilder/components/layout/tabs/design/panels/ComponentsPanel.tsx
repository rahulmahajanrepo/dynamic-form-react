import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Divider, 
  useTheme,
  Paper
} from '@mui/material';
import DraggableItem from '../../../../../../DraggableItem';
import { Field } from '../../../../../../types';

interface ComponentsPanelProps {
  fieldTypes: Field['type'][];
  addSection: () => void;
}

const ComponentsPanel: React.FC<ComponentsPanelProps> = ({
  fieldTypes,
  addSection
}) => {
  const theme = useTheme();
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
      }}
    >
      <Box sx={{ p: 1.5, flexShrink: 0 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Components</Typography>
        <Divider sx={{ mb: 1 }} />
      </Box>
      <Box sx={{ 
        p: 1.5, 
        overflowY: 'auto',
        flex: 1 
      }}>
        <Typography variant="caption" sx={{ mb: 0.5, color: theme.palette.text.secondary, display: 'block' }}>
          FORM ELEMENTS
        </Typography>
        
        {/* Draggable field types */}
        {fieldTypes.map((type) => (
          <DraggableItem key={type} type="FIELD" name={type} />
        ))}
        
        <Divider sx={{ my: 1 }} />
        <Typography variant="caption" sx={{ mb: 0.5, color: theme.palette.text.secondary, display: 'block' }}>
          STRUCTURE
        </Typography>
        <Button 
          variant="outlined" 
          onClick={addSection} 
          sx={{ mt: 0.5, width: '100%' }}
          color="primary"
          size="small"
        >
          Add Section
        </Button>
      </Box>
    </Paper>
  );
};

export default ComponentsPanel;
