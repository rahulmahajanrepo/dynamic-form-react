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
    
    // Process all top-level sections
    form.sections.forEach((section, index) => {
      // Skip sections that aren't visible
      if (!isSectionVisible(section)) {
        return;
      }
      
      // Get a valid object name (using fallbacks if needed)
      const objectKey = section.objectName || section.name || `section_${index}`;
      
      // Create container for this section's data
      const sectionData: Record<string, any> = {};
      result[objectKey] = sectionData;
      
      // Add fields from this section
      section.fields?.forEach(field => {
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
        section.nestedSections.forEach((nestedSection, nestedIndex) => {
          if (!isSectionVisible(nestedSection)) {
            return;
          }
          
          if (!nestedSection.isSubSection) {
            // Get a valid object key for the nested section
            const nestedKey = nestedSection.objectName || nestedSection.name || `nested_section_${nestedIndex}`;
            
            const nestedData: Record<string, any> = {};
            sectionData[nestedKey] = nestedData;
            
            // Add fields from this nested section
            nestedSection.fields?.forEach(field => {
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
            nestedSection.fields?.forEach(field => {
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
    });
    
    console.log('Structured data:', JSON.stringify(result, null, 2));
    console.log(result);
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