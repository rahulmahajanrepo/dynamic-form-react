import { useState, useEffect } from 'react';
import { Form, Section, GridValue } from '../types';

export function useFormState(form: Form) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [gridValues, setGridValues] = useState<Record<string, GridValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialize form with default values
  useEffect(() => {
    // Helper to collect all field names with default values
    const collectFieldsWithDefaults = (sections: Section[]): Record<string, any> => {
      let result: Record<string, any> = {};
      
      sections.forEach(section => {
        // Get fields from this section
        section.fields.forEach(field => {
          if (field.name && result[field.name] === undefined) {
            if (field.type === 'checkbox') {
              const hasDefault = 'defaultValue' in field;
              result[field.name] = hasDefault ? 
                (field.defaultValue === 'true' || field.defaultValue === true) : 
                false;
            } else {
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
    
    const fieldsWithDefaults = collectFieldsWithDefaults(form.sections);
    
    setFormValues(prev => ({
      ...fieldsWithDefaults,
      ...prev // Keep existing values
    }));
  }, [form.sections]);

  // Handle changes to form fields
  const handleChange = (name: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Handle changes to grid fields
  const handleGridChange = (name: string, value: GridValue) => {
    setGridValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  return {
    formValues,
    gridValues,
    errors,
    touched,
    setFormValues,
    setGridValues,
    setErrors,
    setTouched,
    handleChange,
    handleGridChange
  };
}
