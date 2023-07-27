// This React component acts as a form control to edit a object of key value pairs. It accepts an object as a parameter, allows editing of all key value pairs and provides controls to add and remove pairs.
import React, { useState, useEffect } from "react";
import "../style/ParameterEditor.scss";

interface ParameterEditorProps {
  editorKey: string,
  parameters: Record<string, string>,
  onChange: (parameters: Record<string, string>) => void
}

const ParameterEditor: React.FC<ParameterEditorProps> = ({ editorKey, parameters, onChange }) => {
  const [entries, setEntries] = useState<[string, string][]>(Object.entries(parameters));

  useEffect(() => {
    onChange(Object.fromEntries(entries));
  }, [entries]);

  const updateEntry = (idx: number, key: string, value: string) => (
    setEntries([...entries.slice(0,idx), [key, value], ...entries.slice(idx+1)])
  )
  
  const removeEntry = (idx: number) => (
    setEntries([...entries.slice(0,idx), ...entries.slice(idx+1)])
  )

  return (
    <div className="parameter-editor">
      {entries.map(([key, value], idx) => (
        <div className="form-element" key={`${editorKey}-${idx}`}>
          <input className="text-input key" value={key} onChange={e => updateEntry(idx, e.target.value, value)} />
          <input className="text-input value" value={value} onChange={e => updateEntry(idx, key, e.target.value)} />
          <button onClick={() => removeEntry(idx)}>x</button>
        </div>
      ))}
      <button className="add-button" onClick={() => setEntries([...entries, [`key${entries.length+1}`, ""]])}>+</button>
    </div>
  )
}

export default ParameterEditor;