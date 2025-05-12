import React from "react";
import { Field } from "./types";

interface FieldRendererProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
}) => {
  const renderField = () => {
    switch (field.type) {
      case "text":
      case "number":
        return (
          <input
            type={field.type}
            value={value || ""}
            onChange={(e) =>
              onChange(field.type === "number" ? Number(e.target.value) : e.target.value)
            }
            placeholder={field.placeholder}
          />
        );
      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case "dropdown":
        return (
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
          />
        );
      case "radio":
        return (
          <div>
            {field.options?.map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                />
                {option}
              </label>
            ))}
          </div>
        );
      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label>{field.label || field.name}</label>
      {renderField()}
      {error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  );
};

export default FieldRenderer;