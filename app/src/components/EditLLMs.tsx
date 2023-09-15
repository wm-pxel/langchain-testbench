import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { LLMContext } from "../contexts/LLMContext";
import { HuggingFaceHubLLM, LLM, OpenAILLM, ChatOpenAILLM, LLMFunction } from "../model/llm";
import "./style/EditLLMs.scss";
import QuickMenu from "./QuickMenu";
import FunctionSpecDesigner from "./designers/FunctionSpecDesigner";

export interface OpenAILLMEditorProps {
  llmKey: string;
  llm: OpenAILLM;
  updateLLM: (llmKey: string, llm: LLM) => void;
}

const OpenAILLMEditor = ({ llmKey, llm, updateLLM }: OpenAILLMEditorProps) => {
  const [name, setName] = useState(llmKey);
  const [modelName, setModelName] = useState(llm.model_name);
  const [temperature, setTemperature] = useState<number>(llm.temperature);
  const [maxTokens, setMaxTokens] = useState<number>(llm.max_tokens);
  const [topP, setTopP] = useState<number>(llm.top_p);
  const [frequencyPenalty, setFrequencyPenalty] = useState<number>(
    llm.frequency_penalty
  );
  const [presencePenalty, setPresencePenalty] = useState<number>(
    llm.presence_penalty
  );

  useEffect((): void => {
    updateLLM(name, {
      model_name: modelName,
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      n: 1,
      request_timeout: null,
      logit_bias: {},
      llm_type: "openai",
    });
  }, [
    name,
    modelName,
    temperature,
    maxTokens,
    topP,
    frequencyPenalty,
    presencePenalty,
  ]);

  useEffect((): void => {
    setName(llmKey);
    setModelName(llm.model_name);
    setTemperature(llm.temperature);
    setMaxTokens(llm.max_tokens);
    setTopP(llm.top_p);
    setFrequencyPenalty(llm.frequency_penalty);
    setPresencePenalty(llm.presence_penalty);
  }, [llm]);

  useEffect((): void => {
    setName(llmKey);
  }, [llmKey]);

  return (
    <div className="llm">
      <div className="llm-key">
        <input
          type="text"
          className="llm-key-input"
          defaultValue={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="llm-params">
        <div className="llm-param">
          <div className="llm-param-name">model name</div>
          <input
            type="text"
            className="llm-param-value"
            defaultValue={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />
        </div>
        <div className="llm-param">
          <div className="llm-param-name">temperature</div>
          <input
            type="text"
            className="llm-param-value"
            defaultValue={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
          />
        </div>
        <div className="llm-param">
          <div className="llm-param-name">max tokens</div>
          <input
            type="text"
            className="llm-param-value"
            defaultValue={maxTokens}
            onChange={(e) => setMaxTokens(parseFloat(e.target.value))}
          />
        </div>
        <div className="llm-param">
          <div className="llm-param-name">top p</div>
          <input
            type="text"
            className="llm-param-value"
            defaultValue={topP}
            onChange={(e) => setTopP(parseFloat(e.target.value))}
          />
        </div>
        <div className="llm-param">
          <div className="llm-param-name">frequency penalty</div>
          <input
            type="text"
            className="llm-param-value"
            defaultValue={frequencyPenalty}
            onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
          />
        </div>
        <div className="llm-param">
          <div className="llm-param-name">presence penalty</div>
          <input
            type="text"
            className="llm-param-value"
            defaultValue={presencePenalty}
            onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export interface HuggingFaceHubLLMEditorProps {
  llmKey: string;
  llm: HuggingFaceHubLLM;
  updateLLM: (llmKey: string, llm: LLM) => void;
}

const HuggingFaceLLMEditor = ({
  llmKey,
  llm,
  updateLLM,
}: HuggingFaceHubLLMEditorProps) => {
  const [name, setName] = useState(llmKey);
  const [repoId, setRepoId] = useState(llm.repo_id);
  const [temperature, setTemperature] = useState<number>(
    llm.model_kwargs.temperature
  );
  const [maxLength, setMaxLength] = useState<number>(
    llm.model_kwargs.max_length
  );

  useEffect((): void => {
    updateLLM(name, {
      llm_type: "huggingface_hub",
      repo_id: repoId,
      task: null,
      model_kwargs: {
        temperature: temperature,
        max_length: maxLength,
      },
    });
  }, [name, repoId, temperature, maxLength]);

  useEffect((): void => {
    setRepoId(llm.repo_id);
    setTemperature(llm.model_kwargs.temperature);
    setMaxLength(llm.model_kwargs.max_length);
  }, [llm]);

  useEffect((): void => {
    setName(llmKey);
  }, [llmKey]);

  return (
    <div className="llm">
      <div className="llm-key">
        <input
          type="text"
          className="llm-key-input"
          defaultValue={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="llm-params">
        <div className="llm-param">
          <div className="llm-param-name">repo id</div>
          <input
            type="text"
            className="llm-param-value"
            defaultValue={repoId}
            onChange={(e) => setRepoId(e.target.value)}
          />
        </div>
        <div className="llm-param">
          <div className="llm-param-name">temperature</div>
          <input
            type="text"
            className="llm-param-value"
            defaultValue={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
          />
        </div>
        <div className="llm-param">
          <div className="llm-param-name">max length</div>
          <input
            type="text"
            className="llm-param-value"
            defaultValue={maxLength}
            onChange={(e) => setMaxLength(parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export interface ChatOpenAILLMEditorProps {
  llmKey: string;
  llm: ChatOpenAILLM;
  updateLLM: (llmKey: string, llm: LLM) => void;
}

const ChatOpenAILLMEditor = ({
  llmKey,
  llm,
  updateLLM,
}: ChatOpenAILLMEditorProps) => {
  const [name, setName] = useState(llmKey);
  const [modelName, setModelName] = useState(llm.model_name);
  const [temperature, setTemperature] = useState<number>(llm.temperature);
  const [maxTokens, setMaxTokens] = useState<number>(llm.max_tokens);
  const [functionItems, setFunctionItems] = useState<LLMFunction[]>(llm.functions);

  useEffect((): void => {
    updateLLM(name, {
      llm_type: "chat_openai",
      model_name: modelName,
      temperature: temperature,
      max_tokens: maxTokens,
      n: 1,
      request_timeout: null,
      functions: functionItems,
    });
    console.log('CRB ChatOpenAILLMEditor calling UpdateLLM ' + maxTokens + ' '  + JSON.stringify(functionItems))
  }, [name, modelName, temperature, maxTokens, functionItems]);

  useEffect((): void => {
    setName(llmKey);
    setModelName(llm.model_name);
    setTemperature(llm.temperature);
    setMaxTokens(llm.max_tokens);

    if (llm.functions != functionItems) {
      setFunctionItems(llm.functions);
    }
  }, [llm]);

  useEffect((): void => {
    setName(llmKey);
  }, [llmKey]);

  const updateFunctionItems = useCallback((items: LLMFunction[]) => {
    setFunctionItems(items);
  }, [setFunctionItems]);


  return (
    <div className="llm">
      <div>
        <div className="llm-key">
          <input
            type="text"
            className="llm-key-input"
            defaultValue={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="llm-params">
          <div className="llm-param">
            <div className="llm-param-name">model name</div>
            <input
              type="text"
              className="llm-param-value"
              defaultValue={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
          </div>
          <div className="llm-param">
            <div className="llm-param-name">temperature</div>
            <input
              type="text"
              className="llm-param-value"
              defaultValue={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
            />
          </div>
          <div className="llm-param">
            <div className="llm-param-name">max tokens</div>
            <input
              type="text"
              className="llm-param-value"
              defaultValue={maxTokens}
              onChange={(e) => setMaxTokens(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
      <div className="">
        <div>
          <div className="llm-param-name">functions</div>
          <FunctionSpecDesigner 
            functionItems={functionItems} 
            updateData={updateFunctionItems}/>
        </div>
      </div>
      <div className="llm-param">
            <div className="llm-param-name">max tokens</div>
            <input
              type="text"
              className="llm-param-value"
              defaultValue={maxTokens}
              onChange={(e) => setMaxTokens(parseFloat(e.target.value))}
            />
          </div>
    </div>
  );
};

const EditLLMs = () => {
  const { llms, addLLM, updateLLM, isEditingLLMs, setIsEditingLLMs } =
    useContext(LLMContext);
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
    setIsEditingLLMs(false);
  }, [setIsEditingLLMs]);

  return (
    <div
      className={`edit-llms ${visibilityState}`}
      ref={backgroundRef}
      onTransitionEnd={() => {
        if (!isEditingLLMs) setVisibilityState("absent");
      }}
    >
      <div className="edit-llms-header">
        <div className="spacer"></div>
        <h2>Edit LLMs</h2>
        <div className="spacer">
          <button className="close-modal" onClick={closeModal}>
            x
          </button>
        </div>
      </div>
      <div className="llms">
        {Object.entries(llms).map(([llmKey, llm], idx) => {
          if (llm.llm_type === "openai") {
            return (
              <OpenAILLMEditor
                key={llmKey}
                llmKey={llmKey}
                llm={llm}
                updateLLM={(name, llm) => updateLLM(idx, name, llm)}
              />
            );
          } else if (llm.llm_type === "huggingface_hub") {
            return (
              <HuggingFaceLLMEditor
                key={llmKey}
                llmKey={llmKey}
                llm={llm}
                updateLLM={(name, llm) => updateLLM(idx, name, llm)}
              />
            );
          } else if (llm.llm_type == "chat_openai") {
            return (
              <ChatOpenAILLMEditor
                key={llmKey}
                llmKey={llmKey}
                llm={llm}
                updateLLM={(name, llm) => updateLLM(idx, name, llm)}
              />
            );
          }
        })}
        <div className="llm-actions">
          <QuickMenu
            modalKey="add-llm-menu"
            selectValue={addLLM}
            options={{
              openai: "Open AI",
              huggingface_hub: "Hugging Face",
              chat_openai: "Chat GPT",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditLLMs;
