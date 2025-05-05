// Create a new file: src/DataGrid.tsx
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TextField, 
  IconButton,
  Button,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { GridColumn } from './types';

interface DataGridProps {
  columns: GridColumn[];
  rows: Record<string, string>[];
  onChange: (updatedRows: Record<string, string>[]) => void;
}

const DataGrid: React.FC<DataGridProps> = ({ columns, rows, onChange }) => {
  // Add an empty row to the grid
  const handleAddRow = () => {
    const emptyRow = columns.reduce((acc, col) => {
      acc[col.name] = '';
      return acc;
    }, {} as Record<string, string>);
    
    onChange([...rows, emptyRow]);
  };

  // Remove a row from the grid
  const handleRemoveRow = (indexToRemove: number) => {
    onChange(rows.filter((_, index) => index !== indexToRemove));
  };

  // Update a cell value
  const handleCellChange = (rowIndex: number, columnName: string, value: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [columnName]: value
    };
    onChange(updatedRows);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.name}>{column.name}</TableCell>
              ))}
              <TableCell width={50} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={`${rowIndex}-${column.name}`}>
                    {column.type === 'dropdown' ? (
                      <Select
                        fullWidth
                        size="small"
                        value={row[column.name] || ''}
                        onChange={(e) => handleCellChange(rowIndex, column.name, e.target.value)}
                      >
                        {column.options?.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        type={column.type}
                        value={row[column.name] || ''}
                        onChange={(e) => handleCellChange(rowIndex, column.name, e.target.value)}
                      />
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleRemoveRow(rowIndex)}
                    sx={{ p: 0.5 }}
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
        startIcon={<AddIcon />}
        onClick={handleAddRow}
        variant="outlined"
        size="small"
      >
        Add Row
      </Button>
    </Box>
  );
};

export default DataGrid;