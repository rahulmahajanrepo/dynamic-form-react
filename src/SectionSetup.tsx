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

// Update the SectionSetupProps interface to include all field metadata
interface SectionSetupProps {
  section: Section;
  onUpdate: (updatedSection: Section) => void;
  availableFields: Array<{ 
    name: string; 
    label?: string;
    parentSection?: string;
    nestedSection?: string;
    nestedIndex?: number;
  }>;
  allSections?: Section[]; 
}

// Add a helper function to convert section name to a valid object name (camelCase without special chars)
const formatLabelToName = (label: string): string => {
  if (!label) return '';
  
  // Replace spaces and special chars with underscores, then remove any non-alphanumeric chars
  const sanitized = label
    .replace(/[\s-]+/g, '_') // Replace spaces and hyphens with underscores
    .replace(/[^a-zA-Z0-9_]/g, '') // Remove all non-alphanumeric chars except underscores
    .replace(/_{2,}/g, '_'); // Replace multiple consecutive underscores with a single one
  
  // Convert to camelCase (first char lowercase)
  return sanitized.charAt(0).toLowerCase() + sanitized.slice(1);
};

const SectionSetup: React.FC<SectionSetupProps> = ({ section, onUpdate, availableFields, allSections = [] }) => {
  // Update the initial state in the SectionSetup component
  const [name, setName] = useState(section.name);
  const [objectName, setObjectName] = useState(
    section.objectName || formatLabelToName(section.name || '')
  );
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

  // Add this useEffect to update state when the section prop changes
  useEffect(() => {
    // Update all state variables when section changes
    setName(section.name || '');
    setObjectName(section.objectName || formatLabelToName(section.name || ''));
    setConditionField(section.conditionField || '');
    setConditionValue(section.conditionValue || '');
    setIsSubSection(section.isSubSection || false);
    setObjectNameManuallyEdited(!!section.objectName);
    
    // Reset validation error
    setValidationError(null);
  }, [section]); // Dependency on section means this will run whenever section changes

  // Update the getAvailableConditionFields function to show hierarchy
  const getAvailableConditionFields = () => {
    // If no availableFields were provided, return an empty array
    if (!availableFields || !Array.isArray(availableFields)) {
      console.warn('No available fields were provided to SectionSetup');
      return [];
    }

    // Transform the availableFields to include display paths
    return availableFields.map(field => {
      let displayPath = '';
      
      // If it's from a nested section, show full path
      if (field.nestedSection) {
        displayPath = `${field.parentSection} → ${field.nestedSection} → ${field.label || field.name}`;
      }
      // If it's from a parent section
      else if (field.parentSection) {
        displayPath = `${field.parentSection} → ${field.label || field.name}`;
      }
      // Fallback if structure is missing
      else {
        displayPath = field.label || field.name;
      }
      
      return {
        name: field.name,
        displayPath
      };
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    // If object name is empty or hasn't been manually edited, update it automatically
    if (!objectName || !objectNameManuallyEdited) {
      const newObjectName = formatLabelToName(value);
      setObjectName(newObjectName);
      onUpdate({ 
        ...section, 
        name: value,
        objectName: newObjectName 
      });
    } else {
      // Otherwise just update the name
      onUpdate({ ...section, name: value });
    }
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
    const sectionName = `Sub-section ${(section.nestedSections?.length || 0) + 1}`;
    const newNestedSection: Section = {
      id: `section_${Date.now()}`,
      name: sectionName,
      objectName: formatLabelToName(sectionName), // Auto-populate object name
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
            <MenuItem key={field.name} value={field.name}>
              {field.displayPath}
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

      {!section.parentId && !isSubSection && (
        <>
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
        </>
      )}
    </Box>
  );
};

export default SectionSetup;