export interface Condition {
  field: string;
  equals: string;
}

export type FieldType = 'text' | 'number' | 'dropdown' | 'radio' | 'textarea' | 'password' | 'checkbox' | 'grid';

export interface Validation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface GridColumn {
  name: string;
  type: Exclude<FieldType, 'grid'>;
  options?: string[]; // For dropdown/radio columns
  required?: boolean;
  placeholder?: string;
}

export interface Field {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  tooltip?: string; // Add tooltip property
  required?: boolean;
  // Text field properties
  minLength?: string | number;
  maxLength?: string | number;
  pattern?: string;
  // Number field properties
  min?: string | number;
  max?: string | number;
  // Dropdown/Radio field properties
  options?: string[];
  // Grid field properties
  columns?: GridColumn[];
  // Grid data storage
  data?: Array<Record<string, string>>;
  // Default initial value for grid
  defaultRows?: number;
}

// Update the grid field type in your Field type definition
type GridField = {
  type: 'grid';
  name: string;
  label: string;
  required?: boolean;
  tooltip?: string;
  columns: Array<{
    name: string;
    type: 'text' | 'number' | 'dropdown';
    options?: string[]; // For dropdown columns
  }>;
  data: Array<Record<string, string>>;
};

export interface GridValue {
  rows: Record<string, any>[];
}

export interface Section {
  name: string;
  fields: Field[];
  conditionField?: string;
  conditionValue?: string;
  isSubSection?: boolean; // New property
}

export interface Form {
  sections: Section[];
}
