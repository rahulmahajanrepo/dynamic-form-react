import React from 'react';
import { Box, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Form, Field, Section } from './types';
import { AdapterFactory, FrameworkType } from './factories/AdapterFactory';
import { useFormState } from './hooks/useFormState';
import { validateField, findFieldByName } from './utils/formValidation';
import { isSectionVisible as checkSectionVisibility } from './utils/sectionVisibility';

interface FormRendererProps {
  form: Form;
  onSubmit: (data: any) => void;
  framework?: FrameworkType;
}

const FormRenderer: React.FC<FormRendererProps> = ({ form, onSubmit, framework = 'mui' }) => {
  const {
    formValues,
    gridValues,
    errors,
    touched,
    setErrors,
    setTouched,
    handleChange,
    handleGridChange
  } = useFormState(form);

  // Create the appropriate adapter using the factory
  const adapter = AdapterFactory.createAdapter(framework);

  // Use the visibility utility
  const isSectionVisible = (section: Section): boolean => {
    return checkSectionVisibility(section, formValues);
  };

  // Validate a single field
  const validateFormField = (name: string, value: any) => {
    return validateField(form, name, value, errors, setErrors);
  };
  
  // Extract all fields from sections recursively
  const getAllFields = (sections: Section[]): Field[] => {
    const fields: Field[] = [];
    
    const extractFields = (sections: Section[]) => {
      sections.forEach(section => {
        // Add fields from the current section
        if (section.fields) {
          fields.push(...section.fields);
        }
        
        // Recursively process subsections
        if (section.nestedSections) {
          extractFields(section.nestedSections);
        }
      });
    };
    
    extractFields(sections);
    return fields;
  };
  
  // Validate the entire form
  const validateForm = () => {
    // Create a fresh touched state with all fields marked as touched
    const newTouched: Record<string, boolean> = {};
    const allFields = getAllFields(form.sections);
    
    // Mark all fields as touched
    allFields.forEach(field => {
      newTouched[field.name] = true;
    });
    
    // Update the touched state
    setTouched(newTouched);
    
    // Validate each field
    let isValid = true;
    allFields.forEach(field => {
      const fieldValue = field.type === 'grid' ? gridValues[field.name] : formValues[field.name];
      const fieldValid = validateFormField(field.name, fieldValue);
      if (!fieldValid) {
        isValid = false;
      }
    });
    
    return isValid;
  };
  
  // Build structured data
  const buildStructuredData = () => {
    const result: Record<string, any> = {};
    
    // Process each form value
    Object.entries(formValues).forEach(([key, value]) => {
      // Check if it's a nested property (contains dots)
      if (key.includes('.')) {
        const parts = key.split('.');
        let current = result;
        
        // Navigate through the object structure
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
        
        // Set the value at the leaf node
        current[parts[parts.length - 1]] = value;
      } else {
        // It's a top-level property
        result[key] = value;
      }
    });
    
    // Handle grid values if they exist
    Object.entries(gridValues).forEach(([key, value]) => {
      result[key] = value;
    });
    
    return result;
  };

  // Render form fields
  const renderFields = (fields: Field[]) => {
    return fields.map((field) => (
      <Box key={field.name} sx={{ mb: 3 }}>
        {adapter.renderField(field, {
          value: field.type === 'grid' ? gridValues[field.name] : formValues[field.name],
          onChange: field.type === 'grid' ? handleGridChange : handleChange,
          onBlur: () => setTouched({...touched, [field.name]: true}),
          error: errors[field.name],
          touched: !!touched[field.name]
        })}
      </Box>
    ));
  };

  // Render form sections
  const renderSections = (sections: Section[], level: number = 0) => {
    return sections.map((section, sectionIndex) => {
      if (!isSectionVisible(section)) {
        return null;
      }
      
      return (
        <React.Fragment key={section.id || sectionIndex}>
          {adapter.renderSection(section, {
            renderFields,
            renderSections: (nestedSections: Section[]) => {
              // Filter out null elements to satisfy the type requirement
              const rendered = renderSections(nestedSections, level + 1);
              return rendered.filter((element): element is React.ReactElement => element !== null);
            },
            level
          })}
        </React.Fragment>
      );
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const structuredData = buildStructuredData();
    onSubmit({
      rawValues: formValues,
      structuredData: structuredData
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
    </LocalizationProvider>
  );
};

export default FormRenderer;