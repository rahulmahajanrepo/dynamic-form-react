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
  DragOverEvent,
  defaultDropAnimationSideEffects,
  MeasuringStrategy
} from '@dnd-kit/core';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

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

import { DependencyGraph, DependencyNode, DependencyEdge, Field, Form, GridField, Section, DropdownField, RadioField,NumberField, CheckboxField, TextField as TextFieldType} from './types';
import { formatNameToLabel } from './utils';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import JsonTab from "./FormBuilder/components/layout/tabs/JsonTab";
import DependenciesTab from "./FormBuilder/components/layout/tabs/DependenciesTab"; // Import the new component
import PreviewTab from './FormBuilder/components/layout/tabs/PreviewTab'; // Import the new component
import DesignTab from './FormBuilder/components/layout/tabs/design/DesignTab'; // Import the new component

const fieldTypes: Field['type'][] = ['text', 'number', 'dropdown', 'radio', 'textarea', 'checkbox', 'grid', 'date'];

// Add this interface declaration
interface DroppableAreaProps {
  id: string;
  children: React.ReactNode;
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
        transition: 'all 0.15s ease-in-out',
        borderRadius: '4px',
        p: 1,
        position: 'relative',
        // Enhanced visual feedback
        border: isActive 
          ? `2px dashed ${theme.palette.primary.main}` 
          : `1px dashed ${theme.palette.divider}`,
        backgroundColor: isActive 
          ? alpha(theme.palette.primary.main, 0.08)
          : 'transparent',
        boxShadow: isActive 
          ? `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`
          : 'none',
        // Animation effect
        animation: isActive ? 'pulse 1.5s infinite' : 'none',
        '@keyframes pulse': {
          '0%': { boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}` },
          '50%': { boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.3)}` },
          '100%': { boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}` },
        }
      }}
      data-dropzone={id} // Add data attribute for easier debugging
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

// Create a new FieldDropIndicator component
const FieldDropIndicator: React.FC<{ active: boolean }> = ({ active }) => {
  const theme = useTheme();
  
  if (!active) return null;
  
  return (
    <Box
      sx={{
        width: '100%',
        height: '3px',
        backgroundColor: theme.palette.primary.main,
        my: 0.5,
        borderRadius: '3px',
        position: 'relative',
        // Add animated arrow indicator
        '&::before': {
          content: '""',
          position: 'absolute',
          left: -8,
          top: -7,
          width: 0,
          height: 0,
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderLeft: `8px solid ${theme.palette.primary.main}`,
          animation: 'bounce 0.8s infinite alternate'
        },
        '@keyframes bounce': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(5px)' }
        }
      }}
    />
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
  onMoveUp: (e: React.MouseEvent) => void;
  onMoveDown: (e: React.MouseEvent) => void;
  isRecentlyAdded?: boolean; // Add this prop
  isFirst?: boolean;
  isLast?: boolean;
}

// Update the SortableFieldItem component
const SortableFieldItem: React.FC<SortableFieldItemProps> = ({ 
  field, 
  id,
  sectionIndex, 
  fieldIndex, 
  isSelected, 
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
  isRecentlyAdded = false, // Add this prop
  isFirst = false,
  isLast = false
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
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <Paper
      id={id}
      ref={setNodeRef}
      elevation={isDragging ? 4 : isRecentlyAdded ? 3 : 1}
      sx={{
        p: 1,
        my: 0.5,
        cursor: 'pointer',
        borderRadius: '4px',
        position: 'relative', 
        border: isSelected
          ? `2px solid ${theme.palette.secondary.main}`
          : isRecentlyAdded
            ? `2px solid ${theme.palette.success.main}`
            : isDragging 
              ? `2px solid ${theme.palette.primary.main}` 
              : '1px solid #e0e0e0',
        '&:hover': {
          backgroundColor: theme.palette.action.hover
        },
        boxShadow: isDragging ? theme.shadows[8] : isRecentlyAdded ? theme.shadows[4] : undefined,
        animation: isRecentlyAdded ? 'addedFieldAnimation 0.4s ease-out' : 'none',
        '@keyframes addedFieldAnimation': {
          '0%': { 
            opacity: 0.1,
            transform: 'scale(0.8) translateY(15px)',
            borderColor: theme.palette.success.main,
            backgroundColor: alpha(theme.palette.success.light, 0.3)
          },
          '50%': { 
            opacity: 0.9,
            transform: 'scale(0.9) translateY(-5px)',
            backgroundColor: alpha(theme.palette.success.light, 0.2)
          },
          '100%': { 
            opacity: 1,
            transform: 'scale(1) translateY(0)',
            backgroundColor: alpha(theme.palette.background.paper, 1)
          }
        }
      }}
      style={style}
      onClick={onSelect}
    >
      {/* Badge for recently added fields */}
      {isRecentlyAdded && (
        <Box sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          backgroundColor: theme.palette.success.main,
          color: '#fff',
          borderRadius: '50%',
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          animation: 'pulse 1s infinite'
        }}>
          <AddIcon fontSize="small" />
        </Box>
      )}
      
      {/* Field content with reordering controls */}
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
        
        {/* Field actions (up, down, delete) */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Move field up">
            <span>
              <IconButton 
                size="small"
                onClick={onMoveUp}
                disabled={isFirst}
                sx={{ 
                  opacity: isFirst ? 0.3 : 0.7, 
                  '&:hover': { opacity: isFirst ? 0.3 : 1 }
                }}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Move field down">
            <span>
              <IconButton 
                size="small"
                onClick={onMoveDown}
                disabled={isLast}
                sx={{ 
                  opacity: isLast ? 0.3 : 0.7, 
                  '&:hover': { opacity: isLast ? 0.3 : 1 }
                }}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          
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
  recentlyAddedField: {
    sectionIndex: number;
    fieldIndex: number;
    nestedIndex?: number;
    timestamp: number;
  } | null;
  onMoveNestedFieldUp: (sectionIndex: number, nestedIndex: number, fieldIndex: number, e: React.MouseEvent) => void;
  onMoveNestedFieldDown: (sectionIndex: number, nestedIndex: number, fieldIndex: number, e: React.MouseEvent) => void;
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
  onRemoveNestedField,
  recentlyAddedField,
  onMoveNestedFieldUp,
  onMoveNestedFieldDown
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
                      isRecentlyAdded={
                        recentlyAddedField !== null &&
                        recentlyAddedField.sectionIndex === index &&
                        recentlyAddedField.fieldIndex === fieldIndex &&
                        recentlyAddedField.nestedIndex === nestedIndex
                      }
                      onSelect={(e) => onNestedFieldSelect(nestedIndex, fieldIndex, e)}
                      onRemove={(e) => onRemoveNestedField(nestedIndex, fieldIndex, e)}
                      onMoveUp={(e) => onMoveNestedFieldUp(index, nestedIndex, fieldIndex, e)}
                      onMoveDown={(e) => onMoveNestedFieldDown(index, nestedIndex, fieldIndex, e)}
                      isFirst={fieldIndex === 0}
                      isLast={fieldIndex === nestedSection.fields.length - 1}
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

// Custom Snackbar Context (add before the Playground component)
type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error';

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: SnackbarSeverity) => void;
}

const SnackbarContext = React.createContext<SnackbarContextType | undefined>(undefined);

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SnackbarProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<SnackbarSeverity>('info');

  const showSnackbar = (message: string, severity: SnackbarSeverity = 'info') => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

// Custom hook to use the Snackbar
const useSnackbar = () => {
  const context = React.useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

// Extract the main content to a separate component
const FormBuilderContent: React.FC = () => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState<Form>({
    sections: [
      {
        id: `section_${Date.now()}`,
        name: "Section 1",
        objectName: "section_1",
        fields: []
      }
    ]
  });
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
  const [activeDragItem, setActiveDragItem] = useState<{
    id: string;
    type: string;
    name?: string;
  } | null>(null);
  
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
    const newSectionName = `Section ${form.sections.length + 1}`;
    const newObjectName = formatLabelToName(newSectionName); // Create helper function if missing
    
    const newSection: Section = {
      id: `section_${Date.now()}`,
      name: newSectionName,
      objectName: newObjectName, // Always initialize this
      fields: []
    };
    
    setForm(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  // Add this helper function if it doesn't exist
const formatLabelToName = (label: string): string => {
  if (!label) return '';
  
  // Replace spaces and special chars with underscores, then remove any non-alphanumeric chars
  const sanitized = label
    .replace(/[\s-]+/g, '_') // Replace spaces and hyphens with underscores
    .replace(/[^a-zA-Z0-9_]/g, '') // Remove all non-alphanumeric chars except underscores
    .replace(/_{2,}/g, '_'); // Replace multiple consecutive underscores with a single one
  
  // Convert to camelCase (first char lowercase)
  return sanitized.charAt(0).toLowerCase() + sanitized.slice(1);
};

  // Add these utility functions inside the component
  const getAvailableFieldsForSection = (sectionIndex: number) => {
    const allFields: Array<{ 
      name: string; 
      label?: string;
      parentSection?: string;
      nestedSection?: string;
      nestedIndex?: number;
    }> = [];
    
    // Process all sections before this one
    for (let i = 0; i < sectionIndex; i++) {
      const section = form.sections[i];
      if (!section) continue;
      
      // Add main section fields
      allFields.push(...section.fields.map((f: Field) => ({ 
        name: f.name, 
        label: f.label,
        parentSection: section.name
      })));
      
      // Add nested sections' fields
      if (section.nestedSections && section.nestedSections.length > 0) {
        section.nestedSections.forEach((nestedSection: Section, nestedIndex: number) => {
          allFields.push(...nestedSection.fields.map((f: Field) => ({ 
            name: f.name, 
            label: f.label,
            parentSection: section.name,
            nestedSection: nestedSection.name,
            nestedIndex: nestedIndex
          })));
        });
      }
    }
    
    return allFields;
  };

  const getAvailableFieldsForNestedSection = (sectionIndex: number, nestedIndex: number) => {
    const allFields: Array<{ 
      name: string; 
      label?: string;
      parentSection?: string;
      nestedSection?: string;
      nestedIndex?: number;
    }> = [];
    
    const parentSection = form.sections[sectionIndex];
    if (!parentSection) return allFields;
    
    // 1. Add fields from the parent section
    allFields.push(...parentSection.fields.map((f: Field) => ({ 
      name: f.name, 
      label: f.label,
      parentSection: parentSection.name
    })));
    
    // 2. Add fields from previous nested sections in the same parent
    if (parentSection.nestedSections) {
      for (let i = 0; i < nestedIndex; i++) {
        const prevNestedSection = parentSection.nestedSections[i];
        if (!prevNestedSection) continue;
        
        allFields.push(...prevNestedSection.fields.map((f: Field) => ({ 
          name: f.name, 
          label: f.label,
          parentSection: parentSection.name,
          nestedSection: prevNestedSection.name,
          nestedIndex: i
        })));
      }
    }
    
    // 3. Add fields from all previous sections (including their nested sections)
    allFields.push(...getAvailableFieldsForSection(sectionIndex));
    
    return allFields;
  };

  const removeSection = (sectionIndex: number) => {
    const sectionToRemove = form.sections[sectionIndex];
    if (!sectionToRemove) return;
    
    // Find all sections that depend on this one
    const dependentSections: Array<{ name: string, id: string }> = [];
    
    // Helper to find dependencies
    const checkDependencies = (section: Section) => {
      if (section.conditionField && 
          sectionToRemove.fields.some(f => f.name === section.conditionField)) {
        dependentSections.push({ name: section.name || 'Unnamed Section', id: section.id });
      }
      
      if (section.nestedSections) {
        section.nestedSections.forEach(checkDependencies);
      }
    };
    
    // Check all sections for dependencies
    form.sections.forEach(checkDependencies);
    
    // If dependencies exist, warn the user
    if (dependentSections.length > 0) {
      const confirmDelete = window.confirm(
        `Warning: The following sections depend on fields in "${sectionToRemove.name}":\n\n` +
        `${dependentSections.map(s => s.name).join('\n')}\n\n` +
        `Removing this section will break these dependencies. Continue?`
      );
      
      if (!confirmDelete) return;
      
      // User confirmed, so we need to clear the broken dependencies
      setForm(prev => {
        const newForm = {...prev};
        
        // Function to clear dependencies
        const clearDependencies = (section: Section): Section => {
          const newSection = {...section};
          
          // If this section depends on the removed section, clear its condition
          if (section.conditionField && 
              sectionToRemove.fields.some(f => f.name === section.conditionField)) {
            newSection.conditionField = '';
            newSection.conditionValue = '';
          }
          
          // Process nested sections
          if (newSection.nestedSections) {
            newSection.nestedSections = newSection.nestedSections.map(clearDependencies);
          }
          
          return newSection;
        };
        
        // Clear dependencies in all sections
        newForm.sections = newForm.sections.map(clearDependencies);
        
        // Remove the section
        newForm.sections.splice(sectionIndex, 1);
        
        return newForm;
      });
    } else {
      // No dependencies, just remove the section
      setForm(prev => {
        const newSections = [...prev.sections];
        newSections.splice(sectionIndex, 1);
        return { ...prev, sections: newSections };
      });
    }
    
    // Update selection if needed
    if (selectedItem?.type === 'section' && selectedItem.index === sectionIndex) {
      setSelectedItem(null);
    }
    
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
  
  // Replace the field-related drag and drop handlers with this implementation

// 1. Refactor handleDragStart for better field identification
const handleDragStart = (event: DragStartEvent) => {
  const { active } = event;
  const activeId = active.id.toString();
  
  // Update active drag item state
  setActiveDragItem({
    id: activeId,
    type: active.data.current?.type || '',
    name: active.data.current?.name
  });
  
  // Clear previous states when starting a new drag
  setDropIndicator(null);
  
  // Handle both regular fields and nested fields
  if (activeId.startsWith('field-')) {
    // For existing fields being dragged
    const [, sectionIdx, fieldIdx] = activeId.split('-').map(Number);
    
    if (!isNaN(sectionIdx) && !isNaN(fieldIdx) && form.sections[sectionIdx]?.fields[fieldIdx]) {
      const field = form.sections[sectionIdx].fields[fieldIdx];
      console.log('Dragging existing field:', field.label);
      setActiveField({ 
        field, 
        id: activeId, 
        sectionIndex: sectionIdx 
      });
    }
  } 
  // Add support for dragging nested fields
  else if (activeId.startsWith('nested-field-')) {
    // For nested fields being dragged
    const [, , sectionIdx, nestedIdx, fieldIdx] = activeId.split('-').map(Number);
    
    if (!isNaN(sectionIdx) && !isNaN(nestedIdx) && !isNaN(fieldIdx) && 
        form.sections[sectionIdx]?.nestedSections?.[nestedIdx]?.fields[fieldIdx]) {
      const field = form.sections[sectionIdx].nestedSections![nestedIdx].fields[fieldIdx];
      console.log('Dragging nested field:', field.label);
      setActiveField({ 
        field, 
        id: activeId, 
        sectionIndex: sectionIdx 
      });
    }
  }
  else if (active.data.current?.type === 'FIELD') {
    // For new fields being dragged from the palette
    console.log('Dragging new field of type:', active.data.current.name);
    setActiveField(null); // Clear activeField to indicate this is a new field
  }
};

// 2. Improve handleDragOver for more reliable drop indication
const handleDragOver = (event: DragOverEvent) => {
  const { active, over } = event;
  
  if (!over) {
    setActiveDropSection(null);
    setDropIndicator(null);
    return;
  }
  
  const activeId = active.id.toString();
  const overId = over.id.toString();
  
  // Determine which section we're hovering over
  let sectionIndex: number | null = null;
  let fieldIndex: number | null = null;
  let nestedIndex: number | null = null;
  
  // Case 1: Directly over a section
  if (overId.startsWith('section-')) {
    sectionIndex = parseInt(overId.split('-')[1], 10);
    // Check if section exists
    if (!form.sections[sectionIndex]) {
      console.warn(`Dragging over non-existent section: ${sectionIndex}`);
      setActiveDropSection(null);
      setDropIndicator(null);
      return;
    }
    fieldIndex = form.sections[sectionIndex].fields.length || 0; // Default to end
  } 
  // Case 2: Over a field
  else if (overId.startsWith('field-')) {
    const [, secIdx, fldIdx] = overId.split('-').map(Number);
    sectionIndex = secIdx;
    
    // Calculate position based on cursor position relative to field center
    if (event.activatorEvent && event.activatorEvent instanceof MouseEvent) {
      const fieldElement = document.getElementById(overId);
      if (fieldElement) {
        const rect = fieldElement.getBoundingClientRect();
        const mouseY = event.activatorEvent.clientY;
        const midPoint = rect.top + rect.height / 2;
        
        // If cursor is above the midpoint, insert before; otherwise after
        fieldIndex = mouseY < midPoint ? fldIdx : fldIdx + 1;
      } else {
        fieldIndex = fldIdx; // Default if element not found
      }
    } else {
      fieldIndex = fldIdx; // Default if no mouse event
    }
  }
  // Case 3: Over a nested section
  else if (overId.startsWith('nested-')) {
    const parts = overId.split('-');
    sectionIndex = parseInt(parts[1], 10);
    nestedIndex = parseInt(parts[2], 10);
    
    // Default to end of nested section
    fieldIndex = form.sections[sectionIndex]?.nestedSections?.[nestedIndex]?.fields.length || 0;
  }
  
  // Update state based on drag-over information
  if (sectionIndex !== null) {
    // Update active drop section
    if (nestedIndex !== null) {
      setActiveDropSection(`nested-${sectionIndex}-${nestedIndex}`);
    } else {
      setActiveDropSection(sectionIndex);
    }
    
    // Update drop indicator
    if (fieldIndex !== null) {
      setDropIndicator({ 
        sectionIndex, 
        fieldIndex,
        nestedIndex: nestedIndex !== null ? nestedIndex : undefined
      });
    }
  }
};

// 3. Simplify handleDragEnd for more reliable drops
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  
  // Save indicators before clearing
  const finalDropSection = activeDropSection;
  const finalDropIndicator = dropIndicator;
  
  // Don't immediately clear states - set up a delayed state clearing
  const activeData = activeDragItem;
  
  if (!over) {
    clearDragStates();
    return;
  }
  
  const activeId = active.id.toString();
  const overId = over.id.toString();
  
  // Case 1: Dragging a new field from sidebar to a section
  if (active.data.current?.type === 'FIELD') {
    const fieldType = active.data.current.name as Field['type'];
    
    // Process drag as normal but delay state clearing
    if (finalDropIndicator) {
      handleDropField(
        finalDropIndicator.sectionIndex, 
        fieldType, 
        finalDropIndicator.fieldIndex,
        finalDropIndicator.nestedIndex 
      );
    } else if (finalDropSection !== null) {
      // Your existing drop logic...
    }
    
    showSnackbar(`Added new ${active.data.current.name} field`, 'success');
    
    // Delay clearing states to allow for visual transition
    setTimeout(() => {
      clearDragStates();
    }, 100); // Short delay
    
    return;
  }
  
  // Case 2: Reordering/moving existing fields
  if (activeId.startsWith('field-') && finalDropIndicator) {
    const [, fromSectionIdx, fromFieldIdx] = activeId.split('-').map(Number);
    const toSectionIdx = finalDropIndicator.sectionIndex;
    const toFieldIdx = finalDropIndicator.fieldIndex;
    const toNestedIdx = finalDropIndicator.nestedIndex;
    
    // Skip invalid indices
    if (isNaN(fromSectionIdx) || isNaN(fromFieldIdx) || isNaN(toSectionIdx) || isNaN(toFieldIdx)) {
      return;
    }
    
    console.log(`Moving field from section ${fromSectionIdx}, field ${fromFieldIdx} to section ${toSectionIdx}, field ${toFieldIdx}`);
    
    // Adjust index for same-section moves
    let adjustedToFieldIdx = toFieldIdx;
    if (fromSectionIdx === toSectionIdx && !toNestedIdx && fromFieldIdx < toFieldIdx) {
      adjustedToFieldIdx -= 1;
    }
    
    // Perform the move
    setForm(prev => {
      const newSections = [...prev.sections];
      
      // 1. Extract the field to move
      const fieldToMove = {...newSections[fromSectionIdx].fields[fromFieldIdx]};
      newSections[fromSectionIdx].fields.splice(fromFieldIdx, 1);
      
      // 2. Insert field at new location
      if (toNestedIdx !== undefined) {
        // Moving to a nested section
        if (!newSections[toSectionIdx].nestedSections) {
          newSections[toSectionIdx].nestedSections = [];
        }
        
        if (!newSections[toSectionIdx].nestedSections![toNestedIdx]) {
          return prev; // Invalid nested section
        }
        
        // Insert at the right position
        newSections[toSectionIdx].nestedSections![toNestedIdx].fields.splice(
          adjustedToFieldIdx, 
          0, 
          fieldToMove
        );
      } else {
        // Moving within main sections
        newSections[toSectionIdx].fields.splice(adjustedToFieldIdx, 0, fieldToMove);
      }
      
      return { ...prev, sections: newSections };
    });
    
    // Update selection if needed
    if (selectedItem?.type === 'field' && 
        selectedItem.sectionIndex === fromSectionIdx && 
        selectedItem.fieldIndex === fromFieldIdx) {
      if (toNestedIdx !== undefined) {
        setSelectedItem({ 
          type: 'nestedField', 
          sectionIndex: toSectionIdx, 
          nestedIndex: toNestedIdx,
          fieldIndex: adjustedToFieldIdx 
        });
      } else {
        setSelectedItem({ 
          type: 'field', 
          sectionIndex: toSectionIdx, 
          fieldIndex: adjustedToFieldIdx 
        });
      }
    }
  }
  
  // Case 3: Moving a field from a nested section
  if (activeId.startsWith('nested-field-') && finalDropIndicator) {
    const [, , fromSectionIdx, fromNestedIdx, fromFieldIdx] = activeId.split('-').map(Number);
    const toSectionIdx = finalDropIndicator.sectionIndex;
    const toFieldIdx = finalDropIndicator.fieldIndex;
    const toNestedIdx = finalDropIndicator.nestedIndex;
    
    // Skip invalid indices
    if (isNaN(fromSectionIdx) || isNaN(fromNestedIdx) || isNaN(fromFieldIdx) || 
        isNaN(toSectionIdx) || isNaN(toFieldIdx)) {
      return;
    }
    
    console.log(`Moving nested field from section ${fromSectionIdx}, nested ${fromNestedIdx}, field ${fromFieldIdx} to section ${toSectionIdx}, field ${toFieldIdx}`);
    
    // Perform the move
    setForm(prev => {
      const newSections = [...prev.sections];
      
      // 1. Make sure the source nested section exists
      if (!newSections[fromSectionIdx]?.nestedSections?.[fromNestedIdx]?.fields) {
        return prev; // Source doesn't exist
      }
      
      // 2. Extract the field to move
      const fieldToMove = {...newSections[fromSectionIdx].nestedSections![fromNestedIdx].fields[fromFieldIdx]};
      newSections[fromSectionIdx].nestedSections![fromNestedIdx].fields.splice(fromFieldIdx, 1);
      
      // 3. Insert field at new location
      if (toNestedIdx !== undefined) {
        // Moving to another nested section
        if (!newSections[toSectionIdx].nestedSections) {
          newSections[toSectionIdx].nestedSections = [];
        }
        
        if (!newSections[toSectionIdx].nestedSections![toNestedIdx]) {
          return prev; // Invalid target
        }
        
        // Insert at the right position in the nested section
        newSections[toSectionIdx].nestedSections![toNestedIdx].fields.splice(
          toFieldIdx, 
          0, 
          fieldToMove
        );
      } else {
        // Moving to a main section
        newSections[toSectionIdx].fields.splice(toFieldIdx, 0, fieldToMove);
      }
      
      return { ...prev, sections: newSections };
    });
    
    // Update selection if the moved field was selected
    if (selectedItem?.type === 'nestedField' && 
        selectedItem.sectionIndex === fromSectionIdx && 
        selectedItem.nestedIndex === fromNestedIdx &&
        selectedItem.fieldIndex === fromFieldIdx) {
      if (toNestedIdx !== undefined) {
        setSelectedItem({ 
          type: 'nestedField', 
          sectionIndex: toSectionIdx, 
          nestedIndex: toNestedIdx,
          fieldIndex: toFieldIdx 
        });
      } else {
        setSelectedItem({ 
          type: 'field', 
          sectionIndex: toSectionIdx, 
          fieldIndex: toFieldIdx 
        });
      }
    }
    
    // Show a success message
    showSnackbar('Field moved successfully', 'success');
    
    // Clear drag states
    setTimeout(() => {
      clearDragStates();
    }, 100);
    
    return;
  }
  
  // Clean up after all operations
  setTimeout(() => {
    clearDragStates();
  }, 100);
};

// Helper function to clear all drag-related states
const clearDragStates = () => {
  setActiveDropSection(null);
  setActiveField(null);
  setDropIndicator(null);
  setActiveDragItem(null);
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
    if (!form.sections[sectionIndex]) {
      console.warn(`Section at index ${sectionIndex} doesn't exist`);
      return [];
    }
    return form.sections[sectionIndex].fields.map((_, fieldIndex) => 
      `field-${sectionIndex}-${fieldIndex}`
    );
  };

  const getSectionIds = () => {
    return form.sections.map((_, index) => `section-sortable-${index}`);
  };

  // Add dependency validation to moveSectionUp
const moveSectionUp = (sectionIndex: number, e?: React.MouseEvent) => {
  e?.stopPropagation();
  if (sectionIndex <= 0) return;
  
  // Check if moving would create a circular dependency
  if (wouldCreateCircularDependency(form.sections, sectionIndex, sectionIndex - 1)) {
    alert(
      `Cannot move section "${form.sections[sectionIndex].name}" up because this would create ` +
      `a circular dependency with conditional fields.`
    );
    return;
  }
  
  // Proceed with the move if no circular dependency
  setForm(prev => {
    const newSections = [...prev.sections];
    [newSections[sectionIndex - 1], newSections[sectionIndex]] = 
      [newSections[sectionIndex], newSections[sectionIndex - 1]];
    return { ...prev, sections: newSections };
  });
  
  // Update selection if needed
  if (selectedItem?.type === 'section') {
    if (selectedItem.index === sectionIndex) {
      setSelectedItem({ ...selectedItem, index: sectionIndex - 1 });
    } else if (selectedItem.index === sectionIndex - 1) {
      setSelectedItem({ ...selectedItem, index: sectionIndex });
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
    // Text, textarea
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
    // Text, textarea
    newField = {
      name: fieldName,
      type: fieldType as 'text' | 'textarea',
      label: formattedLabel,
      placeholder: `Enter ${fieldType} value...`,
      required: false
    } as TextFieldType;
  }
  
  // Add the field to the current section
  setForm((prev) => {
    const newSections = [...prev.sections];
    
    let addedFieldIndex = -1;
    
    // Add to a nested section or main section logic...
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
        
        addedFieldIndex = position === -1 ? 
          newSections[sectionIndex].nestedSections![nestedIndex].fields.length : 
          position;
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
      
      addedFieldIndex = position === -1 ? 
        newSections[sectionIndex].fields.length : 
        position;
    }
    
    // Add the field tracking AFTER setting form
    setTimeout(() => {
      setRecentlyAddedField({
        sectionIndex,
        fieldIndex: addedFieldIndex,
        nestedIndex,
        timestamp: Date.now()
      });
      
      // Automatically clear after animation completes
      setTimeout(() => setRecentlyAddedField(null), 2000);
    }, 50);
    
    return { ...prev, sections: newSections };
  });

  // Add to handleDropField after setting recentlyAddedField
  setTimeout(() => {
    const addedFieldIndex = position === -1 ? 
      (nestedIndex !== undefined 
        ? form.sections[sectionIndex].nestedSections![nestedIndex].fields.length - 1 
        : form.sections[sectionIndex].fields.length - 1) 
      : position;

    const fieldElement = document.getElementById(`field-${sectionIndex}-${addedFieldIndex}`);
    if (fieldElement) {
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 150);
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

  // Add this state for dependency tracking
  const [dependencyGraph, setDependencyGraph] = useState<DependencyGraph>({
    nodes: [],
    edges: []
  });

  // Add this effect to update the dependency graph when form changes
  useEffect(() => {
    updateDependencyGraph();
  }, [form.sections]);

  // Function to build the dependency graph
  const updateDependencyGraph = () => {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];
    
    // Process all sections to build nodes and edges
    const processSection = (section: Section, parentId?: string) => {
      if (!section.id) {
        section.id = `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Add section as node
      nodes.push({
        id: section.id,
        type: 'section',
        label: section.name || 'Unnamed Section',
        parentId
      });
      
      // Add fields as nodes
      section.fields.forEach(field => {
        nodes.push({
          id: `${section.id}_${field.name}`,
          type: 'field',
          label: field.label || field.name,
          parentId: section.id
        });
      });
      
      // Add dependency edge if this section has a condition
      if (section.conditionField) {
        // Find the target field's full ID by searching all sections
        const targetSectionAndField = findSectionContainingField(section.conditionField);
        
        if (targetSectionAndField) {
          const { section: targetSection, field: targetField } = targetSectionAndField;
          
          edges.push({
            id: `${section.id}_depends_on_${targetField.name}`,
            source: section.id,
            target: `${targetSection.id}_${targetField.name}`,
            condition: `equals "${section.conditionValue}"`
          });
        }
      }
      
      // Process nested sections
      if (section.nestedSections) {
        section.nestedSections.forEach(nestedSection => {
          // Ensure nested sections have IDs
          if (!nestedSection.id) {
            nestedSection.id = `nested_section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          }
          
          // Make sure the nested section has parentId set
          nestedSection.parentId = section.id;
          
          // Process the nested section recursively
          processSection(nestedSection, section.id);
        });
      }
    };
    
    // Process all top-level sections
    form.sections.forEach(section => {
      processSection(section);
    });
    
    setDependencyGraph({ nodes, edges });
  };

  // Helper to find which section contains a field
  const findSectionContainingField = (fieldName: string): { section: Section, field: Field } | undefined => {
    // Search in top-level sections
    for (const section of form.sections) {
      // Check in this section's fields
      const field = section.fields.find(f => f.name === fieldName);
      if (field) return { section, field };
      
      // Check in nested sections
      if (section.nestedSections) {
        for (const nestedSection of section.nestedSections) {
          const nestedField = nestedSection.fields.find(f => f.name === fieldName);
          if (nestedField) return { section: nestedSection, field: nestedField };
        }
      }
    }
    return undefined;
  };

  // 1. First, add a success animation effect when a field is dropped
// Add this function to your FormBuilderContent component

const [recentlyAddedField, setRecentlyAddedField] = useState<{
  sectionIndex: number;
  fieldIndex: number;
  nestedIndex?: number;
  timestamp: number;
} | null>(null);

// 1. First, add these functions to the FormBuilderContent component
const moveFieldUp = (sectionIndex: number, fieldIndex: number, e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent field selection when clicking the button
  
  if (fieldIndex <= 0) return; // Already at the top
  
  setForm(prev => {
    const newSections = [...prev.sections];
    const fields = [...newSections[sectionIndex].fields];
    
    // Swap the field with the one above it
    [fields[fieldIndex - 1], fields[fieldIndex]] = [fields[fieldIndex], fields[fieldIndex - 1]];
    
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      fields
    };
    
    return { ...prev, sections: newSections };
  });
  
  // Update selection if needed
  if (selectedItem?.type === 'field' && 
      selectedItem.sectionIndex === sectionIndex && 
      selectedItem.fieldIndex === fieldIndex) {
    setSelectedItem({
      ...selectedItem,
      fieldIndex: fieldIndex - 1
    });
  } else if (selectedItem?.type === 'field' && 
             selectedItem.sectionIndex === sectionIndex && 
             selectedItem.fieldIndex === fieldIndex - 1) {
    setSelectedItem({
      ...selectedItem,
      fieldIndex: fieldIndex
    });
  }
};

const moveFieldDown = (sectionIndex: number, fieldIndex: number, e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent field selection when clicking the button
  
  setForm(prev => {
    const newSections = [...prev.sections];
    const fields = [...newSections[sectionIndex].fields];
    
    if (fieldIndex >= fields.length - 1) return prev; // Already at the bottom
    
    // Swap the field with the one below it
    [fields[fieldIndex], fields[fieldIndex + 1]] = [fields[fieldIndex + 1], fields[fieldIndex]];
    
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      fields
    };
    
    return { ...prev, sections: newSections };
  });
  
  // Update selection if needed
  if (selectedItem?.type === 'field' && 
      selectedItem.sectionIndex === sectionIndex && 
      selectedItem.fieldIndex === fieldIndex) {
    setSelectedItem({
      ...selectedItem,
      fieldIndex: fieldIndex + 1
    });
  } else if (selectedItem?.type === 'field' && 
             selectedItem.sectionIndex === sectionIndex && 
             selectedItem.fieldIndex === fieldIndex + 1) {
    setSelectedItem({
      ...selectedItem,
      fieldIndex: fieldIndex
    });
  }
};

// 2. Add functions for nested fields
const moveNestedFieldUp = (sectionIndex: number, nestedIndex: number, fieldIndex: number, e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent field selection when clicking the button
  
  if (fieldIndex <= 0) return; // Already at the top
  
  setForm(prev => {
    const newSections = [...prev.sections];
    
    if (!newSections[sectionIndex]?.nestedSections?.[nestedIndex]) {
      return prev;
    }
    
    const nestedSection = {...newSections[sectionIndex].nestedSections![nestedIndex]};
    const fields = [...nestedSection.fields];
    
    // Swap with the field above
    [fields[fieldIndex - 1], fields[fieldIndex]] = [fields[fieldIndex], fields[fieldIndex - 1]];
    
    nestedSection.fields = fields;
    
    const newNestedSections = [...newSections[sectionIndex].nestedSections!];
    newNestedSections[nestedIndex] = nestedSection;
    
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      nestedSections: newNestedSections
    };
    
    return { ...prev, sections: newSections };
  });
  
  // Update selection if needed
  if (selectedItem?.type === 'nestedField' && 
      selectedItem.sectionIndex === sectionIndex &&
      selectedItem.nestedIndex === nestedIndex &&
      selectedItem.fieldIndex === fieldIndex) {
    setSelectedItem({
      ...selectedItem,
      fieldIndex: fieldIndex - 1
    });
  } else if (selectedItem?.type === 'nestedField' && 
             selectedItem.sectionIndex === sectionIndex &&
             selectedItem.nestedIndex === nestedIndex &&
             selectedItem.fieldIndex === fieldIndex - 1) {
    setSelectedItem({
      ...selectedItem,
      fieldIndex: fieldIndex
    });
  }
};

const moveNestedFieldDown = (sectionIndex: number, nestedIndex: number, fieldIndex: number, e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent field selection when clicking the button
  
  setForm(prev => {
    const newSections = [...prev.sections];
    
    if (!newSections[sectionIndex]?.nestedSections?.[nestedIndex]) {
      return prev;
    }
    
    const nestedSection = {...newSections[sectionIndex].nestedSections![nestedIndex]};
    const fields = [...nestedSection.fields];
    
    if (fieldIndex >= fields.length - 1) return prev; // Already at the bottom
    
    // Swap with the field below
    [fields[fieldIndex], fields[fieldIndex + 1]] = [fields[fieldIndex + 1], fields[fieldIndex]];
    
    nestedSection.fields = fields;
    
    const newNestedSections = [...newSections[sectionIndex].nestedSections!];
    newNestedSections[nestedIndex] = nestedSection;
    
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      nestedSections: newNestedSections
    };
    
    return { ...prev, sections: newSections };
  });
  
  // Update selection if needed
  if (selectedItem?.type === 'nestedField' && 
      selectedItem.sectionIndex === sectionIndex &&
      selectedItem.nestedIndex === nestedIndex &&
      selectedItem.fieldIndex === fieldIndex) {
    setSelectedItem({
      ...selectedItem,
      fieldIndex: fieldIndex + 1
    });
  } else if (selectedItem?.type === 'nestedField' && 
             selectedItem.sectionIndex === sectionIndex &&
             selectedItem.nestedIndex === nestedIndex &&
             selectedItem.fieldIndex === fieldIndex + 1) {
    setSelectedItem({
      ...selectedItem,
      fieldIndex: fieldIndex
    });
  }
};

  return (
    <DndContext 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd} 
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
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
            <Tab label="Dependencies" {...a11yProps(3)} />
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
            <DesignTab 
              form={form}
              panelSizes={panelSizes}
              setPanelSizes={setPanelSizes}
              fieldTypes={fieldTypes}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              activeDropSection={activeDropSection}
              activeField={activeField}
              dropIndicator={dropIndicator}
              recentlyAddedField={recentlyAddedField}
              addSection={addSection}
              updateSection={updateSection}
              updateField={updateField}
              handleDeleteSectionClick={handleDeleteSectionClick}
              moveSectionUp={moveSectionUp}
              moveSectionDown={moveSectionDown}
              handleNestedSectionUp={handleNestedSectionUp}
              handleNestedSectionDown={handleNestedSectionDown}
              handleNestedSectionSelect={handleNestedSectionSelect}
              handleDeleteNestedSection={handleDeleteNestedSection}
              getFieldIds={getFieldIds}
              getSectionIds={getSectionIds}
              getNestedFieldIds={getNestedFieldIds}
              handleFieldSelect={handleFieldSelect}
              removeField={removeField}
              moveFieldUp={moveFieldUp}
              moveFieldDown={moveFieldDown}
              handleNestedFieldSelect={handleNestedFieldSelect}
              removeNestedField={removeNestedField}
              moveNestedFieldUp={moveNestedFieldUp}
              moveNestedFieldDown={moveNestedFieldDown}
              getAvailableFieldsForSection={getAvailableFieldsForSection}
              getAvailableFieldsForNestedSection={getAvailableFieldsForNestedSection}
            />
          </TabPanel>

          {/* Preview Tab */}
          <TabPanel value={activeTab} index={1}>
            <PreviewTab 
              formSchema={form} 
              previewMode="desktop" // or use a state variable if you have device mode switching
            />
          </TabPanel>

          {/* JSON Tab */}
          <TabPanel value={activeTab} index={2}>
            <JsonTab form={form} setForm={setForm} />
          </TabPanel>

          {/* Dependencies Tab */}
          <TabPanel value={activeTab} index={3}>
            <DependenciesTab dependencyGraph={dependencyGraph} />
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
      <DragOverlay 
        dropAnimation={{ 
          duration: 400,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          sideEffects: defaultDropAnimationSideEffects({
            styles: { 
              active: { 
                opacity: '0.4' 
              },
              dragOverlay: {
                opacity: '1',
                scale: '0.96', // Make it slightly smaller to show it's "becoming" the field
                transition: 'all 400ms cubic-bezier(0.18, 0.67, 0.6, 1.22)'
              }
            },
          })
        }}
>
  {activeField ? (
    <Paper
      elevation={6}
      sx={{
        p: 1.5,
        borderRadius: '4px',
        width: '250px',
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.primary.main}`,
        boxShadow: `0 5px 10px ${alpha(theme.palette.primary.main, 0.2)}`,
        transform: 'rotate(-1deg) translateZ(0)',
        pointerEvents: 'none'
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
            {activeField.field.type} field
          </Typography>
        </Box>
      </Box>
    </Paper>
  ) : activeDragItem?.type === 'FIELD' ? (
    <Paper
      elevation={6}
      sx={{
        p: 1.5,
        borderRadius: '4px',
        width: '200px',
        backgroundColor: alpha(theme.palette.primary.light, 0.9),
        border: `2px solid ${theme.palette.primary.main}`,
        boxShadow: `0 8px 16px ${alpha(theme.palette.primary.dark, 0.3)}`,
        transform: 'rotate(-1deg) translateZ(0)',
        pointerEvents: 'none'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <AddCircleOutlineIcon 
          fontSize="small" 
          sx={{ mr: 1, color: theme.palette.primary.contrastText }} 
        />
        <Typography variant="body1" fontWeight="medium" color="primary.contrastText">
          New {activeDragItem.name} Field
        </Typography>
      </Box>
    </Paper>
  ) : null}
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

// Replace the DependencyGraphVisualizer component with an enhanced tree-like visualization

const DependencyGraphVisualizer: React.FC<{ graph: DependencyGraph }> = ({ graph }) => {
  const theme = useTheme();
  
  if (graph.nodes.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%' 
      }}>
        <Typography variant="body1" color="text.secondary">
          No sections found. Add sections to visualize dependencies.
        </Typography>
      </Box>
    );
  }
  
  // Build a hierarchical structure for visualization
  const buildDependencyTree = () => {
    // Get all section nodes (both main and nested)
    const allSectionNodes = graph.nodes.filter(node => node.type === 'section');
    
    // Map of section IDs to their dependency info
    const dependencyMap: Record<string, {
      node: DependencyNode;
      dependsOn: Array<{
        fieldNode: DependencyNode;
        sectionNode: DependencyNode;
        condition: string;
      }>;
      children: string[];
      isNested: boolean;
      parentSection?: string;
    }> = {};
    
    // Initialize the map with all sections
    allSectionNodes.forEach(node => {
      // Determine if this is a nested section
      const isNested = !!node.parentId;
      
      dependencyMap[node.id] = {
        node,
        dependsOn: [],
        children: [],
        isNested,
        parentSection: node.parentId
      };
    });
    
    // Add dependencies based on edges
    graph.edges.forEach(edge => {
      const sourceNode = graph.nodes.find(n => n.id === edge.source);
      const targetNode = graph.nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode || sourceNode.type !== 'section') return;
      
      // Find the section that contains this field
      if (targetNode.type === 'field' && targetNode.parentId) {
        const fieldSectionNode = graph.nodes.find(n => n.id === targetNode.parentId);
        
        if (fieldSectionNode && dependencyMap[sourceNode.id]) {
          dependencyMap[sourceNode.id].dependsOn.push({
            fieldNode: targetNode,
            sectionNode: fieldSectionNode,
            condition: edge.condition || ''
          });
          
          // Record parent-child relationship
          if (dependencyMap[fieldSectionNode.id]) {
            dependencyMap[fieldSectionNode.id].children.push(sourceNode.id);
          }
        }
      }
    });
    
    return dependencyMap;
  };
  
  const dependencyTree = buildDependencyTree();
  
  // Find root nodes (sections that don't depend on any other sections and aren't nested sections)
  const rootNodes = Object.keys(dependencyTree).filter(nodeId => 
    dependencyTree[nodeId].dependsOn.length === 0 && 
    !dependencyTree[nodeId].isNested
  );
  
  // Recursive component to render a node and its children
  const renderNode = (nodeId: string, level: number = 0, visited: Set<string> = new Set()) => {
    // Prevent circular rendering
    if (visited.has(nodeId)) {
      return (
        <Box key={`cycle-${nodeId}`} sx={{ ml: level * 3, mt: 1, color: 'error.main' }}>
          <Typography variant="body2">Circular dependency detected!</Typography>
        </Box>
      );
    }
    
    const nodeInfo = dependencyTree[nodeId];
    if (!nodeInfo) return null;
    
    const newVisited = new Set(visited);
    newVisited.add(nodeId);
    
    // Find nested sections that belong to this section
    const nestedSections = Object.keys(dependencyTree).filter(id => 
      dependencyTree[id].isNested && dependencyTree[id].parentSection === nodeId
    );
    
    return (
      <Box key={nodeId} sx={{ mb: 2 }}>
        {/* Node representation */}
        <Paper 
          elevation={1}
          sx={{ 
            p: 2, 
            borderRadius: '8px',
            backgroundColor: level === 0 
              ? 'background.paper' 
              : nodeInfo.isNested
                ? alpha(theme.palette.info.light, 0.1)
                : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: level > 0 ? 1 : 3,
            borderLeft: `4px solid ${
              nodeInfo.isNested ? theme.palette.info.main :
              level === 0 ? theme.palette.primary.main : 
              level === 1 ? theme.palette.secondary.main :
              theme.palette.success.main
            }`,
            ml: level * 3
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium" sx={{
            color: nodeInfo.isNested ? theme.palette.info.dark : 'inherit'
          }}>
            {nodeInfo.isNested ? '↳ ' : ''}{nodeInfo.node.label}
            {nodeInfo.isNested && <Typography component="span" variant="caption" sx={{ ml: 1 }}>
              (Nested Section)
            </Typography>}
          </Typography>
          
          {/* Display dependencies */}
          {nodeInfo.dependsOn.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 'medium' }}>
                Depends on:
              </Typography>
              {nodeInfo.dependsOn.map((dep, idx) => (
                <Box 
                  key={`dep-${idx}`} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 0.5,
                    pl: 1,
                    borderLeft: `2px solid ${alpha(theme.palette.divider, 0.5)}`
                  }}
                >
                  <ArrowBackIcon 
                    sx={{ 
                      mr: 1, 
                      fontSize: '0.9rem', 
                      color: theme.palette.text.secondary 
                    }} 
                  />
                  <Typography variant="body2">
                    Field <strong>{dep.fieldNode.label}</strong> from 
                    {dependencyTree[dep.sectionNode.id]?.isNested ? ' nested section ' : ' section '}
                    "{dep.sectionNode.label}"
                    {dep.condition && <span style={{ color: theme.palette.info.main }}> {dep.condition}</span>}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
        
        {/* Render nested sections belonging to this section */}
        {nestedSections.length > 0 && (
          <Box sx={{ ml: level * 3 + 2, mt: 1, mb: 1 }}>
            <Box 
              sx={{ 
                height: '20px',
                borderLeft: `2px dashed ${theme.palette.info.main}`,
                ml: 2
              }} 
            />
            {nestedSections.map(nestedId => renderNode(nestedId, level + 1, newVisited))}
          </Box>
        )}
        
        {/* Connection line to dependent sections */}
        {dependencyTree[nodeId].children.filter(id => !dependencyTree[id].isNested).length > 0 && (
          <Box 
            sx={{ 
              height: '20px', 
              ml: level * 3 + 2, 
              borderLeft: `2px dashed ${theme.palette.divider}` 
            }} 
          />
        )}
        
        {/* Render sections that depend on this one (but not nested sections) */}
        {dependencyTree[nodeId].children
          .filter(id => !dependencyTree[id].isNested)
          .map(childId => renderNode(childId, level + 1, newVisited))}
      </Box>
    );
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Section Dependency Tree</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        This visualization shows how sections and nested sections depend on fields from other sections.
        Sections at the top are independent, while sections below depend on fields from sections above.
      </Typography>
      
      {rootNodes.length === 0 ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          No root sections found. There might be circular dependencies in your form structure.
        </Alert>
      ) : (
        <Box sx={{ mt: 2 }}>
          {rootNodes.map(nodeId => renderNode(nodeId))}
        </Box>
      )}
      
      {/* Legend */}
      <Paper sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.background.paper, 0.7) }}>
        <Typography variant="subtitle2" gutterBottom>Legend:</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: theme.palette.primary.main, mr: 1 }} />
            <Typography variant="body2">Root sections (don't depend on any fields)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: theme.palette.secondary.main, mr: 1 }} />
            <Typography variant="body2">Level 1 dependent sections</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: theme.palette.success.main, mr: 1 }} />
            <Typography variant="body2">Deeper level dependent sections</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: theme.palette.info.main, mr: 1 }} />
            <Typography variant="body2">Nested sections</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

// Add these utility functions for dependency validation

// Detect if moving a section would create a circular dependency
const wouldCreateCircularDependency = (
  sections: Section[], 
  movingSection: number, 
  targetPosition: number
): boolean => {
  // Create a copy of sections in the proposed new order
  const proposedSections = [...sections];
  const [sectionToMove] = proposedSections.splice(movingSection, 1);
  proposedSections.splice(targetPosition, 0, sectionToMove);
  
  // Build dependency graph from the proposed arrangement
  const graph: Record<string, string[]> = {};
  
  // Initialize graph with all section IDs
  proposedSections.forEach(section => {
    graph[section.id] = [];
  });
  
  // Add dependencies
  proposedSections.forEach(section => {
    if (section.conditionField) {
      // Find which section contains this field
      for (const otherSection of proposedSections) {
        if (otherSection.fields.some(f => f.name === section.conditionField)) {
          graph[section.id].push(otherSection.id);
          break;
        }
        
        // Check nested sections too
        if (otherSection.nestedSections) {
          for (const nestedSection of otherSection.nestedSections) {
            if (nestedSection.fields.some(f => f.name === section.conditionField)) {
              graph[section.id].push(otherSection.id);
              break;
            }
          }
        }
      }
    }
    
    // Add parent-child relationships for nested sections
    if (section.nestedSections) {
      section.nestedSections.forEach(nestedSection => {
        if (nestedSection.id && graph[nestedSection.id]) {
          graph[nestedSection.id].push(section.id);
        }
      });
    }
  });
  
  // Check for cycles using DFS
  return hasCycle(graph);
};

// Depth-first search to detect cycles in the graph
const hasCycle = (graph: Record<string, string[]>): boolean => {
  const visited: Record<string, boolean> = {};
  const recStack: Record<string, boolean> = {};
  
  for (const node in graph) {
    if (dfsCheckCycle(node, graph, visited, recStack)) {
      return true;
    }
  }
  
  return false;
};

const dfsCheckCycle = (
  node: string, 
  graph: Record<string, string[]>, 
  visited: Record<string, boolean>, 
  recStack: Record<string, boolean>
): boolean => {
  // Mark current node as visited and add to recursion stack
  if (!visited[node]) {
    visited[node] = true;
    recStack[node] = true;
    
    // Visit all adjacent vertices
    for (const neighbor of graph[node] || []) {
      // If not visited, recursively check that subtree
      if (!visited[neighbor] && dfsCheckCycle(neighbor, graph, visited, recStack)) {
        return true;
      } 
      // If already in recursion stack, we found a cycle
      else if (recStack[neighbor]) {
        return true;
      }
    }
  }
  
  // Remove from recursion stack
  recStack[node] = false;
  return false;
};

// Then modify the Playground component to be just a wrapper with the provider
const Playground: React.FC = () => {
  return (
    <SnackbarProvider>
      <FormBuilderContent />
    </SnackbarProvider>
  );
};

export default Playground;
