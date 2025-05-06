import React, { useState, ReactNode, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  useSensor, 
  useSensors, 
  PointerSensor,
  closestCenter,
  DragStartEvent,
  DragOverlay,
  DragOverEvent
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  useTheme, 
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from 'react-resizable-panels';
import DraggableItem from './DraggableItem';
import FieldSetup from './FieldSetup';
import SectionSetup from './SectionSetup';
import FormRenderer from './FormRenderer';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { Field, Form, GridField, Section, DropdownField, RadioField,NumberField, CheckboxField, TextField as TextFieldType} from './types';
import { formatNameToLabel } from './utils';
const fieldTypes: Field['type'][] = ['text', 'number', 'dropdown', 'radio', 'textarea', 'password', 'checkbox', 'grid'];

// Interface for DroppableArea props
interface DroppableAreaProps {
  id: string;
  children: ReactNode;
  isActive: boolean;
  onDragOver?: (e: React.DragEvent) => void;
}

// Simple droppable wrapper
const DroppableArea: React.FC<DroppableAreaProps> = ({ id, children, isActive, onDragOver }) => {
  const { setNodeRef } = useDroppable({ id });
  const theme = useTheme();
  
  return (
    <Box 
      ref={setNodeRef}
      sx={{ 
        minHeight: '50px',
        border: isActive ? `2px dashed ${theme.palette.primary.main}` : `1px dashed ${theme.palette.divider}`,
        borderRadius: '4px',
        p: 1,
        backgroundColor: isActive ? `${theme.palette.primary.light}20` : 'transparent',
        transition: 'all 0.2s',
        position: 'relative'
      }}
      onDragOver={onDragOver}
    >
      {isActive && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            backgroundColor: `${theme.palette.primary.main}10`,
            borderRadius: '4px',
            zIndex: 1
          }}
        />
      )}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

// Sortable Field Item component
interface SortableFieldItemProps {
  field: Field;
  id: string;
  sectionIndex: number;
  fieldIndex: number;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onRemove: (e: React.MouseEvent) => void;
}

const SortableFieldItem: React.FC<SortableFieldItemProps> = ({ 
  field, 
  id,
  sectionIndex, 
  fieldIndex, 
  isSelected, 
  onSelect,
  onRemove 
}) => {
  const theme = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  // Fix: Correctly type style object for React
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <Paper
      id={id}
      ref={setNodeRef}
      elevation={isDragging ? 4 : 1}
      sx={{
        p: 1,
        my: 0.5,
        cursor: 'pointer',
        borderRadius: '4px',
        position: 'relative', 
        border: isSelected
          ? `2px solid ${theme.palette.secondary.main}`
          : isDragging 
            ? `2px solid ${theme.palette.primary.main}` 
            : '1px solid #e0e0e0',
        '&:hover': {
          backgroundColor: theme.palette.action.hover
        },
        boxShadow: isDragging ? theme.shadows[8] : undefined
      }}
      style={style}
      onClick={onSelect}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <IconButton 
            size="small" 
            color="default"
            {...attributes}
            {...listeners}
            sx={{ 
              mr: 1, 
              cursor: 'grab',
              '&:active': { cursor: 'grabbing' },
              color: isDragging ? theme.palette.primary.main : 'inherit'
            }}
          >
            <DragIndicatorIcon fontSize="small" />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <Typography 
              variant="body2" 
              noWrap 
              sx={{ 
                maxWidth: '140px',
                fontWeight: isDragging ? 'medium' : 'normal'
              }}
            >
              {field.label}
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
              ({field.type})
            </Typography>
          </Box>
        </Box>
        <IconButton 
          size="small" 
          color="error"
          onClick={onRemove}
          sx={{ 
            opacity: 0.6,
            '&:hover': { opacity: 1 }
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};

// Add this component inside your file, before the Playground component
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

// Create a SortableSection component (add this before the Playground component)// Update interface SortableSectionProps
interface SortableSectionProps {
  section: Section;
  id: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onMoveUp: (e: React.MouseEvent) => void;
  onMoveDown: (e: React.MouseEvent) => void;
  onUpdateSection: (updatedSection: Section) => void;
  onNestedSectionUp: (nestedIndex: number, e: React.MouseEvent) => void;
  onNestedSectionDown: (nestedIndex: number, e: React.MouseEvent) => void;
  onDeleteNestedSection: (nestedIndex: number, e: React.MouseEvent) => void;
  children: React.ReactNode;
  activeDropSection: number | string | null; // Update to accept string
  activeField: {field: Field; id: string; sectionIndex: number} | null;
  selectedItem: any; // The currently selected item
  onNestedSectionSelect: (nestedIndex: number) => void; // Handler for nested section selection
  getNestedFieldIds: (sectionIndex: number, nestedIndex: number) => string[];
  onNestedFieldSelect: (nestedIndex: number, fieldIndex: number, e: React.MouseEvent) => void;
  onRemoveNestedField: (nestedIndex: number, fieldIndex: number, e: React.MouseEvent) => void;
}

const SortableSection: React.FC<SortableSectionProps> = ({ 
  section, 
  id,
  index,
  isSelected, 
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  children,
  activeDropSection,
  activeField,
  onUpdateSection,
  onNestedSectionUp,
  onNestedSectionDown,
  onDeleteNestedSection,
  selectedItem,
  onNestedSectionSelect,
  getNestedFieldIds,
  onNestedFieldSelect,
  onRemoveNestedField
}) => {
  const theme = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const handleAddNestedSectionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent section selection
    
    const newNestedSection: Section = {
      id: `section_${Date.now()}`,
      name: `Sub-section ${(section.nestedSections?.length || 0) + 1}`,
      objectName: '',
      fields: [],
      isSubSection: true,
      parentId: section.id,
      nestedSections: []
    };
  
    const updatedSection = {
      ...section,
      nestedSections: section.nestedSections ? 
        [...section.nestedSections, newNestedSection] : 
        [newNestedSection]
    };
    
    onUpdateSection(updatedSection);
  };

  const renderNestedSections = () => {
    if (!section.nestedSections || section.nestedSections.length === 0) {
      return null;
    }
    
    return (
      <Box sx={{ ml: 3, mt: 1, pl: 2, borderLeft: '2px solid rgba(0,0,0,0.1)' }}>
        {section.nestedSections.map((nestedSection, nestedIndex) => (
          <Box 
            key={nestedSection.id || `nested-section-${nestedIndex}`}
            sx={{ 
              mb: 1, 
              p: 1, 
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
              border: '1px solid #e0e0e0',
              cursor: 'pointer',
              // Highlight when selected
              outline: isSelected && selectedItem?.type === 'nestedSection' && 
                       selectedItem.nestedIndex === nestedIndex ? 
                       `2px solid ${theme.palette.secondary.main}` : 'none'
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent parent section selection
              onNestedSectionSelect(nestedIndex);
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2">
                {nestedSection.name || `Sub-section ${nestedIndex + 1}`}
              </Typography>
              <Box>
                <IconButton 
                  size="small" 
                  onClick={(e) => onNestedSectionUp(nestedIndex, e)}
                  disabled={nestedIndex === 0}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={(e) => onNestedSectionDown(nestedIndex, e)}
                  disabled={section.nestedSections && nestedIndex === section.nestedSections.length - 1}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small"
                  color="error"
                  onClick={(e) => onDeleteNestedSection(nestedIndex, e)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            {/* Add a droppable area for fields within nested section */}
            <DroppableArea 
              id={`nested-${index}-${nestedIndex}`} 
              isActive={typeof activeDropSection === 'string' && 
              activeDropSection === `nested-${index}-${nestedIndex}`}
            >
              {nestedSection.fields.length === 0 ? (
                <Typography 
                  variant="body2" 
                  color={(typeof activeDropSection === 'string' && 
                    activeDropSection === `nested-${index}-${nestedIndex}`) 
                    ? "primary" : "text.secondary"} 
                  sx={{ 
                    textAlign: 'center',
                    p: 1,
                    fontSize: '0.8rem',
                    fontWeight: (typeof activeDropSection === 'string' && 
                      activeDropSection === `nested-${index}-${nestedIndex}`) 
                      ? 'medium' : 'normal',
                    backgroundColor: (typeof activeDropSection === 'string' && 
                        activeDropSection === `nested-${index}-${nestedIndex}`) 
                        ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    borderRadius: '4px'
                  }}
                >
                  {(typeof activeDropSection === 'string' && 
                    activeDropSection === `nested-${index}-${nestedIndex}`)
                    ? "Drop field here" 
                    : "Drag fields here"}
                </Typography>
              ) : (
                <SortableContext 
                  items={getNestedFieldIds(index, nestedIndex)} 
                  strategy={verticalListSortingStrategy}
                >
                  {nestedSection.fields.map((field, fieldIndex) => (
                    <SortableFieldItem
                      key={`nested-field-${index}-${nestedIndex}-${fieldIndex}`}
                      id={`nested-field-${index}-${nestedIndex}-${fieldIndex}`}
                      field={field}
                      sectionIndex={index}
                      fieldIndex={fieldIndex}
                      isSelected={
                        selectedItem?.type === 'nestedField' && 
                        selectedItem.sectionIndex === index && 
                        selectedItem.nestedIndex === nestedIndex &&
                        selectedItem.fieldIndex === fieldIndex
                      }
                      onSelect={(e) => onNestedFieldSelect(nestedIndex, fieldIndex, e)}
                      onRemove={(e) => onRemoveNestedField(nestedIndex, fieldIndex, e)}
                    />
                  ))}
                </SortableContext>
              )}
            </DroppableArea>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Paper
      id={id}
      ref={setNodeRef}
      elevation={2}
      sx={{ 
        p: 1.5, 
        mb: 2, 
        cursor: 'pointer',
        borderRadius: '8px',
        border: isSelected
          ? `2px solid ${theme.palette.primary.main}`
          : isDragging 
            ? `2px solid ${theme.palette.primary.main}` 
            : 'none',
        transition: 'all 0.2s',
        backgroundColor: activeDropSection === index && !activeField?.id.startsWith(`field-${index}`)
          ? `${theme.palette.background.paper}` 
          : theme.palette.background.paper,
        boxShadow: isDragging 
          ? theme.shadows[6]
          : activeDropSection === index && !activeField?.id.startsWith(`field-${index}`)
            ? '0 0 0 2px rgba(25, 118, 210, 0.3)' 
            : undefined
      }}
      style={style}
      onClick={onSelect}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            size="small" 
            color="default"
            {...attributes}
            {...listeners}
            sx={{ 
              mr: 1, 
              cursor: 'grab',
              '&:active': { cursor: 'grabbing' },
              color: isDragging ? theme.palette.primary.main : 'inherit'
            }}
          >
            <DragIndicatorIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" fontWeight="medium">
            {section.name} 
            {activeDropSection === index && activeField && 
              activeField.sectionIndex !== index && (
                <Typography component="span" color="primary.main" sx={{ ml: 1, fontWeight: 'bold' }}>
                  (Drop Target)
                </Typography>
              )
            }
          </Typography>
        </Box>
        
        <Box>
          <Tooltip title="Move section up">
            <span>
              <IconButton 
                size="small"
                onClick={onMoveUp}
                disabled={index === 0}
                sx={{ opacity: index === 0 ? 0.3 : 0.7, '&:hover': { opacity: 1 } }}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Move section down">
            <span>
              <IconButton 
                size="small"
                onClick={onMoveDown}
                disabled={false} // This will be set by the parent based on whether it's the last section
                sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          
          <IconButton 
            size="small" 
            color="error"
            onClick={onDelete}
            sx={{ 
              opacity: 0.6,
              '&:hover': { opacity: 1 },
              ml: 0.5
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      {children}

      <Button
        variant="outlined"
        size="small"
        startIcon={<AddIcon />}
        onClick={handleAddNestedSectionClick}
        sx={{ mt: 1, alignSelf: 'flex-start' }}
      >
        Add Nested Section
      </Button>

      {renderNestedSections()}
    </Paper>
  );
};

const Playground: React.FC = () => {
  const theme = useTheme();
  const [form, setForm] = useState<Form>({ sections: [] });
  const [selectedItem, setSelectedItem] = useState<
    | { type: 'field'; sectionIndex: number; fieldIndex: number }
    | { type: 'section'; index: number }
    | { type: 'nestedSection'; sectionIndex: number; nestedIndex: number }
    | { type: 'nestedField'; sectionIndex: number; nestedIndex: number; fieldIndex: number }
    | null
  >(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [activeDropSection, setActiveDropSection] = useState<number | string | null>(null);
  const [activeField, setActiveField] = useState<{field: Field; id: string; sectionIndex: number} | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{sectionIndex: number; fieldIndex: number; nestedIndex?: number} | null>(null);
  
  // State for delete section confirmation dialog
  const [deleteSectionDialog, setDeleteSectionDialog] = useState<{open: boolean, sectionIndex: number | null}>({
    open: false,
    sectionIndex: null
  });

  // Add these states near your other state declarations
  const [panelSizes, setPanelSizes] = useState<number[]>([15, 60, 25]);

  // Add this effect to load saved panel sizes
  useEffect(() => {
    const savedSizes = localStorage.getItem('formBuilderPanelSizes');
    if (savedSizes) {
      try {
        const sizes = JSON.parse(savedSizes);
        if (Array.isArray(sizes) && sizes.length === 3) {
          setPanelSizes(sizes);
        }
      } catch (e) {
        console.error('Error loading saved panel sizes:', e);
      }
    }
  }, []);
  
  // Force re-render when a field is selected to ensure properties update
  const [, forceUpdate] = useState({});
  useEffect(() => {
    // This will re-render the component when selectedItem changes
    if (selectedItem) {
      forceUpdate({});
    }
  }, [selectedItem]);
  
  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px minimum drag distance
      },
    })
  );
  
  // Form actions
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections, 
        { 
          id: `section_${Date.now()}`,
          name: `Section ${prev.sections.length + 1}`, 
          objectName: '',
          fields: [],
          nestedSections: []
        }
      ],
    }));
  };

  const removeSection = (sectionIndex: number) => {
    setForm((prev) => {
      const newSections = [...prev.sections];
      newSections.splice(sectionIndex, 1);
      return { ...prev, sections: newSections };
    });
    
    // If the removed section was selected, clear the selection
    if (selectedItem?.type === 'section' && selectedItem.index === sectionIndex) {
      setSelectedItem(null);
    }
    
    // If any field in the removed section was selected, clear the selection
    if (selectedItem?.type === 'field' && selectedItem.sectionIndex === sectionIndex) {
      setSelectedItem(null);
    }
  };

  const handleDeleteSectionClick = (sectionIndex: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent section selection
    setDeleteSectionDialog({
      open: true,
      sectionIndex
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteSectionDialog({
      open: false,
      sectionIndex: null
    });
  };

  const confirmDeleteSection = () => {
    if (deleteSectionDialog.sectionIndex !== null) {
      removeSection(deleteSectionDialog.sectionIndex);
    }
    handleCloseDeleteDialog();
  };

  const updateField = (sectionIndex: number, fieldIndex: number, updatedField: Field) => {
    setForm((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].fields[fieldIndex] = updatedField;
      return { ...prev, sections: newSections };
    });
  };

  const removeField = (sectionIndex: number, fieldIndex: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering selection
    setForm((prev) => {
      const newSections = [...prev.sections];
      // Remove the field at the specified index
      newSections[sectionIndex].fields = newSections[sectionIndex].fields.filter((_, idx) => idx !== fieldIndex);
      return { ...prev, sections: newSections };
    });
    
    // If the removed field was selected, clear the selection
    if (selectedItem?.type === 'field' && 
        selectedItem.sectionIndex === sectionIndex && 
        selectedItem.fieldIndex === fieldIndex) {
      setSelectedItem(null);
    }
  };

  const updateSection = (index: number, updatedSection: Section) => {
    setForm((prev) => {
      const newSections = [...prev.sections];
      newSections[index] = updatedSection;
      return { ...prev, sections: newSections };
    });
  };
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id.toString();
    
    // Check if this is a sortable field being dragged
    if (activeId.startsWith('field-')) {
      const [, sectionIdx, fieldIdx] = activeId.split('-').map(Number);
      
      if (!isNaN(sectionIdx) && !isNaN(fieldIdx) && form.sections[sectionIdx]?.fields[fieldIdx]) {
        const field = form.sections[sectionIdx].fields[fieldIdx];
        setActiveField({ field, id: activeId, sectionIndex: sectionIdx });
        setActiveDropSection(sectionIdx); // Initially set the active section to the source section
      }
    } 
    // Check if this is a section being dragged
    else if (activeId.startsWith('section-sortable-')) {
      console.log('Section drag started:', activeId);
      // You can add section-specific drag start logic here if needed
    }
    else {
      // For new fields from the sidebar
      console.log('Drag started (new field):', event);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // For new field components being dragged
    if (active.data.current?.type === 'FIELD') {
      if (overId.startsWith('section-')) {
        const sectionIndex = parseInt(overId.split('-')[1], 10);
        if (!isNaN(sectionIndex)) {
          setActiveDropSection(sectionIndex);
          // Check if there are any fields to determine where to show the indicator
          if (form.sections[sectionIndex].fields.length === 0) {
            // If empty section, show at position 0
            setDropIndicator({ sectionIndex, fieldIndex: 0 });
          } else {
            // For section with fields, decide based on the mouse position
            // If the mouse is in the top half of the section, drop at the beginning
            // Otherwise, drop at the end
            if (event.activatorEvent && event.activatorEvent instanceof MouseEvent) {
              const sectionElement = document.getElementById(overId);
              if (sectionElement) {
                const rect = sectionElement.getBoundingClientRect();
                const mouseY = event.activatorEvent.clientY;
                const topThreshold = rect.top + 30; // Approximately top area of section
                const bottomThreshold = rect.bottom - 30; // Approximately bottom area of section
                
                if (mouseY < topThreshold) {
                  // Near the top, show indicator at position 0
                  setDropIndicator({ sectionIndex, fieldIndex: 0 });
                } else if (mouseY > bottomThreshold) {
                  // Near the bottom, show indicator at end
                  setDropIndicator({ sectionIndex, fieldIndex: form.sections[sectionIndex].fields.length });
                } else {
                  // In the middle, try to find nearest field
                  // Default to end if can't determine
                  setDropIndicator({ sectionIndex, fieldIndex: form.sections[sectionIndex].fields.length });
                }
              } else {
                // Default to end of section
                setDropIndicator({ sectionIndex, fieldIndex: form.sections[sectionIndex].fields.length });
              }
            } else {
              // Default to end of section
              setDropIndicator({ sectionIndex, fieldIndex: form.sections[sectionIndex].fields.length });
            }
          }
        }
      } else if (overId.startsWith('field-')) {
        const [, sectionIdx, fieldIdx] = overId.split('-').map(Number);
        if (!isNaN(sectionIdx) && !isNaN(fieldIdx)) {
          setActiveDropSection(sectionIdx);
          
          // Calculate position based on mouse location relative to the field
          if (event.activatorEvent && event.activatorEvent instanceof MouseEvent) {
            const fieldElement = document.getElementById(overId);
            if (fieldElement) {
              const rect = fieldElement.getBoundingClientRect();
              const mouseY = event.activatorEvent.clientY;
              const threshold = rect.top + rect.height / 2;
              
              // If mouse position is above the threshold, insert before the field
              // Otherwise, insert after the field
              setDropIndicator({ 
                sectionIndex: sectionIdx, 
                fieldIndex: mouseY < threshold ? fieldIdx : fieldIdx + 1 
              });
            } else {
              // Fallback to insert after
              setDropIndicator({ sectionIndex: sectionIdx, fieldIndex: fieldIdx + 1 });
            }
          } else {
            // Fallback to insert after
            setDropIndicator({ sectionIndex: sectionIdx, fieldIndex: fieldIdx + 1 });
          }
        }
      }
    } else if (activeId.startsWith('field-')) {
      // For existing fields being reordered
      if (overId.startsWith('section-')) {
        const sectionIndex = parseInt(overId.split('-')[1], 10);
        if (!isNaN(sectionIndex)) {
          setActiveDropSection(sectionIndex);
          // If dropping into an empty section, set drop indicator to beginning of that section
          if (form.sections[sectionIndex].fields.length === 0) {
            setDropIndicator({ sectionIndex, fieldIndex: 0 });
          } else {
            // When hovering over a section (not a specific field),
            // show indicator at the end of the section
            setDropIndicator({ 
              sectionIndex, 
              fieldIndex: form.sections[sectionIndex].fields.length 
            });
          }
        }
      } else if (overId.startsWith('field-')) {
        const [, sectionIdx, fieldIdx] = overId.split('-').map(Number);
        if (!isNaN(sectionIdx) && !isNaN(fieldIdx)) {
          setActiveDropSection(sectionIdx);
          
          // Calculate if we're in the top half or bottom half of the field
          // to determine if we should insert before or after it
          if (event.activatorEvent && event.activatorEvent instanceof MouseEvent) {
            const targetElement = document.getElementById(overId);
            if (targetElement) {
              const rect = targetElement.getBoundingClientRect();
              const mouseY = event.activatorEvent.clientY;
              const threshold = rect.top + rect.height / 2;
              
              // If mouse position is above the threshold, insert before the field
              // Otherwise, insert after the field
              setDropIndicator({ 
                sectionIndex: sectionIdx, 
                fieldIndex: mouseY < threshold ? fieldIdx : fieldIdx + 1 
              });
            } else {
              // Fallback if we can't get element dimensions
              setDropIndicator({ sectionIndex: sectionIdx, fieldIndex: fieldIdx });
            }
          } else {
            // Fallback for non-mouse events
            setDropIndicator({ sectionIndex: sectionIdx, fieldIndex: fieldIdx });
          }
        }
      }
    }
    if (overId.startsWith('nested-')) {
      const parts = overId.split('-');
      const sectionIndex = parseInt(parts[1], 10);
      const nestedIndex = parseInt(parts[2], 10);
      
      if (!isNaN(sectionIndex) && !isNaN(nestedIndex)) {
        setActiveDropSection(`nested-${sectionIndex}-${nestedIndex}`);
        setDropIndicator({ 
          sectionIndex,
          nestedIndex,
          fieldIndex: form.sections[sectionIndex]?.nestedSections?.[nestedIndex]?.fields.length || 0 
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDropSection(null);
    setActiveField(null);
    
    // Save the drop indicator position before clearing it
    const finalDropIndicator = dropIndicator;
    setDropIndicator(null);
    
    if (!over) {
      console.log('No valid drop target');
      return;
    }
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Case 1: Dragging a new field from sidebar to a section
    if (active.data.current?.type === 'FIELD') {
      const fieldType = active.data.current.name as Field['type'];
      
      if (finalDropIndicator) {
        // Use the drop indicator if available
        handleDropField(
          finalDropIndicator.sectionIndex, 
          fieldType, 
          finalDropIndicator.fieldIndex,
          finalDropIndicator.nestedIndex  // Add this line to pass the nestedIndex
        );
        return;
      } else if (overId.startsWith('section-')) {
        // Fallback to dropping at the end of the section
        const sectionIndex = parseInt(overId.split('-')[1], 10);
        if (!isNaN(sectionIndex)) {
          handleDropField(sectionIndex, fieldType);
        }
      } else if (overId.startsWith('nested-')) {
        // Add this case for direct drops on nested sections without indicator
        const parts = overId.split('-');
        const sectionIndex = parseInt(parts[1], 10);
        const nestedIndex = parseInt(parts[2], 10);
        
        if (!isNaN(sectionIndex) && !isNaN(nestedIndex)) {
          handleDropField(
            sectionIndex,
            fieldType,
            -1, // Add at the end
            nestedIndex
          );
        }
      }
      return;
    }
    
    // Case 2: Reordering existing fields
    if (activeId.startsWith('field-') && finalDropIndicator) {
      const [, fromSectionIdx, fromFieldIdx] = activeId.split('-').map(Number);
      const toSectionIdx = finalDropIndicator.sectionIndex;
      const toFieldIdx = finalDropIndicator.fieldIndex;
      
      // Skip if indices are invalid
      if (isNaN(fromSectionIdx) || isNaN(fromFieldIdx) || isNaN(toSectionIdx) || isNaN(toFieldIdx)) {
        return;
      }
      
      // Adjust the index if moving within the same section and moving to a later position
      let adjustedToFieldIdx = toFieldIdx;
      if (fromSectionIdx === toSectionIdx && fromFieldIdx < toFieldIdx) {
        adjustedToFieldIdx -= 1;
      }
      
      setForm(prev => {
        const newSections = [...prev.sections];
        
        // Get the field to move
        const [fieldToMove] = newSections[fromSectionIdx].fields.splice(fromFieldIdx, 1);
        
        // Insert at the adjusted position
        // If the field is moved to the end, adjust the index
        const targetIndex = adjustedToFieldIdx > newSections[toSectionIdx].fields.length 
          ? newSections[toSectionIdx].fields.length 
          : adjustedToFieldIdx;
        
        newSections[toSectionIdx].fields.splice(targetIndex, 0, fieldToMove);
        
        return { ...prev, sections: newSections };
      });
      
      // Update selection if needed
      if (selectedItem?.type === 'field' && 
          selectedItem.sectionIndex === fromSectionIdx && 
          selectedItem.fieldIndex === fromFieldIdx) {
        
        setSelectedItem({ 
          type: 'field', 
          sectionIndex: toSectionIdx, 
          fieldIndex: adjustedToFieldIdx > form.sections[toSectionIdx].fields.length 
            ? form.sections[toSectionIdx].fields.length 
            : adjustedToFieldIdx 
        });
      }
      return;
    }

    // Case 3: Reordering sections
    if (activeId.startsWith('section-sortable-') && overId.startsWith('section-sortable-')) {
      const fromSectionIdx = parseInt(activeId.split('-')[2], 10);
      const toSectionIdx = parseInt(overId.split('-')[2], 10);
      
      if (isNaN(fromSectionIdx) || isNaN(toSectionIdx) || fromSectionIdx === toSectionIdx) {
        return;
      }
      
      setForm(prev => {
        const newSections = [...prev.sections];
        const [movedSection] = newSections.splice(fromSectionIdx, 1);
        newSections.splice(toSectionIdx, 0, movedSection);
        return { ...prev, sections: newSections };
      });
      
      // Update selection if needed
      if (selectedItem?.type === 'section' && selectedItem.index === fromSectionIdx) {
        setSelectedItem({ type: 'section', index: toSectionIdx });
      } else if (selectedItem?.type === 'field' && selectedItem.sectionIndex === fromSectionIdx) {
        setSelectedItem({ 
          type: 'field', 
          sectionIndex: toSectionIdx, 
          fieldIndex: selectedItem.fieldIndex 
        });
      }
      
      // Additional adjustments to field selection if sections between fromSectionIdx and toSectionIdx shifted
      if (selectedItem?.type === 'section') {
        if (fromSectionIdx < toSectionIdx) {
          // Moving section down
          if (selectedItem.index > fromSectionIdx && selectedItem.index <= toSectionIdx) {
            setSelectedItem({ type: 'section', index: selectedItem.index - 1 });
          }
        } else {
          // Moving section up
          if (selectedItem.index >= toSectionIdx && selectedItem.index < fromSectionIdx) {
            setSelectedItem({ type: 'section', index: selectedItem.index + 1 });
          }
        }
      } else if (selectedItem?.type === 'field') {
        if (fromSectionIdx < toSectionIdx) {
          // Moving section down
          if (selectedItem.sectionIndex > fromSectionIdx && selectedItem.sectionIndex <= toSectionIdx) {
            setSelectedItem({ 
              type: 'field', 
              sectionIndex: selectedItem.sectionIndex - 1, 
              fieldIndex: selectedItem.fieldIndex 
            });
          }
        } else {
          // Moving section up
          if (selectedItem.sectionIndex >= toSectionIdx && selectedItem.sectionIndex < fromSectionIdx) {
            setSelectedItem({ 
              type: 'field', 
              sectionIndex: selectedItem.sectionIndex + 1, 
              fieldIndex: selectedItem.fieldIndex 
            });
          }
        }
      }
    }
  };

  // Fix: Direct handler for field selection to prevent event bubbling issues
  const handleFieldSelect = (sectionIndex: number, fieldIndex: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering section selection
    console.log(`Selecting field at section ${sectionIndex}, field ${fieldIndex}`);
    setSelectedItem({ type: 'field', sectionIndex, fieldIndex });
  };

  // Sample handlers for file operations
  const handleSave = () => {
    alert('Save functionality would save this form configuration');
    console.log(JSON.stringify(form, null, 2));
  };

  const handleOpen = () => {
  // Define the sample configuration with properly typed fields
  const sampleConfig: Form = {
    "sections": [
      {
        "id": `section_${Date.now()}`, // Add unique ID
        "name": "User Details",
        "objectName": "userDetails", // Add object name
        "fields": [],
        "nestedSections": [] // Add empty nestedSections array
      }
    ]
  };
  
  setForm(sampleConfig);
};

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        const parsedForm = JSON.parse(fileContent) as Form;
        setForm(parsedForm);
      } catch (error) {
        console.error('Error parsing config file:', error);
        setConfigError('Invalid configuration file format');
      }
    };
    reader.readAsText(file);
    
    // Reset file input value so the same file can be loaded again if needed
    event.target.value = '';
  };
  
  const handleSaveFile = () => {
    const formJson = JSON.stringify(form, null, 2);
    const blob = new Blob([formJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'form-config.json';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate unique IDs for sortable fields
  const getFieldIds = (sectionIndex: number) => {
    return form.sections[sectionIndex].fields.map((_, fieldIndex) => 
      `field-${sectionIndex}-${fieldIndex}`
    );
  };

  const getSectionIds = () => {
    return form.sections.map((_, index) => `section-sortable-${index}`);
  };

  const moveSectionUp = (sectionIndex: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent section selection
    
    if (sectionIndex > 0) {
      setForm(prev => {
        const newSections = [...prev.sections];
        // Swap the section with the one above it
        [newSections[sectionIndex - 1], newSections[sectionIndex]] = 
          [newSections[sectionIndex], newSections[sectionIndex - 1]];
        return { ...prev, sections: newSections };
      });
      
      // Update selection if this section was selected
      if (selectedItem?.type === 'section' && selectedItem.index === sectionIndex) {
        setSelectedItem({ type: 'section', index: sectionIndex - 1 });
      } 
      // Update selection if the section above was selected
      else if (selectedItem?.type === 'section' && selectedItem.index === sectionIndex - 1) {
        setSelectedItem({ type: 'section', index: sectionIndex });
      }
      // Update field selection if any field in this section was selected
      else if (selectedItem?.type === 'field' && selectedItem.sectionIndex === sectionIndex) {
        setSelectedItem({ 
          type: 'field', 
          sectionIndex: sectionIndex - 1, 
          fieldIndex: selectedItem.fieldIndex 
        });
      }
      // Update field selection if any field in the section above was selected
      else if (selectedItem?.type === 'field' && selectedItem.sectionIndex === sectionIndex - 1) {
        setSelectedItem({ 
          type: 'field', 
          sectionIndex: sectionIndex, 
          fieldIndex: selectedItem.fieldIndex 
        });
      }
    }
  };
  
  const moveSectionDown = (sectionIndex: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent section selection
    
    if (sectionIndex < form.sections.length - 1) {
      setForm(prev => {
        const newSections = [...prev.sections];
        // Swap the section with the one below it
        [newSections[sectionIndex], newSections[sectionIndex + 1]] = 
          [newSections[sectionIndex + 1], newSections[sectionIndex]];
        return { ...prev, sections: newSections };
      });
      
      // Update selection if this section was selected
      if (selectedItem?.type === 'section' && selectedItem.index === sectionIndex) {
        setSelectedItem({ type: 'section', index: sectionIndex + 1 });
      } 
      // Update selection if the section below was selected
      else if (selectedItem?.type === 'section' && selectedItem.index === sectionIndex + 1) {
        setSelectedItem({ type: 'section', index: sectionIndex });
      }
      // Update field selection if any field in this section was selected
      else if (selectedItem?.type === 'field' && selectedItem.sectionIndex === sectionIndex) {
        setSelectedItem({ 
          type: 'field', 
          sectionIndex: sectionIndex + 1, 
          fieldIndex: selectedItem.fieldIndex 
        });
      }
      // Update field selection if any field in the section below was selected
      else if (selectedItem?.type === 'field' && selectedItem.sectionIndex === sectionIndex + 1) {
        setSelectedItem({ 
          type: 'field', 
          sectionIndex: sectionIndex, 
          fieldIndex: selectedItem.fieldIndex 
        });
      }
    }
  };

  // Replace the field creation code to handle different field types correctly

  // Create a base field function
  const createBaseField = (name: string, type: Field['type'], label: string) => {
    return {
      name,
      type,
      label,
      placeholder: `Enter ${type} value...`,
      required: false
    };
  };

  // Add this function near your other utility functions
const generateFieldName = (type: Field['type']) => {
  return `${type}_${Date.now()}`;
};

// Then modify the handleAddField function to include a fieldType parameter
const handleAddField = (fieldType: Field['type']) => {
  const fieldName = generateFieldName(fieldType);
  const formattedLabel = formatNameToLabel(fieldName);
  
  let newField: Field;
  
  // Create the field based on type
  if (fieldType === 'grid') {
    // For grid fields, include the required columns property
    newField = {
      ...createBaseField(fieldName, fieldType, formattedLabel),
      columns: [
        { name: 'Item', type: 'text' },
        { name: 'Quantity', type: 'number' }
      ],
      defaultRows: 1
    } as GridField;
  } else if (fieldType === 'dropdown' || fieldType === 'radio') {
    // For dropdown and radio fields, include options
    newField = {
      ...createBaseField(fieldName, fieldType, formattedLabel),
      options: []
    } as (typeof fieldType extends 'dropdown' ? DropdownField : RadioField);
  } else if (fieldType === 'number') {
    newField = {
      ...createBaseField(fieldName, fieldType, formattedLabel),
      required: false
    } as NumberField;
  } else if (fieldType === 'checkbox') {
    newField = {
      ...createBaseField(fieldName, fieldType, formattedLabel),
      required: false
    } as CheckboxField;
  } else {
    // Text, textarea, password
    newField = {
      ...createBaseField(fieldName, fieldType, formattedLabel),
      required: false
    } as TextFieldType;
  }
  
  // Add the field to the current section
  // Since we don't know which section to add to, we need a way to determine that
  // For example, add to the currently selected section or provide a section index
  const sectionIndex = selectedItem?.type === 'section' 
    ? selectedItem.index 
    : (selectedItem?.type === 'field' ? selectedItem.sectionIndex : 0);
  
  if (sectionIndex !== undefined && sectionIndex < form.sections.length) {
    setForm((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].fields.push(newField);
      return { ...prev, sections: newSections };
    });
  }
};

  const handleNestedSectionUp = (sectionIndex: number, nestedIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (nestedIndex === 0) return; // Already at the top
    
    setForm(prev => {
      const newSections = [...prev.sections];
      const section = { ...newSections[sectionIndex] };
      
      if (section.nestedSections && section.nestedSections.length > 1) {
        const newNestedSections = [...section.nestedSections];
        const temp = newNestedSections[nestedIndex];
        newNestedSections[nestedIndex] = newNestedSections[nestedIndex - 1];
        newNestedSections[nestedIndex - 1] = temp;
        
        section.nestedSections = newNestedSections;
        newSections[sectionIndex] = section;
      }
      
      return { ...prev, sections: newSections };
    });
    
    // Update selection if needed
    if (selectedItem?.type === 'nestedSection' && 
        selectedItem.sectionIndex === sectionIndex && 
        selectedItem.nestedIndex === nestedIndex) {
      setSelectedItem({
        ...selectedItem,
        nestedIndex: nestedIndex - 1
      });
    }
  };
  
  const handleNestedSectionDown = (sectionIndex: number, nestedIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setForm(prev => {
      const newSections = [...prev.sections];
      const section = { ...newSections[sectionIndex] };
      
      if (section.nestedSections && nestedIndex < section.nestedSections.length - 1) {
        const newNestedSections = [...section.nestedSections];
        const temp = newNestedSections[nestedIndex];
        newNestedSections[nestedIndex] = newNestedSections[nestedIndex + 1];
        newNestedSections[nestedIndex + 1] = temp;
        
        section.nestedSections = newNestedSections;
        newSections[sectionIndex] = section;
      }
      
      return { ...prev, sections: newSections };
    });
    
    // Update selection if needed
    if (selectedItem?.type === 'nestedSection' && 
        selectedItem.sectionIndex === sectionIndex && 
        selectedItem.nestedIndex === nestedIndex) {
      setSelectedItem({
        ...selectedItem,
        nestedIndex: nestedIndex + 1
      });
    }
  };
  
  const handleDeleteNestedSection = (sectionIndex: number, nestedIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setForm(prev => {
      const newSections = [...prev.sections];
      const section = { ...newSections[sectionIndex] };
      
      if (section.nestedSections) {
        section.nestedSections = section.nestedSections.filter((_, i) => i !== nestedIndex);
        newSections[sectionIndex] = section;
      }
      
      return { ...prev, sections: newSections };
    });
    
    // Clear selection if the deleted section was selected
    if (selectedItem?.type === 'nestedSection' && 
        selectedItem.sectionIndex === sectionIndex && 
        selectedItem.nestedIndex === nestedIndex) {
      setSelectedItem(null);
    }
  };

const handleDropField = (sectionIndex: number, fieldType: Field['type'], position: number = -1, nestedIndex?: number) => {
  const fieldName = generateFieldName(fieldType);
  const formattedLabel = formatNameToLabel(fieldName);
  
  let newField: Field;
  
  // Create the field based on type with proper type assertions
  if (fieldType === 'grid') {
    newField = {
      name: fieldName,
      type: fieldType,
      label: 'Data Grid',
      placeholder: `Enter ${fieldType} value...`,
      required: false,
      columns: [
        { name: 'Item', type: 'text' },
        { name: 'Quantity', type: 'number' }
      ],
      defaultRows: 1
    } as GridField;
  } else if (fieldType === 'dropdown' || fieldType === 'radio') {
    newField = {
      name: fieldName,
      type: fieldType,
      label: formattedLabel,
      placeholder: `Enter ${fieldType} value...`,
      required: false,
      options: []
    } as (typeof fieldType extends 'dropdown' ? DropdownField : RadioField);
  } else if (fieldType === 'number') {
    newField = {
      name: fieldName,
      type: fieldType,
      label: formattedLabel,
      placeholder: `Enter ${fieldType} value...`,
      required: false
    } as NumberField;
  } else if (fieldType === 'checkbox') {
    newField = {
      name: fieldName,
      type: fieldType,
      label: formattedLabel,
      placeholder: `Enter ${fieldType} value...`,
      required: false
    } as CheckboxField;
  } else {
    // Text, textarea, password
    newField = {
      name: fieldName,
      type: fieldType as 'text' | 'textarea' | 'password',
      label: formattedLabel,
      placeholder: `Enter ${fieldType} value...`,
      required: false
    } as TextFieldType;
  }
  
  // Add the field to the current section
  setForm((prev) => {
    const newSections = [...prev.sections];
    
    // Add to a nested section
    if (nestedIndex !== undefined) {
      if (newSections[sectionIndex]?.nestedSections?.[nestedIndex]) {
        const nestedSection = {...newSections[sectionIndex].nestedSections![nestedIndex]};
        
        if (position === -1 || position > nestedSection.fields.length) {
          // Add to the end
          nestedSection.fields = [...nestedSection.fields, newField];
        } else {
          // Insert at specific position
          nestedSection.fields = [
            ...nestedSection.fields.slice(0, position),
            newField,
            ...nestedSection.fields.slice(position)
          ];
        }
        
        const newNestedSections = [...newSections[sectionIndex].nestedSections!];
        newNestedSections[nestedIndex] = nestedSection;
        newSections[sectionIndex] = {
          ...newSections[sectionIndex],
          nestedSections: newNestedSections
        };
      }
    }
    // Add to main section (existing code)
    else {
      if (position === -1 || position > newSections[sectionIndex].fields.length) {
        // Add to the end
        newSections[sectionIndex].fields = [...newSections[sectionIndex].fields, newField];
      } else {
        // Insert at specific position
        newSections[sectionIndex].fields = [
          ...newSections[sectionIndex].fields.slice(0, position),
          newField,
          ...newSections[sectionIndex].fields.slice(position)
        ];
      }
    }
    
    return { ...prev, sections: newSections };
  });
};

const handleNestedSectionSelect = (sectionIndex: number, nestedIndex: number) => {
  setSelectedItem({ 
    type: 'nestedSection', 
    sectionIndex, 
    nestedIndex 
  });
};

const getNestedFieldIds = (sectionIndex: number, nestedIndex: number) => {
  return form.sections[sectionIndex].nestedSections?.[nestedIndex]?.fields.map((_, fieldIndex) => 
    `nested-field-${sectionIndex}-${nestedIndex}-${fieldIndex}`
  ) || [];
};

const handleNestedFieldSelect = (sectionIndex: number, nestedIndex: number, fieldIndex: number, event: React.MouseEvent) => {
  event.stopPropagation(); // Prevent section or nested section selection
  setSelectedItem({ 
    type: 'nestedField', 
    sectionIndex, 
    nestedIndex,
    fieldIndex 
  });
};

const removeNestedField = (sectionIndex: number, nestedIndex: number, fieldIndex: number, event: React.MouseEvent) => {
  event.stopPropagation(); // Prevent selection
  
  setForm(prev => {
    const newSections = [...prev.sections];
    if (newSections[sectionIndex]?.nestedSections?.[nestedIndex]) {
      const newNestedSections = [...newSections[sectionIndex].nestedSections!];
      const newNestedSection = {...newNestedSections[nestedIndex]};
      
      // Remove the field
      newNestedSection.fields = newNestedSection.fields.filter((_, idx) => idx !== fieldIndex);
      newNestedSections[nestedIndex] = newNestedSection;
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        nestedSections: newNestedSections
      };
    }
    return { ...prev, sections: newSections };
  });
  
  // Clear selection if needed
  if (selectedItem?.type === 'nestedField' && 
      selectedItem.sectionIndex === sectionIndex && 
      selectedItem.nestedIndex === nestedIndex &&
      selectedItem.fieldIndex === fieldIndex) {
    setSelectedItem(null);
  }
};

  return (
    <DndContext 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd} 
      sensors={sensors}
      collisionDetection={closestCenter}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        overflow: 'hidden' // Add this to prevent any scrollbars at the root level
      }}>
        {/* Compact App Bar */}
        <AppBar position="static" color="primary">
          <Toolbar variant="dense">
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Form Builder Studio
            </Typography>
            
            {/* Open Sample button */}
            <Button 
              color="inherit" 
              onClick={handleOpen} 
              size="small"
              startIcon={<CloudDownloadIcon />}
              sx={{ mr: 1 }}
            >
              Open Sample
            </Button>
            
            {/* Upload Config button */}
            <input
              accept=".json"
              id="upload-form-config"
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="upload-form-config">
              <Tooltip title="Upload Form Configuration">
                <IconButton 
                  color="inherit" 
                  component="span"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  <FileUploadIcon />
                </IconButton>
              </Tooltip>
            </label>
            
            {/* Save button */}
            <Button 
              color="inherit" 
              onClick={handleSaveFile} 
              size="small"
              startIcon={<SaveIcon />}
            >
              Save
            </Button>
          </Toolbar>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            textColor="inherit" 
            indicatorColor="secondary"
            variant="fullWidth"
          >
            <Tab label="Design" {...a11yProps(0)} />
            <Tab label="Preview" {...a11yProps(1)} />
            <Tab label="JSON" {...a11yProps(2)} />
          </Tabs>
        </AppBar>

        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Design tab content */}
          <TabPanel value={activeTab} index={0}>
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
                          {form.sections.map((section, sectionIndex) => (
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
                                  {/* First position drop indicator */}
                                  {dropIndicator && 
                                  dropIndicator.sectionIndex === sectionIndex && 
                                  dropIndicator.fieldIndex === 0 && 
                                  section.fields.length > 0 && (
                                    <Box
                                      sx={{
                                        width: '100%',
                                        height: '3px',
                                        backgroundColor: theme.palette.primary.main,
                                        mb: 1,
                                        borderRadius: '3px',
                                        transition: 'all 0.2s ease'
                                      }}
                                    />
                                  )}
                                  
                                  {section.fields.map((field, fieldIndex) => (
                                    <React.Fragment key={`field-container-${sectionIndex}-${fieldIndex}`}>
                                      {/* Mid-position drop indicators (not first position) */}
                                      {dropIndicator && 
                                      dropIndicator.sectionIndex === sectionIndex && 
                                      dropIndicator.fieldIndex === fieldIndex && 
                                      fieldIndex > 0 && (
                                        <Box
                                          sx={{
                                            width: '100%',
                                            height: '3px',
                                            backgroundColor: theme.palette.primary.main,
                                            mb: 1,
                                            borderRadius: '3px',
                                            transition: 'all 0.2s ease'
                                          }}
                                        />
                                      )}
                                      
                                      <SortableFieldItem
                                        key={`field-${sectionIndex}-${fieldIndex}`}
                                        id={`field-${sectionIndex}-${fieldIndex}`}
                                        field={field}
                                        sectionIndex={sectionIndex}
                                        fieldIndex={fieldIndex}
                                        isSelected={
                                          selectedItem?.type === 'field' && 
                                          selectedItem.sectionIndex === sectionIndex && 
                                          selectedItem.fieldIndex === fieldIndex
                                        }
                                        onSelect={(e) => handleFieldSelect(sectionIndex, fieldIndex, e)}
                                        onRemove={(e) => removeField(sectionIndex, fieldIndex, e)}
                                      />
                                      
                                      {/* After-position indicators (not last position) */}
                                      {dropIndicator && 
                                      dropIndicator.sectionIndex === sectionIndex && 
                                      dropIndicator.fieldIndex === fieldIndex + 1 &&
                                      fieldIndex < section.fields.length - 1 && (
                                        <Box
                                          sx={{
                                            width: '100%',
                                            height: '3px',
                                            backgroundColor: theme.palette.primary.main,
                                            mt: 1,
                                            borderRadius: '3px',
                                            transition: 'all 0.2s ease'
                                          }}
                                        />
                                      )}
                                    </React.Fragment>
                                  ))}
                                  
                                  {/* Last position drop indicator */}
                                  {dropIndicator && 
                                  dropIndicator.sectionIndex === sectionIndex && 
                                  dropIndicator.fieldIndex === section.fields.length && 
                                  section.fields.length > 0 && (
                                    <Box
                                      sx={{
                                        width: '100%',
                                        height: '3px',
                                        backgroundColor: theme.palette.primary.main,
                                        mt: 1,
                                        borderRadius: '3px',
                                        transition: 'all 0.2s ease'
                                      }}
                                    />
                                  )}
                                </SortableContext>
                              </DroppableArea>
                            </SortableSection>
                          ))}
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
                          key={`section-${sectionItem.index}`}
                          section={form.sections[sectionItem.index]}
                          onUpdate={(updatedSection: Section) => updateSection(sectionItem.index, updatedSection)}
                          availableFields={form.sections
                            .slice(0, sectionItem.index)
                            .flatMap((s) => s.fields.map((f) => f.name))}
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
                          section={nestedSection}
                          onUpdate={(updatedSection: Section) => {
                            setForm(prev => {
                              const newSections = [...prev.sections];
                              if (newSections[nestedSectionItem.sectionIndex]?.nestedSections) {
                                const newNestedSections = [...newSections[nestedSectionItem.sectionIndex].nestedSections!];
                                newNestedSections[nestedSectionItem.nestedIndex] = updatedSection;
                                newSections[nestedSectionItem.sectionIndex] = {
                                  ...newSections[nestedSectionItem.sectionIndex],
                                  nestedSections: newNestedSections
                                };
                              }
                              return { ...prev, sections: newSections };
                            });
                          }}
                          availableFields={[
                            // Fields from parent section
                            ...form.sections[nestedSectionItem.sectionIndex].fields.map(f => f.name),
                            // Fields from previous sections
                            ...form.sections
                              .slice(0, nestedSectionItem.sectionIndex)
                              .flatMap((s) => s.fields.map((f) => f.name))
                          ]}
                        />
                      );
                    })()}
                  </Box>
                </Paper>
              </Panel>
            </PanelGroup>
          </TabPanel>

          {/* Preview Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ 
              height: '100%', 
              overflowY: 'auto', // Add scroll here
              p: 2, 
              backgroundColor: theme.palette.grey[50]
            }}>
              <Paper 
                elevation={2} 
                sx={{ 
                  maxWidth: 800, 
                  mx: 'auto', 
                  p: 3, 
                  borderRadius: 2,
                  mb: 2 // Add bottom margin for better scrolling experience
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Form Preview
                </Typography>
                
                {form.sections.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '200px',
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: '8px',
                    p: 3
                  }}>
                    <Typography color="textSecondary">
                      Add sections and fields to see a preview of your form
                    </Typography>
                  </Box>
                ) : (
                  // Update the FormRenderer usage in the Preview Tab
<FormRenderer 
  form={form} 
  onSubmit={(data) => {
    // Define the type for structuredData to allow dynamic properties
    const structuredData: { [key: string]: any } = {};
    
    form.sections.forEach(section => {
      if (section.objectName) {
        structuredData[section.objectName] = {};
        
        // Add fields from this section
        section.fields.forEach(field => {
          if (data[field.name] !== undefined) {
            structuredData[section.objectName][field.name] = data[field.name];
          }
        });
        
        // Process nested sections if they exist
        if (section.nestedSections && section.nestedSections.length > 0) {
          section.nestedSections.forEach(nestedSection => {
            if (nestedSection.objectName) {
              structuredData[section.objectName][nestedSection.objectName] = {};
              
              nestedSection.fields.forEach(field => {
                if (data[field.name] !== undefined) {
                  structuredData[section.objectName][nestedSection.objectName][field.name] = 
                    data[field.name];
                }
              });
            } else {
              // If nested section has no objectName, add fields directly to parent
              nestedSection.fields.forEach(field => {
                if (data[field.name] !== undefined) {
                  structuredData[section.objectName][field.name] = data[field.name];
                }
              });
            }
          });
        }
      } else {
        // For sections without objectName, add fields to root level
        section.fields.forEach(field => {
          if (data[field.name] !== undefined) {
            structuredData[field.name] = data[field.name];
          }
        });
      }
    });
    
    console.log('Original form data:', data);
    console.log('Structured form data:', structuredData);
    
    return structuredData;
  }} 
/>
                )}
              </Paper>
            </Box>
          </TabPanel>

          {/* JSON Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ 
              height: '100%', 
              display: 'flex',
              flexDirection: 'column',
              p: 2, 
              backgroundColor: theme.palette.grey[50],
            }}>
              <Paper 
                elevation={2} 
                sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2, 
                  borderRadius: 2,
                }}
              >
                <Box sx={{ 
                  mb: 1, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <Typography variant="h6">Form JSON</Typography>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(JSON.stringify(form, null, 2));
                        alert('JSON copied to clipboard');
                      } catch (err) {
                        console.error('Failed to copy', err);
                      }
                    }}
                    size="small"
                  >
                    Copy to Clipboard
                  </Button>
                </Box>
                
                {/* Simple textarea instead of TextField for better scrolling */}
                <Box 
                  component="textarea"
                  value={JSON.stringify(form, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setForm(parsed);
                      setConfigError(null);
                    } catch (error) {
                      setConfigError('Invalid JSON format');
                    }
                  }}
                  spellCheck="false"
                  sx={{
                    flex: 1,
                    fontFamily: '"Fira Code", "Consolas", "Monaco", "Courier New", monospace',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    padding: '16px',
                    overflow: 'auto',
                    backgroundColor: '#1e1e1e', // Dark background like VS Code
                    color: '#d4d4d4', // Light text color
                    border: '1px solid #333',
                    borderRadius: '4px',
                    resize: 'none',
                    tabSize: 2,
                    caretColor: '#fff',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
                    
                    // Scrollbar styling
                    '&::-webkit-scrollbar': {
                      width: '14px',
                      height: '14px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#424242',
                      borderRadius: '4px',
                      border: '3px solid #1e1e1e', // Creates padding around the thumb
                      '&:hover': {
                        backgroundColor: '#5a5a5a',
                      },
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#1e1e1e',
                    },
                    
                    // Focus state
                    '&:focus': {
                      outline: 'none',
                      border: '1px solid #0e639c', // VS Code-like focus color
                      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2), 0 0 0 2px rgba(14, 99, 156, 0.25)'
                    }
                  }}
                />
                
                {configError && (
                  <Typography color="error" sx={{ mt: 1 }}>
                    {configError}
                  </Typography>
                )}
              </Paper>
            </Box>
          </TabPanel>
        </Box>
      </Box>
      
      {/* Delete section confirmation dialog */}
      <Dialog
        open={deleteSectionDialog.open}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Section Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this section? This will also delete all fields within it.
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteSection} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Drag overlay for visual feedback */}
      <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeField && (
          <Paper
            elevation={6}
            sx={{
              p: 1,
              borderRadius: '4px',
              width: '250px',
              backgroundColor: theme.palette.background.paper,
              border: `2px solid ${theme.palette.primary.main}`,
              boxShadow: theme.shadows[8],
              transform: 'rotate(-1deg)',
              opacity: 0.9
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DragIndicatorIcon 
                fontSize="small" 
                sx={{ mr: 1, color: theme.palette.primary.main }} 
              />
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {activeField.field.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Moving from Section {activeField.sectionIndex + 1}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </DragOverlay>
    </DndContext>
  );
};

// For sample/default form data
const defaultForm: Form = {
  sections: [
    {
      "id": `section_${Date.now()}`, // Add unique ID
      "name": "User Details",
      "objectName": "userDetails", // Add object name
      "nestedSections": [], // Add empty nestedSections array
      "fields": [
        {
          "name": "Name",
          "type": "text",
          "label": "Name",
          "placeholder": "Enter text value...",
          "required": false
        } as TextFieldType,
        {
          "name": "LastName",
          "type": "text",
          "label": "Last Name",
          "placeholder": "Enter text value...",
          "required": false
        } as TextFieldType
      ]
    }
  ]
};

// TabPanel component definition
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Fixed TabPanel component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`form-builder-tabpanel-${index}`}
      aria-labelledby={`form-builder-tab-${index}`}
      sx={{ 
        display: value === index ? 'flex' : 'none', // Use display instead of hidden
        flexDirection: 'column',
        flex: 1,  // Take up all available space
        overflow: 'hidden',
        // Remove fixed height calculation
      }}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%', // Fill parent height
          flex: 1 // Take up all available space
        }}>
          {children}
        </Box>
      )}
    </Box>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `form-builder-tab-${index}`,
    'aria-controls': `form-builder-tabpanel-${index}`,
  };
};

export default Playground;