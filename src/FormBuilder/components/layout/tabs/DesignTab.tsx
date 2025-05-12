import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Divider, 
  useTheme
} from '@mui/material';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from 'react-resizable-panels';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableItem from '../../../../DraggableItem';
import FieldSetup from '../../../../FieldSetup';
import SectionSetup from '../../../../SectionSetup';
import { Field, Form, Section } from '../../../../types';
import DroppableArea from '../../../DroppableArea';
import FieldDropIndicator from '../../../FieldDropIndicator';
import SortableSection from '../../../SortableSection';
import SortableFieldItem from '../../fields/SortableFieldItem';

// ResizeHandle component
const ResizeHandle: React.FC = () => {
  const theme = useTheme();
  
  return (
    <PanelResizeHandle>
      <Box
        sx={{
          width: '4px',
          height: '100%',
          backgroundColor: theme.palette.divider,
          cursor: 'col-resize',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
          },
          '&:active': {
            backgroundColor: theme.palette.primary.main,
          },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            width: '2px',
            height: '20px',
            backgroundColor: theme.palette.action.active,
            opacity: 0.5,
            borderRadius: '1px',
            '&:hover': {
              opacity: 0.8,
            }
          }}
        />
      </Box>
    </PanelResizeHandle>
  );
};

interface DesignTabProps {
  form: Form;
  panelSizes: number[];
  setPanelSizes: (sizes: number[]) => void;
  fieldTypes: Field['type'][];
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
  getAvailableFieldsForSection: (sectionIndex: number) => Array<{ name: string; label?: string; parentSection?: string; nestedSection?: string; nestedIndex?: number; }>;
  getAvailableFieldsForNestedSection: (sectionIndex: number, nestedIndex: number) => Array<{ name: string; label?: string; parentSection?: string; nestedSection?: string; nestedIndex?: number; }>;
}

const DesignTab: React.FC<DesignTabProps> = ({
  form,
  panelSizes,
  setPanelSizes,
  fieldTypes,
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
  moveNestedFieldDown,
  getAvailableFieldsForSection,
  getAvailableFieldsForNestedSection
}) => {
  const theme = useTheme();

  return (
    <PanelGroup 
      direction="horizontal" 
      style={{ height: '100%', overflow: 'hidden' }}
      onLayout={(sizes) => {
        setPanelSizes(sizes);
        localStorage.setItem('formBuilderPanelSizes', JSON.stringify(sizes));
      }}
    >
      {/* Left panel - Components */}
      <Panel defaultSize={panelSizes[0]} minSize={10} maxSize={20}>
        <Paper 
          elevation={3} 
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
          }}
        >
          <Box sx={{ p: 1.5, flexShrink: 0 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Components</Typography>
            <Divider sx={{ mb: 1 }} />
          </Box>
          <Box sx={{ 
            p: 1.5, 
            overflowY: 'auto', // Scrollable content
            flex: 1 
          }}>
            <Typography variant="caption" sx={{ mb: 0.5, color: theme.palette.text.secondary, display: 'block' }}>
              FORM ELEMENTS
            </Typography>
            
            {/* Draggable field types */}
            {fieldTypes.map((type) => (
              <DraggableItem key={type} type="FIELD" name={type} />
            ))}
            
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ mb: 0.5, color: theme.palette.text.secondary, display: 'block' }}>
              STRUCTURE
            </Typography>
            <Button 
              variant="outlined" 
              onClick={addSection} 
              sx={{ mt: 0.5, width: '100%' }}
              color="primary"
              size="small"
            >
              Add Section
            </Button>
          </Box>
        </Paper>
      </Panel>

      <ResizeHandle />

      {/* Middle panel - Form Canvas - The key one that needs scrolling */}
      <Panel defaultSize={panelSizes[1]} minSize={30}>
        <Box sx={{ 
          height: '100%', 
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.grey[50],
          overflow: 'hidden', // No overflow at this level
        }}>
          <Box sx={{
            flex: 1,
            overflowY: 'auto', // Add scroll here
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
                    if (!section) return null; // Skip rendering non-existent sections
                    
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
                        {/* Sortable droppable area for each section */}
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
                                fontWeight:activeDropSection === sectionIndex ? 'medium' : 'normal',
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
                            {/* First position drop indicator */}
                            <FieldDropIndicator 
                              active={
                                dropIndicator?.sectionIndex === sectionIndex && 
                                form.sections[sectionIndex] && // Add this check
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
                                
                                {/* After each field drop indicator */}
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
      </Panel>
      
      <ResizeHandle />

      {/* Right panel - Properties */}
      <Panel defaultSize={panelSizes[2]} minSize={15} maxSize={40}>
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
          <Box sx={{ p: 1.5, flex: 1, overflowY: 'auto' }}> {/* Add scroll here */}
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
                      // Create a copy of the nested fields array
                      const newNestedFields = [
                        ...newSections[nestedFieldItem.sectionIndex].nestedSections![nestedFieldItem.nestedIndex].fields
                      ];
                      // Update the specific field
                      newNestedFields[nestedFieldItem.fieldIndex] = updatedField;
                      // Update the nested section's fields
                      newSections[nestedFieldItem.sectionIndex].nestedSections![nestedFieldItem.nestedIndex].fields = newNestedFields;
                      updateSection(nestedFieldItem.sectionIndex, newSections[nestedFieldItem.sectionIndex]);
                    }
                  }}
                />
              );
            })()}
          </Box>
        </Paper>
      </Panel>
    </PanelGroup>
  );
};

export default DesignTab;
