import React, { useState } from "react";
import Playground from "./Playground";
import FormRenderer from "./FormRenderer";
import { Form } from "./types";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const App: React.FC = () => {
  const [loadedForm, setLoadedForm] = useState<Form | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setLoadedForm(json);
        } catch (error) {
          console.error("Invalid JSON file", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <LocalizationProvider 
      dateAdapter={AdapterDateFns}
      dateFormats={{ 
        keyboardDate: 'yyyy-MM-dd' 
      }}
    >
      <div>
        <Playground />
      </div>
    </LocalizationProvider>
  );
};

export default App;