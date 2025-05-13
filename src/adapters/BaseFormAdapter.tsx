import React from 'react';
import { Field, Section } from '../types';

export abstract class BaseFormAdapter {
  abstract renderField(field: Field, props: any): React.ReactNode;
  abstract renderSection(section: Section, props: any): React.ReactNode;
}
