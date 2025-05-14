import React from 'react';
import { Box, Paper } from '@mui/material';
import { Form } from '../../../../types';
import FormRenderer from '../../../../FormRenderer';

interface PreviewTabProps {
  formSchema: Form;
  previewMode?: 'desktop' | 'mobile' | 'tablet';
}

const PreviewTab: React.FC<PreviewTabProps> = ({ 
  formSchema, 
  previewMode = 'desktop' 
}) => {
  // Calculate width based on preview mode
  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      default:
        return '900px';
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100%', 
        p: 2, 
        backgroundColor: 'grey.50',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          height: '100%', 
          width: getPreviewWidth(),
          maxWidth: '100%',
          borderRadius: 2,
          overflow: 'auto'
        }}
      >
        <FormRenderer
          form={formSchema}
          onSubmit={(data: Record<string, any>) => console.log('Form Data:', data)}
        />
      </Paper>
    </Box>
  );
};

export default PreviewTab;
