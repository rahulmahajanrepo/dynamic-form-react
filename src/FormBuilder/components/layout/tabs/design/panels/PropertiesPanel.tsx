import React from 'react';
import { 
  Box, 
  Typography, 
  Paper
} from '@mui/material';
import FieldSetup from '../../../../../../FieldSetup';
import SectionSetup from '../../../../../../SectionSetup';
import { Field, Form, Section } from '../../../../../../types';

interface PropertiesPanelProps {
  selectedItem: any;
  form: Form;
  updateField: (sectionIndex: number, fieldIndex: number, updatedField: Field) => void;
  updateSection: (index: number, updatedSection: Section) => void;
  getAvailableFieldsForSection: (sectionIndex: number) => Array<{ name: string; label?: string; parentSection?: string; nestedSection?: string; nestedIndex?: number; }>;
  getAvailableFieldsForNestedSection: (sectionIndex: number, nestedIndex: number) => Array<{ name: string; label?: string; parentSection?: string; nestedSection?: string; nestedIndex?: number; }>;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedItem,
  form,
  updateField,
  updateSection,
  getAvailableFieldsForSection,
  getAvailableFieldsForNestedSection
}) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Typography variant="subtitle1" fontWeight="medium">Properties</Typography>
      </Box>
      <Box sx={{ p: 1.5, flex: 1, overflowY: 'auto' }}>
        {!selectedItem && (
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Typography color="textSecondary" variant="body2">
              Select a field or section to edit its properties
            </Typography>
          </Box>
        )}
        
        {selectedItem && selectedItem.type === 'field' && (() => {
          const fieldItem = selectedItem as { type: 'field'; sectionIndex: number; fieldIndex: number };
          const field = form.sections[fieldItem.sectionIndex]?.fields[fieldItem.fieldIndex];
          
          if (!field) {
            return (
              <Typography color="error">
                Error: Field not found
              </Typography>
            );
          }
          
          return (
            <FieldSetup
              key={`field-${fieldItem.sectionIndex}-${fieldItem.fieldIndex}`}
              field={field}
              onUpdate={(updatedField: Field) =>
                updateField(fieldItem.sectionIndex, fieldItem.fieldIndex, updatedField)
              }
            />
          );
        })()}
        
        {selectedItem && selectedItem.type === 'section' && (() => {
          const sectionItem = selectedItem as { type: 'section'; index: number };
          return (
            <SectionSetup
              section={form.sections[sectionItem.index]}
              onUpdate={(updatedSection: Section) => updateSection(sectionItem.index, updatedSection)}
              availableFields={getAvailableFieldsForSection(sectionItem.index)}
              allSections={form.sections}
            />
          );
        })()}
        {selectedItem && selectedItem.type === 'nestedSection' && (() => {
          const nestedSectionItem = selectedItem as { 
            type: 'nestedSection'; 
            sectionIndex: number; 
            nestedIndex: number 
          };
          
          const nestedSection = form.sections[nestedSectionItem.sectionIndex]?.nestedSections?.[nestedSectionItem.nestedIndex];
          
          if (!nestedSection) {
            return (
              <Typography color="error">
                Error: Nested section not found
              </Typography>
            );
          }
          
          return (
            <SectionSetup
              key={`nested-section-${nestedSectionItem.sectionIndex}-${nestedSectionItem.nestedIndex}`}
              section={
                form.sections[nestedSectionItem.sectionIndex]
                  .nestedSections![nestedSectionItem.nestedIndex]
              }
              onUpdate={(updatedSection: Section) => {
                const newSections = [...form.sections];
                if (newSections[nestedSectionItem.sectionIndex]?.nestedSections) {
                  const newNestedSections = [...newSections[nestedSectionItem.sectionIndex].nestedSections!];
                  newNestedSections[nestedSectionItem.nestedIndex] = updatedSection;
                  newSections[nestedSectionItem.sectionIndex] = {
                    ...newSections[nestedSectionItem.sectionIndex],
                    nestedSections: newNestedSections
                  };
                  updateSection(nestedSectionItem.sectionIndex, newSections[nestedSectionItem.sectionIndex]);
                }
              }}
              availableFields={getAvailableFieldsForNestedSection(nestedSectionItem.sectionIndex, nestedSectionItem.nestedIndex)}
              allSections={form.sections}
            />
          );
        })()}
        {selectedItem && selectedItem.type === 'nestedField' && (() => {
          const nestedFieldItem = selectedItem as {
            type: 'nestedField';
            sectionIndex: number;
            nestedIndex: number;
            fieldIndex: number;
          };
          
          const field = form.sections[nestedFieldItem.sectionIndex]
            ?.nestedSections?.[nestedFieldItem.nestedIndex]
            ?.fields[nestedFieldItem.fieldIndex];
          
          if (!field) {
            return (
              <Typography color="error">
                Error: Field not found
              </Typography>
            );
          }
          
          return (
            <FieldSetup
              key={`nested-field-${nestedFieldItem.sectionIndex}-${nestedFieldItem.nestedIndex}-${nestedFieldItem.fieldIndex}`}
              field={field}
              onUpdate={(updatedField) => {
                const newSections = [...form.sections];
                if (newSections[nestedFieldItem.sectionIndex]?.nestedSections?.[nestedFieldItem.nestedIndex]?.fields) {
                  const newNestedFields = [
                    ...newSections[nestedFieldItem.sectionIndex].nestedSections![nestedFieldItem.nestedIndex].fields
                  ];
                  newNestedFields[nestedFieldItem.fieldIndex] = updatedField;
                  newSections[nestedFieldItem.sectionIndex].nestedSections![nestedFieldItem.nestedIndex].fields = newNestedFields;
                  updateSection(nestedFieldItem.sectionIndex, newSections[nestedFieldItem.sectionIndex]);
                }
              }}
            />
          );
        })()}
      </Box>
    </Paper>
  );
};

export default PropertiesPanel;
