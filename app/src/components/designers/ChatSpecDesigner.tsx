import { useContext, useEffect, useMemo, useState } from "react";
import { ChatSpec } from "../../model/specs";
import ChainSpecContext from "../../contexts/ChainSpecContext";
import { LLMContext } from "../../contexts/LLMContext";
import FormatReducer from "../../util/FormatReducer";
import DeleteChainButton from "./DeleteChainButton";
import HighlightedTextarea from "../HighlightedTextarea";

interface ChatSpecDesignerProps {
  spec: ChatSpec;
}

const ChatSpecDesigner = ({ spec }: ChatSpecDesignerProps) => {
  const { llms } = useContext(LLMContext);
  const { updateChainSpec, deleteChainSpec } = useContext(ChainSpecContext);

  const [prompt, setPrompt] = useState<string>(spec.prompt);
  const [outputKey, setOutputKey] = useState<string>(spec.output_key);
  const [variables, setVariables] = useState<string[]>(spec.input_keys);
  const [llm, setLLM] = useState<string>(spec.llm_key);
  const [role, setRole] = useState<string>(spec.role);
  const [name, setName] = useState<string>(spec.name || '');

  const roles = ["user", "function", "assistant", "system", "other"];
  const formatReducer = useMemo(
    () =>
      new FormatReducer(
        /(\{\{)|\{(.*?)\}/g,
        () => new Set<string>(),
        (variables: Set<string>, _, escape, variable) =>
          escape
            ? [variables, escape]
            : [
                variables.add(variable),
                `<span class="expr">{<span class="var-name">${variable}</span>}</span>`,
              ],
        (variables: Set<string>) =>
          setTimeout(() => setVariables(Array.from(variables)), 0)
      ),
    []
  );

  useEffect(() => {
    updateChainSpec({
      ...spec,
      llm_key: llm,
      prompt,
      role,
      name,
      output_key: outputKey,
      input_keys: variables,
    });
  }, [llm, prompt, role, name, outputKey, variables]);

  useEffect(() => {
    setPrompt(spec.prompt);
    setRole(spec.role);
    setName(spec.name || '');
    setOutputKey(spec.output_key);
    setLLM(spec.llm_key);
    setVariables(spec.input_keys);
  }, [spec]);

  return (
    <div className="llm-spec spec-designer">
      <h3 className="chain-id">LLM {spec.chain_id}</h3>
      <DeleteChainButton
        modalKey={`delete-menu-${spec.chain_id}`}
        onDelete={() => deleteChainSpec(spec.chain_id)}
      />
      <HighlightedTextarea
        value={prompt}
        onChange={setPrompt}
        formatReducer={formatReducer}
        placeholder="Enter prompt here."
      />
      <div className="form-element">
        <label>role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {Object.values(roles).map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
      <div className="form-element">
        <label>name</label>
        <input
          className="var-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-element">
        <label>LLM</label>
        <select value={llm} onChange={(e) => setLLM(e.target.value)}>
          {Object.keys(llms).map((llm) => (
            <option key={llm} value={llm}>
              {llm}
            </option>
          ))}
        </select>
      </div>
      <div className="form-element">
        <label>Output Key</label>
        <input
          className="var-name-input"
          value={outputKey}
          onChange={(e) => setOutputKey(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ChatSpecDesigner;