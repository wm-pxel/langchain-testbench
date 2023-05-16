import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { LLMContext } from "../contexts/LLMContext";
import { LLM, OpenAILLM } from "../model/llm";
import "./style/EditLLMs.css";
import QuickMenu from "./QuickMenu";

export interface OpenAILLMEditorProps {
  llmKey: string,
  llm: OpenAILLM
  updateLLM: (llmKey: string, llm: LLM) => void
}

const OpenAILLMEditor = ({ llmKey, llm, updateLLM }: OpenAILLMEditorProps) => {
  const [name, setName] = useState(llmKey);
  const [modelName, setModelName] = useState(llm.model_name);
  const [temperature, setTemperature] = useState<number>(llm.temperature);
  const [maxTokens, setMaxTokens] = useState<number>(llm.max_tokens);
  const [topP, setTopP] = useState<number>(llm.top_p);
  const [frequencyPenalty, setFrequencyPenalty] = useState<number>(llm.frequency_penalty);
  const [presencePenalty, setPresencePenalty] = useState<number>(llm.presence_penalty);

  useEffect((): void => {
    updateLLM(name, { 
      _type: 'openai',
      model_name: modelName,
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      n: 1,
      best_of: 1,
      request_timeout: null,
      logit_bias: {},
    });
  }, [name, modelName, temperature, maxTokens, topP, frequencyPenalty, presencePenalty]);

  return (
    <div className="llm">
      <div className="llm-key">
        <input type="text" className="llm-key-input"
          defaultValue={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="llm-params">
        <div className="llm-param">
          <div className="llm-param-name">model name</div>
          <input type="text" className="llm-param-value"
            defaultValue={modelName} onChange={(e) => setModelName(e.target.value)} />
        </div>
        <div className="llm-param">
          <div className="llm-param-name">temperature</div>
          <input type="text" className="llm-param-value"
            defaultValue={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} />
        </div>
        <div className="llm-param">
          <div className="llm-param-name">max tokens</div>
          <input type="text" className="llm-param-value"
            defaultValue={maxTokens} onChange={(e) => setMaxTokens(parseFloat(e.target.value))} />
        </div>
        <div className="llm-param">
          <div className="llm-param-name">top p</div>
          <input type="text" className="llm-param-value"
            defaultValue={topP} onChange={(e) => setTopP(parseFloat(e.target.value))} />
        </div>
        <div className="llm-param">
          <div className="llm-param-name">frequency penalty</div>
          <input type="text" className="llm-param-value"
            defaultValue={frequencyPenalty} onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))} />
        </div>
        <div className="llm-param">
          <div className="llm-param-name">presence penalty</div>
          <input type="text" className="llm-param-value"
            defaultValue={presencePenalty} onChange={(e) => setPresencePenalty(parseFloat(e.target.value))} />
        </div>
      </div>
    </div>
  );
}

const EditLLMs = () => {
  const { llms, addLLM, updateLLM, latestLLMs, isEditingLLMs,  setIsEditingLLMs } = useContext(LLMContext);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [visibilityState, setVisibilityState] = useState("absent");


  useEffect(() => {
    if (isEditingLLMs) {
      backgroundRef.current?.offsetHeight; // force reflow
      if (visibilityState === "absent") setVisibilityState("hidden");
      else if (visibilityState === "hidden") setVisibilityState("visible");
    } else {
      if (visibilityState === "visible") setVisibilityState("hidden");
    }
  }, [isEditingLLMs, visibilityState]);

  const closeModal = useCallback(() => {
    latestLLMs(); // ensure latest changes are available in context
    setIsEditingLLMs(false);
  }, [setIsEditingLLMs, latestLLMs]);

  return (
    <div className={`edit-llms ${visibilityState}`}
      ref={backgroundRef}
      onTransitionEnd={() => { if (!isEditingLLMs) setVisibilityState('absent') }}>
      <div className="edit-llms-header">
        <div className="spacer"></div>
        <h2>Edit LLMs</h2>
        <div className="spacer">
          <button className="close-modal" onClick={closeModal}>x</button>
        </div>
      </div>
      <div className="llms">
        {Object.entries(llms).map(([llmKey, llm], idx) => {
          if (llm._type === 'openai') {
            return <OpenAILLMEditor key={llmKey} llmKey={llmKey} llm={llm} updateLLM={(name, llm) => updateLLM(idx, name, llm)} />
          }
          return <div key={llmKey}>Unknown LLM type: {llm._type}</div>
        })}
        <div className="llm-actions">
          <QuickMenu selectValue={addLLM} options={{ openai: 'Open AI' }} />
        </div>
      </div>
    </div>
  );
};

export default EditLLMs;