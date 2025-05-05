import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Select, MenuItem, FormControlLabel, 
  Radio, RadioGroup, Typography, FormHelperText, Checkbox,
  InputLabel, FormControl, FormLabel, FormGroup, Paper
} from '@mui/material';
import { Form, Field } from './types';
import DataGrid from './DataGrid';

interface FormRendererProps {
  form: Form;
  onSubmit: (data: any) => void;
}

const FormRenderer: React.FC<FormRendererProps> = ({ form, onSubmit }) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [gridValues, setGridValues] = useState<Record<string, any[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Determine which sections should be visible based on conditions
  const visibleSections = form.sections.filter(section => {
    if (!section.conditionField || !section.conditionValue) {
      return true; // Always show sections without conditions
    }
    
    // Check if the condition matches
    return formValues[section.conditionField] === section.conditionValue;
  });
  
  // Handle input changes
  const handleChange = (name: string, value: any) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
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
  
  // Find a field by name across all sections
  const findFieldByName = (name: string): Field | undefined => {
    for (const section of form.sections) {
      const field = section.fields.find(f => f.name === name);
      if (field) return field;
    }
    return undefined;
  };
  
  // Validate all fields
  const validateForm = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {...touched};
    
    // Only validate fields in visible sections
    visibleSections.forEach(section => {
      section.fields.forEach(field => {
        newTouched[field.name] = true;
        if (!validateField(field.name, formValues[field.name])) {
          isValid = false;
          newErrors[field.name] = errors[field.name] || 'This field is invalid';
        }
      });
    });
    
    setTouched(newTouched);
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate all fields before submission
    if (!validateForm()) {
      return; // Don't submit if validation fails
    }
    
    const formData: Record<string, any> = { ...formValues };
    
    // Add grid values directly
    Object.entries(gridValues).forEach(([key, value]) => {
      formData[key] = value;
    });
    
    onSubmit(formData);
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {visibleSections.map((section, sectionIndex) => (
        <Box key={sectionIndex} sx={{ mb: 4 }}>
          {/* Only show the section heading if it's not a sub-section */}
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
          
          {section.fields.map((field) => (
            <Box key={field.name} sx={{ mb: 3 }}>
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
                <Box sx={{ width: '100%', mt: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>{field.label}</Typography>
                  <DataGrid
                    columns={field.columns || []}
                    rows={gridValues[field.name] || (field.data || [])}
                    onChange={(updatedRows) => {
                      setGridValues(prev => ({
                        ...prev,
                        [field.name]: updatedRows
                      }));
                    }}
                  />
                </Box>
              )}
            </Box>
          ))}
        </Box>
      ))}
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