import React from 'react';
import { Box, Paper, Typography, IconButton, useTheme, Button } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Field, Section } from '../types';
import { alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/Add';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DroppableArea from './DroppableArea';
import FieldDropIndicator from './FieldDropIndicator';
import SortableFieldItem from './components/fields/SortableFieldItem';

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
  activeDropSection: number | string | null;
  activeField: {field: Field; id: string; sectionIndex: number} | null;
  selectedItem: any;
  onNestedSectionSelect: (nestedIndex: number) => void;
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
              outline: selectedItem?.type === 'nestedSection' && 
                       selectedItem.nestedIndex === nestedIndex ? 
                       `1px solid #4dc8fb` : 'none'
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
          <IconButton 
            size="small"
            onClick={onMoveUp}
            disabled={index === 0}
            sx={{ opacity: index === 0 ? 0.3 : 0.7, '&:hover': { opacity: 1 } }}
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          
          <IconButton 
            size="small"
            onClick={onMoveDown}
            disabled={false} // This will be set by the parent based on whether it's the last section
            sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
          >
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
          
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

export default SortableSection;
