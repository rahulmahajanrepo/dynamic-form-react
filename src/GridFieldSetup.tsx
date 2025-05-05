import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { GridField, GridColumn, FieldType } from './types';

interface GridFieldSetupProps {
  field: GridField; // Now using the specific GridField type
  onUpdate: (updatedField: GridField) => void;
}

const SortableColumnRow = ({ column, index, onUpdate, onDelete }: {
  column: GridColumn;
  index: number;
  onUpdate: (index: number, updatedColumn: GridColumn) => void;
  onDelete: (index: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: `column-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell padding="none" width="40px">
        <IconButton size="small" {...attributes} {...listeners} sx={{ cursor: 'grab' }}>
          <DragIndicatorIcon fontSize="small" />
        </IconButton>
      </TableCell>
      <TableCell>
        <TextField
          fullWidth
          size="small"
          label="Column Name"
          value={column.name}
          onChange={(e) => onUpdate(index, { ...column, name: e.target.value })}
        />
      </TableCell>
      <TableCell>
        <FormControl fullWidth size="small">
          <InputLabel>Type</InputLabel>
          <Select
            value={column.type}
            label="Type"
            onChange={(e) => {
              const newType = e.target.value as Exclude<FieldType, 'grid'>;
              const updatedColumn: GridColumn = {
                ...column,
                type: newType,
                // Add options array if type is dropdown or radio
                ...(newType === 'dropdown' || newType === 'radio' 
                  ? !column.options ? { options: ['Option 1', 'Option 2'] } : {}
                  : { options: undefined })
              };
              onUpdate(index, updatedColumn);
            }}
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="number">Number</MenuItem>
            <MenuItem value="dropdown">Dropdown</MenuItem>
            <MenuItem value="radio">Radio</MenuItem>
            <MenuItem value="checkbox">Checkbox</MenuItem>
            <MenuItem value="textarea">Text Area</MenuItem>
          </Select>
        </FormControl>
      </TableCell>
      <TableCell>
        <FormControlLabel
          control={
            <Switch
              checked={!!column.required}
              onChange={(e) => onUpdate(index, { ...column, required: e.target.checked })}
              size="small"
            />
          }
          label="Required"
        />
      </TableCell>
      <TableCell>
        {(column.type === 'dropdown' || column.type === 'radio') && (
          <TextField
            fullWidth
            size="small"
            label="Options (comma separated)"
            value={(column.options || []).join(',')}
            onChange={(e) => {
              const options = e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt);
              onUpdate(index, { ...column, options });
            }}
          />
        )}
      </TableCell>
      <TableCell padding="none" width="40px">
        <IconButton size="small" color="error" onClick={() => onDelete(index)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

const GridFieldSetup: React.FC<GridFieldSetupProps> = ({ field, onUpdate }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleAddColumn = () => {
    const newColumns = [...(field.columns || []), {
      name: `Column ${(field.columns?.length || 0) + 1}`,
      type: 'text' as Exclude<FieldType, 'grid'>,  // Add type assertion here
    }];
    onUpdate({ ...field, columns: newColumns });
  };

  const handleUpdateColumn = (index: number, updatedColumn: GridColumn) => {
    const newColumns = [...(field.columns || [])];
    newColumns[index] = updatedColumn;
    onUpdate({ ...field, columns: newColumns });
  };

  const handleDeleteColumn = (index: number) => {
    const newColumns = [...(field.columns || [])];
    newColumns.splice(index, 1);
    onUpdate({ ...field, columns: newColumns });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = parseInt(active.id.split('-')[1]);
      const newIndex = parseInt(over.id.split('-')[1]);
      
      const newColumns = [...(field.columns || [])];
      const [movedColumn] = newColumns.splice(oldIndex, 1);
      newColumns.splice(newIndex, 0, movedColumn);
      
      onUpdate({ ...field, columns: newColumns });
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>Data Grid Settings</Typography>
      
      <TextField
        fullWidth
        label="Field Name"
        value={field.name}
        onChange={(e) => onUpdate({ ...field, name: e.target.value })}
        margin="normal"
        size="small"
      />
      
      <TextField
        fullWidth
        label="Label"
        value={field.label}
        onChange={(e) => onUpdate({ ...field, label: e.target.value })}
        margin="normal"
        size="small"
      />
      
      <TextField
        fullWidth
        label="Default Rows"
        type="number"
        value={field.defaultRows || 1}
        onChange={(e) => onUpdate({ ...field, defaultRows: parseInt(e.target.value) || 1 })}
        margin="normal"
        size="small"
        inputProps={{ min: 0 }}
      />
      
      <FormControlLabel
        control={
          <Switch
            checked={!!field.required}
            onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
          />
        }
        label="Required"
      />
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Grid Columns
      </Typography>
      
      <TableContainer component={Paper} variant="outlined" sx={{ mt: 1, mb: 2 }}>
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="none" width="40px"></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Required</TableCell>
                <TableCell>Options</TableCell>
                <TableCell padding="none" width="40px"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <SortableContext 
                items={(field.columns || []).map((_, i) => `column-${i}`)} 
                strategy={verticalListSortingStrategy}
              >
                {(field.columns || []).map((column, index) => (
                  <SortableColumnRow
                    key={`column-${index}`}
                    column={column}
                    index={index}
                    onUpdate={handleUpdateColumn}
                    onDelete={handleDeleteColumn}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </TableContainer>
      
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAddColumn}
        size="small"
        sx={{ mt: 1 }}
      >
        Add Column
      </Button>
    </Box>
  );
};

export default GridFieldSetup;