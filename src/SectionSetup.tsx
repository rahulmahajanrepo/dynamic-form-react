import React, { useState, useEffect, useRef } from 'react';
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  SelectChangeEvent,
  Typography,
  FormControlLabel,
  Switch,
  Tooltip 
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { Section } from './types';

interface SectionSetupProps {
  section: Section;
  onUpdate: (updatedSection: Section) => void;
  availableFields: string[];
}

const SectionSetup: React.FC<SectionSetupProps> = ({ section, onUpdate, availableFields }) => {
  const [name, setName] = useState(section.name);
  const [conditionField, setConditionField] = useState(section.conditionField || '');
  const [conditionValue, setConditionValue] = useState(section.conditionValue || '');
  const [isSubSection, setIsSubSection] = useState(section.isSubSection || false);

  // Create a ref for the section name input
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // Focus the name input when section changes
  useEffect(() => {
    if (nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 0);
    }
  }, [section.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    onUpdate({ ...section, name: e.target.value });
  };

  const handleConditionFieldChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setConditionField(value);
    onUpdate({ ...section, conditionField: value });
  };

  const handleConditionValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConditionValue(e.target.value);
    onUpdate({ ...section, conditionValue: e.target.value });
  };
  
  const handleIsSubSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsSubSection(checked);
    onUpdate({ ...section, isSubSection: checked });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Section Properties
      </Typography>

      <TextField 
        label="Section Name" 
        value={name} 
        onChange={handleNameChange} 
        fullWidth 
        inputRef={nameInputRef}
        helperText="Section name shown as heading"
        size="small"
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              checked={isSubSection}
              onChange={handleIsSubSectionChange}
              color="primary"
            />
          }
          label="Is sub-section"
        />
        <Tooltip title="When enabled, section heading will not be displayed in the form">
          <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
        </Tooltip>
      </Box>
      
      <FormControl fullWidth>
        <InputLabel>Condition Field</InputLabel>
        <Select
          value={conditionField}
          onChange={handleConditionFieldChange}
          label="Condition Field"
        >
          <MenuItem value="">None</MenuItem>
          {availableFields.map((field) => (
            <MenuItem key={field} value={field}>
              {field}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {conditionField && (
        <TextField
          label="Condition Value"
          value={conditionValue}
          onChange={handleConditionValueChange}
          fullWidth
          helperText="Section will show when the selected field equals this value"
        />
      )}
    </Box>
  );
};

export default SectionSetup;