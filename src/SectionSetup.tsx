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
  Tooltip,
  Button,
  Divider,
  Alert
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import { Section } from './types';
import { formatNameToLabel } from './utils';

interface SectionSetupProps {
  section: Section;
  onUpdate: (updatedSection: Section) => void;
  availableFields: string[];
  allSections?: Section[]; // Make this optional
}

const SectionSetup: React.FC<SectionSetupProps> = ({ section, onUpdate, availableFields, allSections = [] }) => {
  const [name, setName] = useState(section.name);
  const [objectName, setObjectName] = useState(section.objectName || '');
  const [objectNameManuallyEdited, setObjectNameManuallyEdited] = useState(!!section.objectName);
  const [conditionField, setConditionField] = useState(section.conditionField || '');
  const [conditionValue, setConditionValue] = useState(section.conditionValue || '');
  const [isSubSection, setIsSubSection] = useState(section.isSubSection || false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Create a ref for the object name input
  const objectNameInputRef = useRef<HTMLInputElement>(null);
  
  // Focus the object name input when section changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (objectNameInputRef.current) {
        objectNameInputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [section.id]);

  // Filter available fields to only allow "forward" dependencies
  const getAvailableConditionFields = () => {
    if (!section.parentId) {
      // For top-level sections, check if the field's section comes before this one
      return availableFields.filter(fieldName => {
        // Find which section this field belongs to
        for (const s of allSections) {
          const fieldExists = s.fields.some(f => f.name === fieldName);
          if (fieldExists) {
            // Check if this section comes before the current section
            const sectionIndex = allSections.findIndex(sec => sec.id === s.id);
            const currentSectionIndex = allSections.findIndex(sec => sec.id === section.id);
            return sectionIndex < currentSectionIndex;
          }
        }
        return false;
      });
    } else {
      // For nested sections, only allow fields from the parent section
      const parentSection = allSections.find(s => s.id === section.parentId);
      return parentSection?.fields.map(f => f.name) || [];
    }
  };

  const handleObjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setObjectName(value);
    setObjectNameManuallyEdited(true);
    onUpdate({ 
      ...section, 
      objectName: value,
      // If section name is empty or was auto-generated, update it too
      name: name === '' ? formatNameToLabel(value) : name
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    onUpdate({ ...section, name: value });
  };

  const handleConditionFieldChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setConditionField(value);
    setConditionValue(''); // Reset condition value when field changes
    onUpdate({ ...section, conditionField: value, conditionValue: '' });
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

  const handleAddNestedSection = () => {
    const newNestedSection: Section = {
      id: `section_${Date.now()}`,
      name: `Sub-section ${(section.nestedSections?.length || 0) + 1}`,
      objectName: '',
      fields: [],
      isSubSection: true,
      parentId: section.id,
      nestedSections: []
    };

    const updatedNestedSections = section.nestedSections ? 
      [...section.nestedSections, newNestedSection] : 
      [newNestedSection];
      
    onUpdate({
      ...section,
      nestedSections: updatedNestedSections
    });
  };

  // Check for circular dependencies
  useEffect(() => {
    if (conditionField) {
      // Find which section the condition field belongs to
      for (const s of allSections) {
        const fieldExists = s.fields.some(f => f.name === conditionField);
        if (fieldExists) {
          // Check if this creates a circular dependency
          const dependentSectionIndex = allSections.findIndex(sec => sec.id === s.id);
          const currentSectionIndex = allSections.findIndex(sec => sec.id === section.id);
          
          if (dependentSectionIndex > currentSectionIndex) {
            setValidationError("Condition field must be from an earlier section (no backward dependencies)");
            return;
          }
        }
      }
      setValidationError(null);
    }
  }, [conditionField, section.id, allSections]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Section Properties
      </Typography>

      <TextField 
        fullWidth
        size="small"
        margin="dense"
        id="objectName"
        label="Object Name"
        value={objectName}
        onChange={(e) => {
          const newObjectName = e.target.value;
          // When Object Name changes, update Section Name automatically
          if (newObjectName) {
            const formattedName = formatNameToLabel(newObjectName);
            setObjectName(newObjectName);
            setName(formattedName);
            onUpdate({
              ...section,
              objectName: newObjectName,
              name: formattedName
            });
          } else {
            // If object name is cleared, just update the object name without changing section name
            setObjectName(newObjectName);
            onUpdate({
              ...section,
              objectName: newObjectName
            });
          }
        }}
        helperText="Unique identifier for this section (used in JSON output)"
        inputRef={objectNameInputRef} // Add the ref here
      />

      <TextField 
        label="Section Name" 
        value={name} 
        onChange={handleNameChange} 
        fullWidth 
        helperText={!objectNameManuallyEdited ? "Auto-formatted from object name" : "Display name shown as heading"}
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
      
      <FormControl fullWidth size="small">
        <InputLabel>Condition Field</InputLabel>
        <Select
          value={conditionField}
          onChange={handleConditionFieldChange}
          label="Condition Field"
        >
          <MenuItem value="">None</MenuItem>
          {getAvailableConditionFields().map((field) => (
            <MenuItem key={field} value={field}>
              {field}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          Only fields from earlier sections are available
        </Typography>
      </FormControl>
      
      {validationError && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {validationError}
        </Alert>
      )}
      
      {conditionField && (
        <TextField
          label="Condition Value"
          value={conditionValue}
          onChange={handleConditionValueChange}
          fullWidth
          size="small"
          helperText="Section will show when the selected field equals this value"
        />
      )} {/* Add the missing curly brace here */}

      <Divider sx={{ my: 1 }} />
      
      <Typography variant="subtitle2" gutterBottom>
        Nested Sections
      </Typography>
      
      {section.nestedSections && section.nestedSections.length > 0 ? (
        <Box sx={{ ml: 2, pl: 1, borderLeft: '2px solid #e0e0e0' }}>
          {section.nestedSections.map((nestedSection, index) => (
            <Box key={nestedSection.id} sx={{ mb: 1 }}>
              <Typography variant="body2">
                {index + 1}. {nestedSection.name || 'Unnamed Section'}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No nested sections
        </Typography>
      )}
      
      <Button
        startIcon={<AddIcon />}
        variant="outlined"
        size="small"
        onClick={handleAddNestedSection}
        sx={{ alignSelf: 'flex-start', mt: 1 }}
      >
        Add Nested Section
      </Button>
    </Box>
  );
};

export default SectionSetup;