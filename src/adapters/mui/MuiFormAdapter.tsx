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
        
      case 'date':
        return (
          <DatePicker
            label={field.label}
            value={value || null}
            onChange={(newValue) => onChange(field.name, newValue)}
            minDate={field.min ? new Date(field.min) : undefined}
            maxDate={field.max ? new Date(field.max) : undefined}
            slotProps={{
              textField: {
                fullWidth: true,
                required: field.required,
                error: !!touched && !!error,
                helperText: touched && error,
                onBlur: onBlur
              }
            }}
          />
        );
      
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
        
      case 'checkbox':
        return (
          <FormControl 
            required={field.required}
            error={!!touched && !!error}
            component="fieldset"
            variant="standard"
            sx={{ width: '100%' }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!value}
                  onChange={(e) => onChange(field.name, e.target.checked)}
                  onBlur={onBlur}
                />
              }
              label={field.label}
            />
            {touched && error && (
              <FormHelperText>{error}</FormHelperText>
            )}
          </FormControl>
        );
        
      case 'dropdown':
        return (
          <FormControl 
            fullWidth
            required={field.required}
            error={!!touched && !!error}
          >
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value || ''}
              label={field.label}
              onChange={(e) => onChange(field.name, e.target.value)}
              onBlur={onBlur}
            >
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {touched && error && (
              <FormHelperText>{error}</FormHelperText>
            )}
          </FormControl>
        );
        
      case 'radio':
        return (
          <FormControl 
            component="fieldset"
            required={field.required}
            error={!!touched && !!error}
            sx={{ width: '100%' }}
          >
            <FormLabel component="legend">{field.label}</FormLabel>
            <RadioGroup
              value={value || ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              onBlur={onBlur}
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
            {touched && error && (
              <FormHelperText>{error}</FormHelperText>
            )}
          </FormControl>
        );
      
      default:
        // Add type assertion to tell TypeScript that field has a type property
        return <div>Unsupported field type: {(field as Field).type}</div>;
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
