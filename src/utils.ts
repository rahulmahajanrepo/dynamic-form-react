// Utility function to format field name into a readable label
export const formatNameToLabel = (name: string): string => {
  // Handle camelCase
  const fromCamelCase = name.replace(/([A-Z])/g, ' $1')
    // Handle snake_case
    .replace(/_/g, ' ')
    // Handle numbers (add space before number)
    .replace(/(\d+)/g, ' $1')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove trailing numbers and underscores from auto-generated names
    .replace(/\s+\d+$/, '')
    // Trim and capitalize first letter of each word
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return fromCamelCase || name;
};