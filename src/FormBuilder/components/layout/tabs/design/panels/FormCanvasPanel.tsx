import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  useTheme 
} from '@mui/material';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Field, Form, Section } from '../../../../../../types';
import DroppableArea from '../../../../../DroppableArea';
import FieldDropIndicator from '../../../../../FieldDropIndicator';
import SortableSection from '../../../../../SortableSection';
import SortableFieldItem from '../../../../fields/SortableFieldItem';
import { updateSectionSelection, clearAllSelections } from '../../../../../../utils/sectionUtils';

interface FormCanvasPanelProps {
  form: Form;
  selectedItem: any;
  setSelectedItem: (item: any) => void;
  activeDropSection: number | string | null;
  activeField: {field: Field; id: string; sectionIndex: number} | null;
  dropIndicator: {sectionIndex: number; fieldIndex: number; nestedIndex?: number} | null;
  recentlyAddedField: {
    sectionIndex: number;
    fieldIndex: number;
    nestedIndex?: number;
    timestamp: number;
  } | null;
  addSection: () => void;
  updateSection: (index: number, updatedSection: Section) => void;
  updateField: (sectionIndex: number, fieldIndex: number, updatedField: Field) => void;
  handleDeleteSectionClick: (sectionIndex: number, event: React.MouseEvent) => void;
  moveSectionUp: (sectionIndex: number, e?: React.MouseEvent) => void;
  moveSectionDown: (sectionIndex: number, event: React.MouseEvent) => void;
  handleNestedSectionUp: (sectionIndex: number, nestedIndex: number, e: React.MouseEvent) => void;
  handleNestedSectionDown: (sectionIndex: number, nestedIndex: number, e: React.MouseEvent) => void;
  handleNestedSectionSelect: (sectionIndex: number, nestedIndex: number) => void;
  handleDeleteNestedSection: (sectionIndex: number, nestedIndex: number, e: React.MouseEvent) => void;
  getFieldIds: (sectionIndex: number) => string[];
  getSectionIds: () => string[];
  getNestedFieldIds: (sectionIndex: number, nestedIndex: number) => string[];
  handleFieldSelect: (sectionIndex: number, fieldIndex: number, event: React.MouseEvent) => void;
  removeField: (sectionIndex: number, fieldIndex: number, event: React.MouseEvent) => void;
  moveFieldUp: (sectionIndex: number, fieldIndex: number, e: React.MouseEvent) => void;
  moveFieldDown: (sectionIndex: number, fieldIndex: number, e: React.MouseEvent) => void;
  handleNestedFieldSelect: (sectionIndex: number, nestedIndex: number, fieldIndex: number, event: React.MouseEvent) => void;
  removeNestedField: (sectionIndex: number, nestedIndex: number, fieldIndex: number, event: React.MouseEvent) => void;
  moveNestedFieldUp: (sectionIndex: number, nestedIndex: number, fieldIndex: number, e: React.MouseEvent) => void;
  moveNestedFieldDown: (sectionIndex: number, nestedIndex: number, fieldIndex: number, e: React.MouseEvent) => void;
}

const FormCanvasPanel: React.FC<FormCanvasPanelProps> = ({
  form,
  selectedItem,
  setSelectedItem,
  activeDropSection,
  activeField,
  dropIndicator,
  recentlyAddedField,
  addSection,
  updateSection,
  updateField,
  handleDeleteSectionClick,
  moveSectionUp,
  moveSectionDown,
  handleNestedSectionUp,
  handleNestedSectionDown,
  handleNestedSectionSelect,
  handleDeleteNestedSection,
  getFieldIds,
  getSectionIds,
  getNestedFieldIds,
  handleFieldSelect,
  removeField,
  moveFieldUp,
  moveFieldDown,
  handleNestedFieldSelect,
  removeNestedField,
  moveNestedFieldUp,
  moveNestedFieldDown
}) => {
  const theme = useTheme();

  // Handle section selection, including nested sections
  const handleSectionSelect = (sectionId: string) => {
    // First clear all existing selections
    const clearedForm = clearAllSelections(form);
    
    // Then set the selected section
    const updatedForm = updateSectionSelection(clearedForm, sectionId, true);
    
    // Update form state with the new selection state - integrate with existing selection mechanism
    // This should update your state management system with the updated form
    // setForm(updatedForm); - This needs to be connected to your actual state update mechanism
  };

  // Click handler for the form canvas - can be used to deselect all
  const handleCanvasClick = () => {
    // Optional: deselect all sections when clicking on empty canvas area
    // setForm(clearAllSelections(form));
    // Integrate with your existing selection clearing mechanism
    setSelectedItem(null);
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.grey[50],
      overflow: 'hidden',
    }}>
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        p: 2,
      }}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            minHeight: 'calc(100% - 16px)',
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
            Form Designer
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ mb: 2, color: theme.palette.text.secondary }}>
            Drag fields here. Click to edit properties. Use drag handle to reorder.
          </Typography>
          
          {form.sections.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '200px',
              border: `2px dashed ${theme.palette.divider}`,
              borderRadius: '8px',
              p: 3
            }}>
              <Typography color="textSecondary" sx={{ mb: 1 }}>
                Your form is empty
              </Typography>
              <Button 
                variant="contained" 
                onClick={addSection}
                color="primary"
                size="small"
              >
                Add First Section
              </Button>
            </Box>
          ) : (
            <SortableContext 
              items={getSectionIds()} 
              strategy={verticalListSortingStrategy}
            >
              {form.sections.map((section, sectionIndex) => {
                if (!section) return null;
                
                return (
                  <SortableSection
                    key={`section-sortable-${sectionIndex}`}
                    id={`section-sortable-${sectionIndex}`}
                    section={section}
                    index={sectionIndex}
                    isSelected={selectedItem?.type === 'section' && selectedItem.index === sectionIndex}
                    onSelect={() => setSelectedItem({ type: 'section', index: sectionIndex })}
                    onDelete={(e) => handleDeleteSectionClick(sectionIndex, e)}
                    onMoveUp={(e) => moveSectionUp(sectionIndex, e)}
                    onMoveDown={(e) => moveSectionDown(sectionIndex, e)}
                    activeDropSection={activeDropSection}
                    activeField={activeField}
                    onUpdateSection={(updatedSection) => updateSection(sectionIndex, updatedSection)}
                    onNestedSectionUp={(nestedIndex, e) => handleNestedSectionUp(sectionIndex, nestedIndex, e)}
                    onNestedSectionDown={(nestedIndex, e) => handleNestedSectionDown(sectionIndex, nestedIndex, e)}
                    onDeleteNestedSection={(nestedIndex, e) => handleDeleteNestedSection(sectionIndex, nestedIndex, e)}
                    selectedItem={selectedItem}
                    onNestedSectionSelect={(nestedIndex) => handleNestedSectionSelect(sectionIndex, nestedIndex)}
                    getNestedFieldIds={(sectionIndex, nestedIndex) => getNestedFieldIds(sectionIndex, nestedIndex)}
                    onNestedFieldSelect={(nestedIndex, fieldIndex, e) => 
                      handleNestedFieldSelect(sectionIndex, nestedIndex, fieldIndex, e)
                    }
                    onRemoveNestedField={(nestedIndex, fieldIndex, e) => 
                      removeNestedField(sectionIndex, nestedIndex, fieldIndex, e)
                    }
                    recentlyAddedField={recentlyAddedField}
                    onMoveNestedFieldUp={moveNestedFieldUp}
                    onMoveNestedFieldDown={moveNestedFieldDown}
                  >
                    <DroppableArea 
                      id={`section-${sectionIndex}`} 
                      isActive={activeDropSection === sectionIndex}
                    >
                      {section.fields.length === 0 && (
                        <Typography 
                          variant="body2" 
                          color={activeDropSection === sectionIndex ? "primary" : "text.secondary"} 
                          sx={{ 
                            textAlign: 'center',
                            p: 2,
                            fontWeight: activeDropSection === sectionIndex ? 'medium' : 'normal',
                          }}
                        >
                          {activeDropSection === sectionIndex 
                            ? "Drop field here" 
                            : "Drag fields here"}
                        </Typography>
                      )}
                      
                      <SortableContext 
                        items={getFieldIds(sectionIndex)} 
                        strategy={verticalListSortingStrategy}
                      >
                        <FieldDropIndicator 
                          active={
                            dropIndicator?.sectionIndex === sectionIndex && 
                            form.sections[sectionIndex] &&
                            dropIndicator.fieldIndex === 0 && 
                            !dropIndicator.nestedIndex &&
                            section.fields.length > 0
                          } 
                        />
                        
                        {section.fields && section.fields.length > 0 ? section.fields.map((field, fieldIndex) => (
                          <React.Fragment key={`field-container-${sectionIndex}-${fieldIndex}`}>
                            <SortableFieldItem
                              id={`field-${sectionIndex}-${fieldIndex}`}
                              field={field}
                              sectionIndex={sectionIndex}
                              fieldIndex={fieldIndex}
                              isSelected={
                                selectedItem?.type === 'field' && 
                                selectedItem.sectionIndex === sectionIndex && 
                                selectedItem.fieldIndex === fieldIndex
                              }
                              isRecentlyAdded={
                                recentlyAddedField !== null &&
                                recentlyAddedField.sectionIndex === sectionIndex &&
                                recentlyAddedField.fieldIndex === fieldIndex &&
                                recentlyAddedField.nestedIndex === undefined
                              }
                              isFirst={fieldIndex === 0}
                              isLast={fieldIndex === section.fields.length - 1}
                              onSelect={(e) => handleFieldSelect(sectionIndex, fieldIndex, e)}
                              onRemove={(e) => removeField(sectionIndex, fieldIndex, e)}
                              onMoveUp={(e) => moveFieldUp(sectionIndex, fieldIndex, e)}
                              onMoveDown={(e) => moveFieldDown(sectionIndex, fieldIndex, e)}
                            />
                            
                            <FieldDropIndicator 
                              active={
                                dropIndicator?.sectionIndex === sectionIndex && 
                                dropIndicator.fieldIndex === fieldIndex + 1 &&
                                !dropIndicator.nestedIndex
                              } 
                            />
                          </React.Fragment>
                        )) : null}
                      </SortableContext>
                    </DroppableArea>
                  </SortableSection>
                );
              })}
            </SortableContext>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default FormCanvasPanel;

