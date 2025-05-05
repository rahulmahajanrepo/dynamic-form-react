import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Field, GridColumn, GridValue } from './types';

interface GridRendererProps {
  field: Field;
  value: GridValue;
  onChange: (value: GridValue) => void;
  disabled?: boolean;
}

const GridRenderer: React.FC<GridRendererProps> = ({ field, value, onChange, disabled = false }) => {
  const [rows, setRows] = useState<Record<string, any>[]>(value?.rows || []);

  // Initialize default rows if needed
  useEffect(() => {
    if (!value?.rows || value.rows.length === 0) {
      const defaultRowCount = field.defaultRows || 1;
      const emptyRows = Array(defaultRowCount).fill(0).map(() => ({}));
      setRows(emptyRows);
      onChange({ rows: emptyRows });
    }
  }, [field, value?.rows]);

  const handleAddRow = () => {
    const newRows = [...rows, {}];
    setRows(newRows);
    onChange({ rows: newRows });
  };

  const handleRemoveRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
    onChange({ rows: newRows });
  };

  const handleCellChange = (rowIndex: number, columnName: string, newValue: any) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [columnName]: newValue };
    setRows(newRows);
    onChange({ rows: newRows });
  };

  const renderCell = (column: GridColumn, rowIndex: number) => {
    const value = rows[rowIndex]?.[column.name] || '';
    
    switch (column.type) {
      case 'text':
      case 'textarea':
        return (
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            value={value}
            onChange={(e) => handleCellChange(rowIndex, column.name, e.target.value)}
            multiline={column.type === 'textarea'}
            rows={column.type === 'textarea' ? 2 : undefined}
            disabled={disabled}
            required={column.required}
          />
        );
      
      case 'number':
        return (
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            type="number"
            value={value}
            onChange={(e) => handleCellChange(rowIndex, column.name, e.target.value)}
            disabled={disabled}
            required={column.required}
          />
        );
      
      case 'dropdown':
        return (
          <Select
            fullWidth
            size="small"
            value={value || ''}
            onChange={(e) => handleCellChange(rowIndex, column.name, e.target.value)}
            disabled={disabled}
            required={column.required}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {column.options?.map((option, i) => (
              <MenuItem key={i} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        );
      
      case 'radio':
        return (
          <RadioGroup
            row
            value={value || ''}
            onChange={(e) => handleCellChange(rowIndex, column.name, e.target.value)}
          >
            {column.options?.map((option, i) => (
              <FormControlLabel
                key={i}
                value={option}
                control={<Radio size="small" disabled={disabled} />}
                label={option}
                disabled={disabled}
              />
            ))}
          </RadioGroup>
        );
      
      case 'checkbox':
        return (
          <Checkbox
            checked={!!value}
            onChange={(e) => handleCellChange(rowIndex, column.name, e.target.checked)}
            disabled={disabled}
            required={column.required}
          />
        );
      
      default:
        return <Typography color="error">Unknown cell type: {column.type}</Typography>;
    }
  };

  if (!field.columns || field.columns.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="textSecondary">
          No columns configured for this grid.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        {field.label}
        {field.required && <Typography component="span" color="error">*</Typography>}
      </Typography>
      
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {field.columns.map((column, index) => (
                <TableCell key={index}>
                  {column.name}
                  {column.required && <Typography component="span" color="error">*</Typography>}
                </TableCell>
              ))}
              <TableCell padding="none" width="50px" align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {field.columns!.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {renderCell(column, rowIndex)}
                  </TableCell>
                ))}
                <TableCell padding="none" align="center">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveRow(rowIndex)}
                    disabled={disabled || rows.length <= 1}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAddRow}
        disabled={disabled}
        size="small"
        sx={{ mt: 1 }}
      >
        Add Row
      </Button>
    </Box>
  );
};

export default GridRenderer;