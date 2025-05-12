import React from 'react';
import { Box, Paper, Typography, IconButton, useTheme, Tooltip } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Field } from '../../../types';
import { alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/Add';

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
  isRecentlyAdded?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

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
  isRecentlyAdded = false,
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

export default SortableFieldItem;