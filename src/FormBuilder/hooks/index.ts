import { useState } from 'react';

// Example hook for form builder
export const useFormBuilder = () => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditMode = () => {
    setIsEditing(prev => !prev);
  };

  return {
    isEditing,
    toggleEditMode
  };
};
