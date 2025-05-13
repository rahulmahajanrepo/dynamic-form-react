import React, { useState, useEffect, useRef } from 'react';
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  Field,
  isTextField,
  isNumberField,
  isDropdownField,
  isRadioField,
  isCheckboxField,
  isGridField,
  TextField as TextFieldType, 
  DropdownField,
  NumberField,
  GridField,
  BaseField,
  isDateField
} from './types';
import GridFieldSetup from './GridFieldSetup';
import { formatNameToLabel } from './utils';

interface FieldSetupProps {
  field: Field;
  onUpdate: (updatedField: Field) => void;
}

/**
 * FieldSetup component
 * 
 * This component is used in the form designer to configure and customize properties
 * for different types of form fields. It provides an interface for setting common field
 * properties like name, label, tooltip, etc., as well as type-specific properties
 * based on the selected field type (text, number, dropdown, etc.).
 */
const FieldSetup: React.FC<FieldSetupProps> = ({ field, onUpdate }) => {
  // Track if label has been manually edited
  const [labelManuallyEdited, setLabelManuallyEdited] = useState(false);
  const [optionsText, setOptionsText] = useState('');

  // Add a ref for the name input
  const nameInputRef = useRef<HTMLInputElement>(null);

  // When field changes (e.g., when a new field is selected), reset the manual edit state and focus
  useEffect(() => {
    setLabelManuallyEdited(false);
    
    // Only set options text if the field has options
    if (isDropdownField(field) || isRadioField(field)) {
      setOptionsText((field.options || []).join(','));
    } else {
      setOptionsText('');
    }

    // Focus on the name field when a new field is selected
    if (nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 0);
    }
  }, [field.name, field.type]);

  // Replace the handleChange function with these type-safe handlers
  // Common handler for updating base field values
  const handleBaseChange = (name: keyof BaseField) => (event: React.ChangeEvent<HTMLInputElement>) => {
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

  // Handler for text field specific properties
  const handleTextFieldChange = (name: keyof TextFieldType) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isTextField(field)) {
      onUpdate({
        ...field,
        [name]: event.target.value
      });
    }
  };

  // Handler for number field specific properties
  const handleNumberFieldChange = (name: keyof NumberField) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isNumberField(field)) {
      onUpdate({
        ...field,
        [name]: event.target.value
      });
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

  // Alternative solution with type assertions
  const handleOptionsBlur = () => {
    if (optionsText.trim() && (isDropdownField(field) || isRadioField(field))) {
      const newOptions = optionsText
        .split(',')
        .map(opt => opt.trim())
        .filter(opt => opt !== '');

      // Since we've verified the field type, we can safely update options
      const updatedField = {
        ...field,
        options: newOptions
      };
      
      // Type assertion to satisfy TypeScript
      onUpdate(updatedField as Field);
    }
  };

  // Use type guards to render appropriate fields
  const renderFieldSpecificControls = () => {
    if (isTextField(field)) {
      return (
        <>
          <TextField
            fullWidth
            label="Min Length"
            value={field.minLength || ''}
            onChange={handleTextFieldChange('minLength')}
            type="number"
            size="small"
          />
          <TextField
            fullWidth
            label="Max Length"
            value={field.maxLength || ''}
            onChange={handleTextFieldChange('maxLength')}
            type="number"
            size="small"
          />
          {/* Other text-specific fields */}
        </>
      );
    }

    if (isNumberField(field)) {
      return (
        <>
          <TextField
            fullWidth
            label="Min Value"
            value={field.min || ''}
            onChange={handleNumberFieldChange('min')}
            type="number"
            size="small"
          />
          <TextField
            fullWidth
            label="Max Value"
            value={field.max || ''}
            onChange={handleNumberFieldChange('max')}
            type="number"
            size="small"
          />
        </>
      );
    }

    if (isDropdownField(field) || isRadioField(field)) {
      return (
        <TextField
          fullWidth
          label="Options (comma separated)"
          value={optionsText}
          onChange={handleOptionsChange}
          onBlur={handleOptionsBlur}
          helperText="Type options separated by commas"
          margin="normal"
          size="small"
          multiline
          rows={2}
        />
      );
    }

    if (isGridField(field)) {
      return <GridFieldSetup field={field} onUpdate={onUpdate as (field: GridField) => void} />;
    }

    if (isDateField(field)) {
      console.log("field setup", field);
      return (
        <>
          <Box sx={{ mb: 2 }}>
            <DatePicker
              label="Min Date"
              value={field.min ? parseISODate(field.min) : null}
              onChange={(date) => {
                if (!date) {
                  onUpdate({ ...field, min: '' });
                  return;
                }
                // Format date to YYYY-MM-DD without timezone issues
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                onUpdate({ ...field, min: `${year}-${month}-${day}` });
              }}
              format="yyyy-MM-dd"
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  size: "small",
                  helperText: "Minimum selectable date" 
                } 
              }}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <DatePicker
              label="Max Date"
              value={field.max ? parseISODate(field.max) : null}
              onChange={(date) => {
                if (!date) {
                  onUpdate({ ...field, max: '' });
                  return;
                }
                // Format date to YYYY-MM-DD without timezone issues
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                onUpdate({ ...field, max: `${year}-${month}-${day}` });
              }}
              format="yyyy-MM-dd"
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  size: "small",
                  helperText: "Maximum selectable date" 
                } 
              }}
            />
          </Box>
        </>
      );
    }

    return null;
  };

  const parseISODate = (dateString: string) => {
    // Parse the YYYY-MM-DD format manually to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    // Month is 0-indexed in JavaScript Date
    return new Date(year, month - 1, day, 12, 0, 0);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Field Properties
      </Typography>

      <TextField
        fullWidth
        label="Name"
        value={field.name || ''}
        onChange={handleBaseChange('name')}
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
        onChange={handleBaseChange('placeholder')}
        margin="normal"
        size="small"
      />

      <FormControlLabel
        control={
          <Switch
            checked={!!field.required}
            onChange={handleBaseChange('required')}
            color="primary"
          />
        }
        label="Required"
        sx={{ mt: 1 }}
      />

      {/* Field-specific controls */}
      {renderFieldSpecificControls()}
    </Box>
  );
};

export default FieldSetup;