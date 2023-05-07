import React, { createContext, useState, useCallback } from "react";
import { ChainSpec } from "../model/specs";
import { insertChainSpec as insertGeneratedChainSpec, updateChainSpec } from "../model/spec_control";

export type ChainRetriever = () => ChainSpec | null;
export type UpdateSpecFunc = (spec: ChainSpec) => void;

export interface ChainSpecContextType {
  chainSpec: ChainSpec | null;
  insertChainSpec: (type: string, chainId: number, index: number) => void,
  updateChainSpec: UpdateSpecFunc,
}

const ChainSpecContext = createContext<ChainSpecContextType>({
  chainSpec: null,
  insertChainSpec: (_: string, _chainId: number, _index: number) => {},
  updateChainSpec: (_: ChainSpec) => {},
});

interface ChainSpecProviderProps {
  children: React.ReactNode;
}

export const ChainSpecProvider: React.FC<ChainSpecProviderProps> = ({ children }) => {
  const [chainSpec, setChainSpec] = useState<ChainSpec | null>(null);
  const [dirtyChainSpec, setDirtyChainSpec] = useState<ChainSpec | null>(null);
  const [nextChainId, setNextChainId] = useState<number>(0);

  const insertChainSpec = (type: string, chainId: number, index: number): void => {
    const newSpec = insertGeneratedChainSpec(dirtyChainSpec, nextChainId, type, chainId, index);
    setChainSpec(newSpec)
    setDirtyChainSpec(newSpec);
    setNextChainId(nextChainId + 1);
  }

  const updateDirtyChainSpec = useCallback((spec: ChainSpec): void => {
    const { found, chainSpec } = updateChainSpec(dirtyChainSpec, spec);
    if (!found) {
      throw new Error(`Could not find chain spec with id ${spec.chain_id} to update`);
    }
    setDirtyChainSpec(chainSpec);
  }, [dirtyChainSpec]);

  return (
    <ChainSpecContext.Provider value={{ chainSpec, insertChainSpec, updateChainSpec: updateDirtyChainSpec }}>
      {children}
    </ChainSpecContext.Provider>
  );
};

export default ChainSpecContext;