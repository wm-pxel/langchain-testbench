import { createContext, useEffect, useState } from "react";
import { LLM } from "../model/llm";
import { defaultLLMs } from "../model/llm";

export interface LLMContextType {
  llms: Record<string, LLM>;
  addLLM: (type: string) => void;
  updateLLM: (index: number, name: string, llm: LLM) => void;
  deleteLLM: (name: string) => void;
  setLLMs: (llms: Record<string, LLM>) => void;
  latestLLMs: () => Record<string, LLM>;
  LLMsNeedSave: boolean;
  isEditingLLMs: boolean;
  setIsEditingLLMs: (isEditingLLMs: boolean) => void;
}

export const LLMContext = createContext<LLMContextType>({
  llms: {},
  addLLM: (_: string) => {},
  updateLLM: (_: number, __: string, ___: LLM) => {},
  deleteLLM: (_: string) => {},
  setLLMs: (_: Record<string, LLM>) => {},
  latestLLMs: () => ({}),
  isEditingLLMs: false,
  LLMsNeedSave: false,
  setIsEditingLLMs: (_: boolean) => {},
});

export interface LLMProviderProps {
  children: React.ReactNode;
}

export const LLMContextProvider: React.FC<LLMProviderProps> = ({ children }) => {
  const [llms, setLLMs] = useState<Record<string, LLM>>(defaultLLMs);
  const [dirtyLLMs, setDirtyLLMs] = useState<Record<string, LLM>>({});
  const [isEditingLLMs, setIsEditingLLMs] = useState<boolean>(false);
  const [LLMsNeedSave, setLLMsNeedSave] = useState<boolean>(false);

  const updateLLM = (index: number, name: string, llm: LLM): void => {
    const entries = Object.entries(dirtyLLMs);
    setDirtyLLMs(Object.fromEntries([
      ...entries.slice(0, index),
      [name, llm],
      ...entries.slice(index + 1)
    ]));
  }

  const setBothLLMs = (newLLMs: Record<string, LLM>) => {
    setLLMs(newLLMs);
    setDirtyLLMs(newLLMs);
  }

  useEffect(() => {
    setLLMsNeedSave(JSON.stringify(llms) !== JSON.stringify(dirtyLLMs));
  }, [llms, dirtyLLMs]);

  const deleteLLM = (name: string): void => {
    const newLLMs = {...llms};
    delete newLLMs[name];
    setBothLLMs(newLLMs);
  }

  const latestLLMs = (): Record<string, LLM> => {
    setLLMs(dirtyLLMs);
    return dirtyLLMs;
  }

  const addLLM = (llmType: string) => (setBothLLMs({
    ...dirtyLLMs,
    [`llm-${Object.keys(dirtyLLMs).length}`]: defaultLLM(llmType),
  }));

  const defaultLLM = (llmType: string): LLM => {
    switch (llmType) {
      case "openai_llm":
        return {
          llm_type: "openai_llm",
          model_name: "text-davinci-003",
          temperature: 0.8,
          max_tokens: 256,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
          n: 1,
          best_of: 1,
          request_timeout: null,
          logit_bias: {}
        }
      case "huggingface_hub_llm":
        return {
          llm_type: "huggingface_hub_llm",
          repo_id: "google/flan-t5-xxl",
          task: null,
          model_kwargs: {
            temperature: 0.8,
            max_length: 256,
            min_new_tokens: 128,
            max_time: 60,
          },
        }
    }
    throw new Error(`Unknown LLM type: ${llmType}`);
  };

  return (
    <LLMContext.Provider value={{ 
      llms,
      addLLM,
      updateLLM,
      deleteLLM,
      setLLMs: setBothLLMs,
      latestLLMs,
      isEditingLLMs,
      setIsEditingLLMs,
      LLMsNeedSave,
    }}>
      {children}
    </LLMContext.Provider>
  );
};

export default LLMContextProvider;
