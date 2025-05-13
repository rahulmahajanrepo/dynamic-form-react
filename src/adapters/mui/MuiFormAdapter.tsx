import React, { JSX } from 'react';
import { Field, GridField, Section } from '../../types';
import { IFormAdapter, FieldProps, SectionProps } from '../interfaces/IFormAdapter';
import { 
  TextField, Select, MenuItem, FormControlLabel, 
  Radio, RadioGroup, Checkbox, InputLabel, FormControl, 
  FormLabel, FormGroup, FormHelperText, Box, Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import GridRenderer from '../../GridRenderer';

export class MuiFormAdapter implements IFormAdapter {
  renderField(field: Field, props: FieldProps): JSX.Element {
    const { value, onChange, onBlur, error, touched } = props;
    
    switch (field.type) {
      case 'text':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            onBlur={onBlur}
            fullWidth
            error={!!touched && !!error}
            helperText={touched && error}
            inputProps={{
              ...(field.minLength !== undefined ? { minLength: field.minLength } : {}),
              ...(field.maxLength !== undefined ? { maxLength: field.maxLength } : {}),
              ...(field.pattern ? { pattern: field.pattern } : {})
            }}
          />
        );
        
      case 'textarea':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            onBlur={onBlur}
            fullWidth
            multiline
            rows={4}
            error={!!touched && !!error}
            helperText={touched && error}
            inputProps={{
              ...(field.minLength !== undefined ? { minLength: field.minLength } : {}),
              ...(field.maxLength !== undefined ? { maxLength: field.maxLength } : {})
            }}
          />
        );
        
      // All other field types (for brevity, showing just two more examples)
      case 'number':
        return (
          <TextField
            label={field.label}
            type="number"
            placeholder={field.placeholder}
            required={field.required}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            onBlur={onBlur}
            fullWidth
            error={!!touched && !!error}
            helperText={touched && error}
            inputProps={{
              ...(field.min !== undefined ? { min: field.min } : {}),
              ...(field.max !== undefined ? { max: field.max } : {})
            }}
          />
        );
        
      case 'grid':
        return (
          <GridRenderer
            field={field as GridField}
            value={value || { rows: [] }}
            onChange={(value) => onChange(field.name, value)}
            error={touched && error ? error : undefined}
          />
        );
        
      // Add other field types (checkbox, dropdown, radio, date) 
      // with the same implementation as in the original FormRenderer
      
      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  }

  renderSection(section: Section, props: SectionProps): JSX.Element {
    const { renderFields, renderSections, level } = props;
    
    return (
      <Box key={section.id || section.name} sx={{ mb: 4 }}>
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
        
        {renderFields(section.fields)}
        
        {section.nestedSections && section.nestedSections.length > 0 && 
          renderSections(section.nestedSections, level + 1)}
      </Box>
    );
  }
}
