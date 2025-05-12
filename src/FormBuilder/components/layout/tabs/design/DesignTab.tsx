import React from 'react';
import {
  Box,
  useTheme
} from '@mui/material';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from 'react-resizable-panels';
import { Field, Form, Section } from '../../../../../types';
import ComponentsPanel from './panels/ComponentsPanel';
import FormCanvasPanel from './panels/FormCanvasPanel';
import PropertiesPanel from './panels/PropertiesPanel';

// ResizeHandle component
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

interface DesignTabProps {
  form: Form;
  panelSizes: number[];
  setPanelSizes: (sizes: number[]) => void;
  fieldTypes: Field['type'][];
  selectedItem: any;
  setSelectedItem: (item: any) => void;
  activeDropSection: number | string | null;
  activeField: {field: Field; id: string; sectionIndex: number} | null;
  dropIndicator: {sectionIndex: number; fieldIndex: number; nestedIndex?: number} | null;
  recentlyAddedField: {
    sectionIndex: number;
    fieldIndex: number;
    nestedIndex?: number;
    timestamp: number;
  } | null;
  addSection: () => void;
  updateSection: (index: number, updatedSection: Section) => void;
  updateField: (sectionIndex: number, fieldIndex: number, updatedField: Field) => void;
  handleDeleteSectionClick: (sectionIndex: number, event: React.MouseEvent) => void;
  moveSectionUp: (sectionIndex: number, e?: React.MouseEvent) => void;
  moveSectionDown: (sectionIndex: number, event: React.MouseEvent) => void;
  handleNestedSectionUp: (sectionIndex: number, nestedIndex: number, e: React.MouseEvent) => void;
  handleNestedSectionDown: (sectionIndex: number, nestedIndex: number, e: React.MouseEvent) => void;
  handleNestedSectionSelect: (sectionIndex: number, nestedIndex: number) => void;
  handleDeleteNestedSection: (sectionIndex: number, nestedIndex: number, e: React.MouseEvent) => void;
  getFieldIds: (sectionIndex: number) => string[];
  getSectionIds: () => string[];
  getNestedFieldIds: (sectionIndex: number, nestedIndex: number) => string[];
  handleFieldSelect: (sectionIndex: number, fieldIndex: number, event: React.MouseEvent) => void;
  removeField: (sectionIndex: number, fieldIndex: number, event: React.MouseEvent) => void;
  moveFieldUp: (sectionIndex: number, fieldIndex: number, e: React.MouseEvent) => void;
  moveFieldDown: (sectionIndex: number, fieldIndex: number, e: React.MouseEvent) => void;
  handleNestedFieldSelect: (sectionIndex: number, nestedIndex: number, fieldIndex: number, event: React.MouseEvent) => void;
  removeNestedField: (sectionIndex: number, nestedIndex: number, fieldIndex: number, event: React.MouseEvent) => void;
  moveNestedFieldUp: (sectionIndex: number, nestedIndex: number, fieldIndex: number, e: React.MouseEvent) => void;
  moveNestedFieldDown: (sectionIndex: number, nestedIndex: number, fieldIndex: number, e: React.MouseEvent) => void;
  getAvailableFieldsForSection: (sectionIndex: number) => Array<{ name: string; label?: string; parentSection?: string; nestedSection?: string; nestedIndex?: number; }>;
  getAvailableFieldsForNestedSection: (sectionIndex: number, nestedIndex: number) => Array<{ name: string; label?: string; parentSection?: string; nestedSection?: string; nestedIndex?: number; }>;
}

const DesignTab: React.FC<DesignTabProps> = ({
  form,
  panelSizes,
  setPanelSizes,
  fieldTypes,
  selectedItem,
  setSelectedItem,
  activeDropSection,
  activeField,
  dropIndicator,
  recentlyAddedField,
  addSection,
  updateSection,
  updateField,
  handleDeleteSectionClick,
  moveSectionUp,
  moveSectionDown,
  handleNestedSectionUp,
  handleNestedSectionDown,
  handleNestedSectionSelect,
  handleDeleteNestedSection,
  getFieldIds,
  getSectionIds,
  getNestedFieldIds,
  handleFieldSelect,
  removeField,
  moveFieldUp,
  moveFieldDown,
  handleNestedFieldSelect,
  removeNestedField,
  moveNestedFieldUp,
  moveNestedFieldDown,
  getAvailableFieldsForSection,
  getAvailableFieldsForNestedSection
}) => {
  return (
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
        <ComponentsPanel 
          fieldTypes={fieldTypes}
          addSection={addSection}
        />
      </Panel>

      <ResizeHandle />

      {/* Middle panel - Form Canvas */}
      <Panel defaultSize={panelSizes[1]} minSize={30}>
        <FormCanvasPanel 
          form={form}
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
        />
      </Panel>
      
      <ResizeHandle />

      {/* Right panel - Properties */}
      <Panel defaultSize={panelSizes[2]} minSize={15} maxSize={40}>
        <PropertiesPanel 
          selectedItem={selectedItem}
          form={form}
          updateField={updateField}
          updateSection={updateSection}
          getAvailableFieldsForSection={getAvailableFieldsForSection}
          getAvailableFieldsForNestedSection={getAvailableFieldsForNestedSection}
        />
      </Panel>
    </PanelGroup>
  );
};

export default DesignTab;
