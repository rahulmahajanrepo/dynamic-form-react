import { Section } from '../types';

export function isSectionVisible(section: Section, formValues: Record<string, any>): boolean {
  if (!section.conditionField || !section.conditionValue) {
    return true;
  }

  const fieldValue = formValues[section.conditionField];
  
  if (typeof fieldValue === 'string' && typeof section.conditionValue === 'string') {
    return fieldValue === section.conditionValue;
  }
  
  if (typeof fieldValue === 'boolean' && typeof section.conditionValue === 'string') {
    return fieldValue === (section.conditionValue.toLowerCase() === 'true');
  }
  
  if (typeof fieldValue === 'number' && typeof section.conditionValue === 'string') {
    return fieldValue === parseFloat(section.conditionValue);
  }
  
  return String(fieldValue) === String(section.conditionValue);
}
