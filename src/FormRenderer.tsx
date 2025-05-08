import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Select, MenuItem, FormControlLabel, 
  Radio, RadioGroup, Typography, FormHelperText, Checkbox,
  InputLabel, FormControl, FormLabel, FormGroup, Paper
} from '@mui/material';
import { Form, Field, GridField, GridValue, Section } from './types';
import DataGrid from './DataGrid';
import GridRenderer from './GridRenderer';

interface FormRendererProps {
  form: Form;
  onSubmit: (data: any) => void;
}

const FormRenderer: React.FC<FormRendererProps> = ({ form, onSubmit }) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [gridValues, setGridValues] = useState<Record<string, GridValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Add this function to check section visibility
  const isSectionVisible = (section: Section): boolean => {
    // If there's no condition field or value, the section is always visible
    if (!section.conditionField || !section.conditionValue) {
      return true;
    }

    // Check if the condition field has a value in our form data
    const fieldValue = formValues[section.conditionField];
    
    // Compare the field value with the condition value
    // For string comparison, use exact match
    if (typeof fieldValue === 'string' && typeof section.conditionValue === 'string') {
      return fieldValue === section.conditionValue;
    }
    
    // For boolean comparison (checkbox fields)
    if (typeof fieldValue === 'boolean' && typeof section.conditionValue === 'string') {
      return fieldValue === (section.conditionValue.toLowerCase() === 'true');
    }
    
    // For number comparison
    if (typeof fieldValue === 'number' && typeof section.conditionValue === 'string') {
      return fieldValue === parseFloat(section.conditionValue);
    }
    
    // For any other case, do a basic string comparison
    return String(fieldValue) === String(section.conditionValue);
  };
  
  // Update the handleChange function, lines 70-75
const handleChange = (name: string, value: any) => {
  // Update form values
  setFormValues(prev => ({
    ...prev,
    [name]: value
  }));
  
  // Clear errors when the field is changed
  if (errors[name]) {
    setErrors(prev => ({
      ...prev,
      [name]: '' // Use empty string instead of undefined
    }));
  }
  
  // Also make sure the field is marked as touched
  setTouched(prev => ({
    ...prev,
    [name]: true
  }));
};
  
  // Add this function to handle grid changes
  const handleGridChange = (name: string, value: GridValue) => {
    setGridValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    // Validate grid if needed
    validateField(name, value.rows);
  };
  
  // Validate a single field
  const validateField = (name: string, value: any) => {
    let error = '';
    
    // Find the field definition
    const field = findFieldByName(name);
    if (!field) return true; // Field not found, consider valid
    
    // Check if required
    if (field.required && (value === undefined || value === null || value === '')) {
      error = 'This field is required';
      setErrors(prev => ({ ...prev, [name]: error }));
      return false;
    }
    
    // Skip validation if field is empty and not required
    if ((value === undefined || value === null || value === '') && !field.required) {
      setErrors(prev => ({ ...prev, [name]: '' }));
      return true;
    }
    
    // Validate text field
    if ((field.type === 'text' || field.type === 'textarea') && value) {
      if (field.minLength !== undefined && String(value).length < +field.minLength) {
        error = `Minimum length is ${field.minLength} characters`;
      }
      else if (field.maxLength !== undefined && String(value).length > +field.maxLength) {
        error = `Maximum length is ${field.maxLength} characters`;
      }
      else if (field.pattern && field.pattern.trim() !== '' && !new RegExp(field.pattern).test(String(value))) {
        error = 'Invalid format';
      }
    }
    
    // Validate number field
    if (field.type === 'number' && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        error = 'Please enter a valid number';
      }
      else if (field.min !== undefined && numValue < +field.min) {
        error = `Minimum value is ${field.min}`;
      }
      else if (field.max !== undefined && numValue > +field.max) {
        error = `Maximum value is ${field.max}`;
      }
    }
    
    // Update errors
    setErrors(prev => ({ ...prev, [name]: error }));
    
    return error === '';
  };
  
  // Update the findFieldByName function to search in nested sections too
const findFieldByName = (name: string): Field | undefined => {
  // Helper to search through an array of sections
  const searchSections = (sections: Section[]): Field | undefined => {
    for (const section of sections) {
      // Check fields in this section
      const field = section.fields.find(f => f.name === name);
      if (field) return field;
      
      // Check fields in nested sections
      if (section.nestedSections && section.nestedSections.length > 0) {
        const nestedField = searchSections(section.nestedSections);
        if (nestedField) return nestedField;
      }
    }
    return undefined;
  };
  
  return searchSections(form.sections);
};
  
  // Update validateForm to handle nested sections too
const validateForm = () => {
  let isValid = true;
  const newErrors: Record<string, string> = {};
  const newTouched: Record<string, boolean> = {...touched};
  
  // Helper to process fields in a section and its nested sections
  const processFieldsInSection = (section: Section) => {
    // Process fields in this section
    section.fields.forEach(field => {
      newTouched[field.name] = true;
      if (!validateField(field.name, formValues[field.name])) {
        isValid = false;
        newErrors[field.name] = errors[field.name] || 'This field is invalid';
      }
    });
    
    // Process fields in nested sections
    if (section.nestedSections && section.nestedSections.length > 0) {
      section.nestedSections.forEach(nestedSection => {
        if (isSectionVisible(nestedSection)) {
          processFieldsInSection(nestedSection);
        }
      });
    }
  };
  
  // Process all sections
  form.sections.forEach(section => {
    if (isSectionVisible(section)) {
      processFieldsInSection(section);
    }
  });
  
  setTouched(newTouched);
  setErrors(newErrors);
  return isValid;
};
  
  // Process the form values into a nested object structure
  const processFormValues = () => {
    const processedData: Record<string, any> = {};
    
    const processSection = (section: Section, parentObject: Record<string, any>) => {
      // Skip processing if section is not visible
      if (!isSectionVisible(section)) return;
      
      // Create an object for this section
      const sectionObject: Record<string, any> = {};
      
      // Add fields to this section's object
      section.fields.forEach(field => {
        if (field.type === 'grid') {
          sectionObject[field.name] = gridValues[field.name]?.rows || [];
        } else {
          sectionObject[field.name] = formValues[field.name];
        }
      });
      
      // Process nested sections
      if (section.nestedSections && section.nestedSections.length > 0) {
        section.nestedSections.forEach(nestedSection => {
          // Only process visible nested sections
          if (isSectionVisible(nestedSection)) {
            // Use objectName as the property name, or use the section name if objectName is empty
            const objectKey = nestedSection.objectName || nestedSection.name;
            const nestedObject: Record<string, any> = {};
            processSection(nestedSection, nestedObject);
            // If the nested object has properties, add it to the section object
            if (Object.keys(nestedObject).length > 0) {
              sectionObject[objectKey] = Object.values(nestedObject)[0];
            }
          }
        });
      }
      
      // Add this section to parent object using objectName or name
      const objectKey = section.objectName || section.name;
      parentObject[objectKey] = sectionObject;
    };
    
    // Process top-level sections
    form.sections.forEach(section => {
      if (isSectionVisible(section)) {
        if (!section.parentId) { // Only process top-level sections here
          processSection(section, processedData);
        }
      }
    });
    
    return processedData;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // First validate the form
    if (!validateForm()) {
      return;
    }
    
    // Build structured data
    const structuredData = buildStructuredData();
    
    // Call the onSubmit callback with both raw and structured data
    onSubmit({
      rawValues: formValues,
      structuredData: structuredData
    });
  };

  // Update the buildStructuredData function to include grid data
const buildStructuredData = () => {
  const result: Record<string, any> = {};
  
  // Process all top-level sections
  form.sections.forEach(section => {
    // Skip sections that aren't visible
    if (!isSectionVisible(section)) {
      return;
    }
    
    // Only process top-level sections with objectName
    if (section.objectName) {
      // Create container for this section's data
      const sectionData: Record<string, any> = {};
      result[section.objectName] = sectionData;
      
      // Add fields from this section
      section.fields.forEach(field => {
        if (field.name) {
          // Check if it's a grid field
          if (field.type === 'grid' && gridValues[field.name]) {
            // Include grid data from gridValues state
            sectionData[field.name] = gridValues[field.name].rows || [];
          } 
          // Or a regular field with a value
          else if (formValues[field.name] !== undefined) {
            sectionData[field.name] = formValues[field.name];
          }
        }
      });
      
      // Process nested sections if any
      if (section.nestedSections && section.nestedSections.length > 0) {
        // First pass: process regular nested sections (not sub-sections)
        section.nestedSections.forEach(nestedSection => {
          if (!isSectionVisible(nestedSection)) {
            return;
          }
          
          if (!nestedSection.isSubSection && nestedSection.objectName) {
            const nestedData: Record<string, any> = {};
            sectionData[nestedSection.objectName] = nestedData;
            
            // Add fields from this nested section
            nestedSection.fields.forEach(field => {
              if (field.name) {
                // Check if it's a grid field
                if (field.type === 'grid' && gridValues[field.name]) {
                  // Include grid data from gridValues state
                  nestedData[field.name] = gridValues[field.name].rows || [];
                }
                // Or a regular field with a value 
                else if (formValues[field.name] !== undefined) {
                  nestedData[field.name] = formValues[field.name];
                }
              }
            });
          }
        });
        
        // Second pass: process sub-sections (add fields directly to parent)
        section.nestedSections.forEach(nestedSection => {
          if (!isSectionVisible(nestedSection)) {
            return;
          }
          
          if (nestedSection.isSubSection) {
            // Add fields directly to parent section data
            nestedSection.fields.forEach(field => {
              if (field.name) {
                // Check if it's a grid field
                if (field.type === 'grid' && gridValues[field.name]) {
                  // Include grid data from gridValues state
                  sectionData[field.name] = gridValues[field.name].rows || [];
                }
                // Or a regular field with a value
                else if (formValues[field.name] !== undefined) {
                  sectionData[field.name] = formValues[field.name];
                }
              }
            });
          }
        });
      }
    }
  });
  
  console.log('Structured data:', result);
  console.log('Structured data:', JSON.stringify(result, null, 2));
  return result;
};

  // First, move the helper function to render section fields above the return
  const renderFields = (fields: Field[]) => {
    return fields.map((field) => (
      <Box key={field.name} sx={{ mb: 3 }}>
        {/* Your existing field rendering code */}
        {field.type === 'text' && (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            value={formValues[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => setTouched({...touched, [field.name]: true})}
            fullWidth
            error={!!touched[field.name] && !!errors[field.name]}
            helperText={touched[field.name] && errors[field.name]}
            inputProps={{
              // Only include constraints when defined
              ...(field.minLength !== undefined ? { minLength: field.minLength } : {}),
              ...(field.maxLength !== undefined ? { maxLength: field.maxLength } : {}),
              ...(field.pattern ? { pattern: field.pattern } : {})
            }}
          />
        )}
        {field.type === 'textarea' && (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            value={formValues[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => setTouched({...touched, [field.name]: true})}
            fullWidth
            multiline
            rows={4}
            error={!!touched[field.name] && !!errors[field.name]}
            helperText={touched[field.name] && errors[field.name]}
            inputProps={{
              // Only include constraints when defined
              ...(field.minLength !== undefined ? { minLength: field.minLength } : {}),
              ...(field.maxLength !== undefined ? { maxLength: field.maxLength } : {})
            }}
          />
        )}
        {field.type === 'number' && (
          <TextField
            label={field.label}
            type="number"
            placeholder={field.placeholder}
            required={field.required}
            value={formValues[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => setTouched({...touched, [field.name]: true})}
            fullWidth
            error={!!touched[field.name] && !!errors[field.name]}
            helperText={touched[field.name] && errors[field.name]}
            inputProps={{
              // Only include constraints when defined
              ...(field.min !== undefined ? { min: field.min } : {}),
              ...(field.max !== undefined ? { max: field.max } : {})
            }}
          />
        )}
        {field.type === 'password' && (
          <TextField
            label={field.label}
            type="password"
            placeholder={field.placeholder}
            required={field.required}
            value={formValues[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => setTouched({...touched, [field.name]: true})}
            fullWidth
            error={!!touched[field.name] && !!errors[field.name]}
            helperText={touched[field.name] && errors[field.name]}
          />
        )}
        {field.type === 'checkbox' && (
          <FormControl 
            required={field.required}
            error={!!touched[field.name] && !!errors[field.name]}
            component="fieldset"
            variant="standard"
            sx={{ width: '100%' }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!formValues[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  onBlur={() => setTouched({...touched, [field.name]: true})}
                />
              }
              label={field.label}
            />
            {touched[field.name] && errors[field.name] && (
              <FormHelperText>{errors[field.name]}</FormHelperText>
            )}
          </FormControl>
        )}
        {field.type === 'dropdown' && (
          <FormControl 
            fullWidth
            required={field.required}
            error={!!touched[field.name] && !!errors[field.name]}
          >
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={formValues[field.name] || ''}
              label={field.label}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onBlur={() => setTouched({...touched, [field.name]: true})}
            >
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {touched[field.name] && errors[field.name] && (
              <FormHelperText>{errors[field.name]}</FormHelperText>
            )}
          </FormControl>
        )}
        {field.type === 'radio' && (
          <FormControl 
            component="fieldset"
            required={field.required}
            error={!!touched[field.name] && !!errors[field.name]}
            sx={{ width: '100%' }}
          >
            <FormLabel component="legend">{field.label}</FormLabel>
            <RadioGroup
              value={formValues[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onBlur={() => setTouched({...touched, [field.name]: true})}
            >
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {touched[field.name] && errors[field.name] && (
              <FormHelperText>{errors[field.name]}</FormHelperText>
            )}
          </FormControl>
        )}
        {field.type === 'grid' && (
          <GridRenderer
            field={field as GridField} // Add type assertion here
            value={gridValues[field.name] || { rows: [] }} // Provide a default value with empty rows
            onChange={(value) => handleGridChange(field.name, value)}
            error={touched[field.name] && errors[field.name] ? errors[field.name] : undefined} // Ensure we pass string or undefined
          />
        )}
      </Box>
    ));
  };

  // Next, move renderSections to be before the return statement
  const renderSections = (sections: Section[], level: number = 0) => {
    return sections.map((section, sectionIndex) => {
      // Skip rendering if section shouldn't be visible
      if (!isSectionVisible(section)) {
        return null;
      }
      
      return (
        <Box 
          key={section.id || sectionIndex} 
          sx={{ mb: 4 }}
        >
          {/* Render all sections with the same heading style, regardless of nesting */}
          {!section.isSubSection && (
            <Typography variant="h6" gutterBottom sx={{ 
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 1,
              mb: 2
            }}>
              {section.name}
            </Typography>
          )}
          
          {/* Render fields */}
          {renderFields(section.fields)}
          
          {/* Render nested sections recursively with the same styling */}
          {section.nestedSections && section.nestedSections.length > 0 && 
            renderSections(section.nestedSections, level + 1)}
        </Box>
      );
    });
  };

  // Add a useEffect to log form values when they change (helpful for debugging)
  useEffect(() => {
    console.log('Form values changed:', formValues);
  }, [formValues]);

  // Replace the code in useEffect that's causing the error
useEffect(() => {
  // Helper to collect all field names with default values
  const collectFieldsWithDefaults = (sections: Section[]): Record<string, any> => {
    let result: Record<string, any> = {};
    
    sections.forEach(section => {
      // Get fields from this section
      section.fields.forEach(field => {
        // Only set default if not already in formValues
        if (field.name && result[field.name] === undefined) {
          // Safely handle different field types without accessing undefined properties
          if (field.type === 'checkbox') {
            // For checkbox fields, default to false unless specified
            const hasDefault = 'defaultValue' in field;
            result[field.name] = hasDefault ? 
              (field.defaultValue === 'true' || field.defaultValue === true) : 
              false;
          } else {
            // For all other field types
            result[field.name] = 'defaultValue' in field ? field.defaultValue : '';
          }
        }
      });
      
      // Get fields from nested sections
      if (section.nestedSections && section.nestedSections.length > 0) {
        result = { ...result, ...collectFieldsWithDefaults(section.nestedSections) };
      }
    });
    
    return result;
  };
  
  // Rest of the useEffect stays the same
  const fieldsWithDefaults = collectFieldsWithDefaults(form.sections);
  
  setFormValues(prev => ({
    ...fieldsWithDefaults,
    ...prev // Keep existing values
  }));
  
}, [form.sections]);

  // Now the return statement can use these functions
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {renderSections(form.sections)}
      <Button 
        type="submit" 
        variant="contained" 
        color="primary"
        sx={{ mt: 2 }}
      >
        Submit
      </Button>
    </Box>
  );
};

export default FormRenderer;