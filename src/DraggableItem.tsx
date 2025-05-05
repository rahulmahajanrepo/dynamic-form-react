import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Chip } from '@mui/material';

interface DraggableItemProps {
  type: string;
  name: string;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ type, name }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${name}`,
    data: {
      type: type,
      name: name
    }
  });

  return (
    <Chip
      ref={setNodeRef}
      label={name}
      sx={{ 
        mb: 1, 
        cursor: 'move', 
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none' // Prevents touch scrolling while dragging on mobile
      }}
      {...listeners}
      {...attributes}
    />
  );
};

export default DraggableItem;