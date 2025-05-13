export interface DependencyNode {
  id: string;
  type: 'section' | 'field';
  label: string;
  parentId?: string;
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;
  condition: string;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface Condition {
  field: string;
  equals: string;
}

export type FieldType = 'text' | 'number' | 'dropdown' | 'radio' | 'textarea' | 'checkbox' | 'grid' | 'date';

// Base field interface with common properties
export interface BaseField {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  tooltip?: string;
  required?: boolean;
}

// Text field type
export interface TextField extends BaseField {
  type: 'text' | 'textarea';
  minLength?: string | number;
  maxLength?: string | number;
  pattern?: string;
}

// Number field type
export interface NumberField extends BaseField {
  type: 'number';
  min?: string | number;
  max?: string | number;
}

// Options field base type (for fields with selections)
export interface OptionsFieldBase extends BaseField {
  options: string[];
}

// Dropdown field type
export interface DropdownField extends OptionsFieldBase {
  type: 'dropdown';
}

// Radio field type
export interface RadioField extends OptionsFieldBase {
  type: 'radio';
}

// Checkbox field type
export interface CheckboxField extends BaseField {
  type: 'checkbox';
}

// Date field type
export interface DateField extends BaseField {
  type: 'date';
  min?: string; // Minimum date in YYYY-MM-DD format
  max?: string; // Maximum date in YYYY-MM-DD format
  dateFormat?: string; // Optional format specification (e.g., 'YYYY-MM-DD')
}

// Column definition for grid
export interface GridColumn {
  name: string;
  type: Exclude<FieldType, 'grid'>;
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

// Grid field type
export interface GridField extends BaseField {
  type: 'grid';
  columns: GridColumn[];  // Keep required here
  data?: Array<Record<string, string>>;
  defaultRows?: number;
}

// Union type that can be any field type
export type Field = 
  | TextField 
  | NumberField 
  | DropdownField 
  | RadioField 
  | CheckboxField 
  | GridField
  | DateField;

export interface GridValue {
  rows: Record<string, any>[];
}

export interface Section {
  id: string; // Add unique ID for each section
  name: string; // Display name (UI)
  objectName: string; // Name used in data model
  fields: Field[];
  conditionField?: string;
  conditionValue?: string;
  isSubSection?: boolean;
  nestedSections?: Section[]; // Support for nested sections
  parentId?: string; // ID of parent section (null for top-level)
}

export interface Form {
  sections: Section[];
}

// Type guard functions to check field types
export function isTextField(field: Field): field is TextField {
  return field.type === 'text' || field.type === 'textarea';
}

export function isNumberField(field: Field): field is NumberField {
  return field.type === 'number';
}

export function isDropdownField(field: Field): field is DropdownField {
  return field.type === 'dropdown';
}

export function isRadioField(field: Field): field is RadioField {
  return field.type === 'radio';
}

export function isCheckboxField(field: Field): field is CheckboxField {
  return field.type === 'checkbox';
}

export function isGridField(field: Field): field is GridField {
  return field.type === 'grid';
}

export function isDateField(field: Field): field is DateField {
  return field.type === 'date';
}

