import { Field } from '../types';

// Helper function for generating unique IDs
export const generateFieldId = (): string => {
  return `field_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper for creating a new field with default values
export const createDefaultField = (type: string, label: string): Field => {
  return {
      id: generateFieldId(),
      type,
      label,
      required: false,
      // Add other default properties as needed
  } as unknown as Field;
};
