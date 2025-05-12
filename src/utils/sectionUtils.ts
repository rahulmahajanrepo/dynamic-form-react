import { Section, Form } from '../types';

/**
 * Sets the selected state for a section (including nested sections)
 * @param form The form containing all sections
 * @param sectionId The ID of the section to select
 * @param selected Whether to select or deselect the section
 * @returns A new form with updated selection states
 */
export const updateSectionSelection = (form: Form, sectionId: string, selected: boolean): Form => {
  // Creates a deep copy of the form to avoid mutating the original
  const updatedForm: Form = {
    sections: markSectionsSelected(form.sections, sectionId, selected)
  };
  
  return updatedForm;
};

/**
 * Recursively updates the selection state of sections and nested sections
 */
const markSectionsSelected = (sections: Section[], sectionId: string, selected: boolean): Section[] => {
  return sections.map(section => {
    // Check if this is the section to update
    if (section.id === sectionId) {
      return { ...section, isSelected: selected };
    }
    
    // If this section has nested sections, check them too
    if (section.nestedSections && section.nestedSections.length > 0) {
      return {
        ...section,
        nestedSections: markSectionsSelected(section.nestedSections, sectionId, selected)
      };
    }
    
    // If this isn't the section we're looking for, return it unchanged
    return section;
  });
};

/**
 * Clears selection from all sections and nested sections
 */
export const clearAllSelections = (form: Form): Form => {
  return {
    sections: clearSelectionRecursive(form.sections)
  };
};

/**
 * Recursively clears selection from all sections
 */
const clearSelectionRecursive = (sections: Section[]): Section[] => {
  return sections.map(section => ({
    ...section,
    isSelected: false,
    nestedSections: section.nestedSections ? clearSelectionRecursive(section.nestedSections) : undefined
  }));
};
