import { JSX } from 'react';
import { Field, Section } from '../../types';

export interface IFormAdapter {
  renderField(field: Field, props: FieldProps): JSX.Element;
  renderSection(section: Section, props: SectionProps): JSX.Element;
}

export interface FieldProps {
  value: any;
  onChange: (name: string, value: any) => void;
  onBlur: () => void;
  error?: string;
  touched: boolean;
}

export interface SectionProps {
  renderFields: (fields: Field[]) => JSX.Element[];
  renderSections: (sections: Section[], level: number) => JSX.Element[];
  level: number;
}
