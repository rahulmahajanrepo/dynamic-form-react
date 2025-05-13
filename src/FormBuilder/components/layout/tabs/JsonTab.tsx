import React, { useState } from "react";
import { Form } from "../../../../types";
import { Box, Button, Paper, Typography, useTheme } from "@mui/material";
import Editor from "@monaco-editor/react";

interface JsonTabProps {
  form: Form;
  setForm?: (form: Form) => void;
}

const JsonTab: React.FC<JsonTabProps> = ({ form, setForm }) => {
  const theme = useTheme();
  const [configError, setConfigError] = useState<string | null>(null);

  // Function to handle editor content changes
  const handleEditorChange = (value: string | undefined) => {
    if (!value || !setForm) return;
    
    try {
      const parsed = JSON.parse(value);
      setForm(parsed);
      setConfigError(null);
    } catch (error) {
      setConfigError('Invalid JSON format');
    }
  };

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
        
        {/* Monaco Editor for JSON editing */}
        <Box sx={{ flex: 1, borderRadius: '4px', overflow: 'hidden' }}>
          <Editor
            height="100%"
            defaultLanguage="json"
            defaultValue={JSON.stringify(form, null, 2)}
            value={JSON.stringify(form, null, 2)}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              tabSize: 2,
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              scrollbar: {
                useShadows: false,
                verticalScrollbarSize: 14,
                horizontalScrollbarSize: 14,
              },
              wordWrap: "on"
            }}
            theme="vs-dark"
          />
        </Box>
        
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
