import { FunctionParameter, LLMFunction } from "../../model/llm";

interface FunctionSpecDesignerProps {
  functionItems: LLMFunction[];
  updateData: (data: LLMFunction[]) => void;
}

const FunctionSpecDesigner = ({ functionItems, updateData }: FunctionSpecDesignerProps) => {
  const addFunctionItem = () => {
    const newItem: LLMFunction = {
      id: Date.now(),
      name: "",
      description: "",
      parameters: {},
    };
    updateData([...functionItems, newItem]);
  };

  const deleteFunctionItem = (itemId: number) => {
    const updatedItems = functionItems.filter((item) => item.id !== itemId);
    updateData(updatedItems);
  };

  const addParameter = (updatedItem: LLMFunction) => {
    if (updatedItem) {
      const newParameter: FunctionParameter = {
        id: Date.now(),
        type: "string",
        description: "",
      };
      const paramKey = `param_${Date.now().toString()}`;
      updatedItem.parameters[paramKey] = newParameter;
      const items =  functionItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      updateData([...items]);
    }
  };

  const deleteParameter = (updatedItem: LLMFunction, paramKey: string) => {
    if (updatedItem) {
      delete updatedItem.parameters[paramKey];
      const items =  functionItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      updateData([...items]);
    }
  };

  const handleParameterNameChange = (updatedItem: LLMFunction, paramKey: string, newName: string) => {
    if (updatedItem) {
      const paramValue = updatedItem.parameters[paramKey];
      delete updatedItem.parameters[paramKey]; // Delete the old key
      updatedItem.parameters[newName] = paramValue; // Create a new key with the updated name
      const items =  functionItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      updateData([...items]);
    }
  };

  const handleParameterTypeChange = (
    updatedItem: LLMFunction,
    paramKey: string,
    newType: "string" | "number"
  ) => {
    if (updatedItem) {
      updatedItem.parameters[paramKey].type = newType;
      const items =  functionItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      updateData([...items]);
    }
  };

  const handleParameterDescriptionChange = (
    updatedItem: LLMFunction, 
    paramKey: string,
    newDescription: string
  ) => {
    if (updatedItem) {
      updatedItem.parameters[paramKey].description = newDescription;
      const items =  functionItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      updateData([...items]);
    }
  };

  return (
    <div>
      <button className="llm-function-text" onClick={addFunctionItem}>
        + Add Function
      </button>
      {functionItems.map((item) => (
        <div key={item.id}>
          <div className="llm-params">
            <div className="llm-param">
              <div className="llm-param-name">
                function name
                <button
                  style={{ marginLeft: "160px" }}
                  onClick={() => deleteFunctionItem(item.id)}
                >
                  -
                </button>
              </div>
              <input
                type="text"
                className="llm-param-value"
                value={item.name}
                onChange={(e) => {
                  item.name = e.target.value;
                  updateData([...functionItems]);
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
                  updateData([...functionItems]);
                }}
              />
            </div>
            <button className="llm-function-text" onClick={() => addParameter(item)}>
              + Add Parameter
            </button>
          </div>

          {item &&
            Object.keys(item.parameters).map((paramKey) => {
              const param = item.parameters[paramKey];
              return (
                <div key={param.id}>
                  <div className="llm-params">
                    <div className="llm-param">
                      <div className="llm-param-name">parameter name</div>
                      <input
                        type="text"
                        className="llm-param-value"
                        value={paramKey} // Display the parameter name (key)
                        onChange={(e) => handleParameterNameChange(item, paramKey, e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="llm-param">
                    <div className="llm-param-name">parameter description</div>
                    <input
                      type="text"
                      className="llm-param-value"
                      value={param.description}
                      onChange={(e) =>
                        handleParameterDescriptionChange(
                          item,
                          paramKey,
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="llm-param">
                    <select
                      value={param.type}
                      onChange={(e) =>
                        handleParameterTypeChange(
                          item,
                          paramKey,
                          e.target.value as "string" | "number"
                        )
                      }
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                    </select>
                    <button onClick={() => deleteParameter(item, paramKey)}>-</button>
                  </div>
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
};

export default FunctionSpecDesigner;
