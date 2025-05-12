import React, { useState } from "react";
import { Form } from "../../../../types";
import { Box, Button, Paper, Typography, useTheme } from "@mui/material";

interface JsonTabProps {
  form: Form;
  setForm?: (form: Form) => void;
}

const JsonTab: React.FC<JsonTabProps> = ({ form, setForm }) => {
  const theme = useTheme();
  const [configError, setConfigError] = useState<string | null>(null);

  return (
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
              setForm && setForm(parsed);
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
  );
};

export default JsonTab;
