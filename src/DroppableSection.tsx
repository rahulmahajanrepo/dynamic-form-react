import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Typography } from '@mui/material';
import { Field, Section } from './types';

interface DroppableSectionProps {
  section: Section;
  index: number;
  onDropField: (sectionIndex: number, fieldType: Field['type']) => void;
  setSelectedItem: React.Dispatch<React.SetStateAction<any>>;
}

const DroppableSection: React.FC<DroppableSectionProps> = ({ section, index, onDropField, setSelectedItem }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `section-${index}`,
    data: {
      sectionIndex: index
    }
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        padding: '16px',
        border: `2px dashed ${isOver ? 'blue' : 'gray'}`,
        backgroundColor: isOver ? 'rgba(0, 0, 255, 0.05)' : 'transparent',
      }}
    >
      <Typography variant="h6">{section.name}</Typography>
      {section.fields.map((field, fieldIndex) => (
        <div 
          key={fieldIndex}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem({ type: 'field', sectionIndex: index, fieldIndex });
          }}
          style={{ 
            padding: '8px', 
            margin: '8px 0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          <Typography variant="body1">{field.label} ({field.type})</Typography>
        </div>
      ))}
      {section.fields.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Drop fields here
        </Typography>
      )}
    </div>
  );
};

export default DroppableSection;