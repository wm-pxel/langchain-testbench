import { useState } from "react";
import { FunctionParameter, LLMFunction } from "../../model/llm";


interface FunctionSpecDesignerProps {
  updateData: (data: LLMFunction[]) => void;
}

const FunctionSpecDesigner = ({ updateData }: FunctionSpecDesignerProps) => {
  const [functionItems, setFunctionItems] = useState<LLMFunction[]>([]);
  const [newFunctionItem, setNewFunctionItem] = useState<LLMFunction | null>(
    null
  );

  const addFunctionItem = () => {
    const newItem: LLMFunction = {
      id: Date.now(),
      name: "",
      description: "",
      parameters: [],
    };
    setFunctionItems([...functionItems, newItem]);
    updateData(functionItems);
    setNewFunctionItem(newItem);
  };

  const deleteFunctionItem = (itemId: number) => {
    const updatedItems = functionItems.filter((item) => item.id !== itemId);
    setFunctionItems(updatedItems);
    updateData(functionItems);
  };

  const addParameter = () => {
    if (newFunctionItem) {
      const newItem = { ...newFunctionItem };
      const newParameter: FunctionParameter = {
        name: "",
        type: "string",
      };
      newItem.parameters = [...newItem.parameters, newParameter];
      setNewFunctionItem(newItem);
      setFunctionItems((prevItems) =>
        prevItems.map((item) => (item.id === newItem.id ? newItem : item))
      );
      updateData(functionItems);
    }
  };

  const deleteParameter = (paramIndex: number) => {
    if (newFunctionItem) {
      const newItem = { ...newFunctionItem };
      newItem.parameters = newItem.parameters.filter(
        (_, index) => index !== paramIndex
      );
      setNewFunctionItem(newItem);
      setFunctionItems((prevItems) =>
        prevItems.map((item) => (item.id === newItem.id ? newItem : item))
      );
    }
  };

  return (
    <div>
      <button className="llm-function-text" onClick={addFunctionItem}>+ Add Function</button>
      {functionItems.map((item) => (
        <div key={item.id}>
          <div className="llm-params">
            <div className="llm-param">
              <div className="llm-param-name">function name
              <button style={{ marginLeft: '160px' }} onClick={() => deleteFunctionItem(item.id)}>-</button>
              </div>
              <input
                type="text"
                className="llm-param-value"
                value={item.name}
                onChange={(e) => {
                  item.name = e.target.value;
                  setFunctionItems([...functionItems]);
                  updateData(functionItems);
                }}
              />
            </div>
          </div>
          <div className="llm-params">
            <div className="llm-param">
              <div className="llm-param-name">function description</div>
              <textarea
                className="llm-param-value"
                value={item.description}
                onChange={(e) => {
                  item.description = e.target.value;
                  setFunctionItems([...functionItems]);
                  updateData(functionItems);
                }}
              />
            </div>
            <button className="llm-function-text" onClick={addParameter}>+ Add Parameter</button>
          </div>
          {item.parameters.map((param, paramIndex) => (
            <div key={paramIndex}>
              <input
                type="text"
                placeholder="Parameter Name"
                value={param.name}
                onChange={(e) => {
                  param.name = e.target.value;
                  setFunctionItems([...functionItems]);
                  updateData(functionItems);
                }}
              />
              <select
                value={param.type}
                onChange={(e) => {
                  param.type = e.target.value as "string" | "number";
                  setFunctionItems([...functionItems]);
                  updateData(functionItems);
                }}
              >
                <option value="string">String</option>
                <option value="number">Number</option>
              </select>
              <button onClick={() => deleteParameter(paramIndex)}>-</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FunctionSpecDesigner;
