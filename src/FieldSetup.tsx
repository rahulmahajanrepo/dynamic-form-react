import React, { useState, useEffect, useRef } from 'react'; // Add useRef import
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Field } from './types';
import GridFieldSetup from './GridFieldSetup';
import { formatNameToLabel } from './utils';

interface FieldSetupProps {
  field: Field;
  onUpdate: (updatedField: Field) => void;
}

const FieldSetup: React.FC<FieldSetupProps> = ({ field, onUpdate }) => {
  // Track if label has been manually edited
  const [labelManuallyEdited, setLabelManuallyEdited] = useState(false);
  const [optionsText, setOptionsText] = useState('');
  
  // Add a ref for the name input
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // When field changes (e.g., when a new field is selected), reset the manual edit state and focus
  useEffect(() => {
    setLabelManuallyEdited(false);
    setOptionsText((field.options || []).join(','));
    
    // Focus on the name field when a new field is selected
    if (nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 0);
    }
  }, [field.name, field.type]);
  
  // Common handler for updating field values
  const handleChange = (name: keyof Field) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    
    // Special case for name field - update label if it hasn't been manually edited
    if (name === 'name' && !labelManuallyEdited && typeof value === 'string') {
      onUpdate({
        ...field,
        name: value,
        label: formatNameToLabel(value)
      });
    } else {
      onUpdate({ ...field, [name]: value });
    }
  };
  
  // Special handler for label to track manual edits
  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabelManuallyEdited(true);
    onUpdate({ ...field, label: event.target.value });
  };
  
  // Handle options for multi-value fields
  const handleOptionsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptionsText(event.target.value);
  };
  
  const handleOptionsBlur = () => {
    if (optionsText.trim()) {
      const newOptions = optionsText
        .split(',')
        .map(opt => opt.trim())
        .filter(opt => opt !== '');
      
      onUpdate({
        ...field,
        options: newOptions
      });
    }
  };
  
  if (field.type === 'grid') {
    return <GridFieldSetup field={field} onUpdate={onUpdate} />;
  }

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Field Properties
      </Typography>
      
      <TextField
        fullWidth
        label="Name"
        value={field.name || ''}
        onChange={handleChange('name')}
        margin="normal"
        helperText="Unique identifier for this field"
        size="small"
        inputRef={nameInputRef} // Add the input ref here
      />
      
      <TextField
        fullWidth
        label="Label"
        value={field.label || ''}
        onChange={handleLabelChange}
        margin="normal"
        helperText={!labelManuallyEdited ? "Auto-formatted from name" : "Display label for this field"}
        size="small"
      />

      <TextField
        fullWidth
        label="Tooltip"
        value={field.tooltip || ''}
        onChange={(e) => onUpdate({ ...field, tooltip: e.target.value })}
        margin="normal"
        multiline
        rows={3}
        helperText="Help text that appears on hover"
        size="small"
      />
      
      <TextField
        fullWidth
        label="Placeholder"
        value={field.placeholder || ''}
        onChange={handleChange('placeholder')}
        margin="normal"
        size="small"
      />
      
      <FormControlLabel
        control={
          <Switch
            checked={!!field.required}
            onChange={handleChange('required')}
            color="primary"
          />
        }
        label="Required"
        sx={{ mt: 1 }}
      />
      
      {/* Field-specific properties */}
      {(field.type === 'text' || field.type === 'textarea' || field.type === 'password') && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Text Field Properties
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Min Length"
              type="number"
              value={field.minLength || ''}
              onChange={handleChange('minLength')}
              margin="normal"
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Max Length"
              type="number"
              value={field.maxLength || ''}
              onChange={handleChange('maxLength')}
              margin="normal"
              size="small"
              sx={{ flex: 1 }}
            />
          </Box>
          
          {field.type === 'text' && (
            <TextField
              fullWidth
              label="Pattern (Regex)"
              value={field.pattern || ''}
              onChange={handleChange('pattern')}
              margin="normal"
              size="small"
              helperText="Validation pattern (e.g., [A-Za-z]+ for letters only)"
            />
          )}
        </Box>
      )}
      
      {field.type === 'number' && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Number Field Properties
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Min Value"
              type="number"
              value={field.min || ''}
              onChange={handleChange('min')}
              margin="normal"
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Max Value"
              type="number"
              value={field.max || ''}
              onChange={handleChange('max')}
              margin="normal"
              size="small"
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>
      )}
      
      {(field.type === 'dropdown' || field.type === 'radio') && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Options
          </Typography>
          
          <TextField
            fullWidth
            label="Options (comma separated)"
            value={optionsText}
            onChange={handleOptionsChange}
            onBlur={handleOptionsBlur}
            helperText="Type options separated by commas, then click outside the field"
            margin="normal"
            size="small"
            multiline
            rows={2}
          />
          
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(field.options || []).map((option, index) => (
              <Chip 
                key={index} 
                label={option} 
                size="small" 
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FieldSetup;