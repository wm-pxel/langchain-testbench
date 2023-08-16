import React, { createContext, useState, useCallback, useMemo, useContext } from "react";
import { ChainSpec } from "../model/specs";
import { findNextChainId, insertChainSpec as insertGeneratedChainSpec, deleteChainSpec, updateChainSpec } from "../model/spec_control";
import { deepEquals } from "../util/sets";
import { LLMContext } from "./LLMContext";
import { findByChainId } from "../model/spec_control";

export type ChainRetriever = () => ChainSpec | null;
export type UpdateSpecFunc = (spec: ChainSpec) => void;
export type DeleteSpecFunc = (chainId: number) => void;

export interface ChainSpecContextType {
  chainSpec: ChainSpec | null;
  chainName: string;
  setChainName: (name: string) => void,
  revision: string | null;
  setRevision: (revision: string | null) => void,
  insertChainSpec: (type: string, chainId: number, index: number) => void,
  deleteChainSpec: (chainId: number) => void,
  updateChainSpec: UpdateSpecFunc,
  latestChainSpec: ChainRetriever,
  findByChainId: (chainId: number) => ChainSpec | undefined,
  readyToInteract: boolean,
  isInteracting: boolean,
  setIsInteracting: (isInteracting: boolean) => void,
  isChainActive: boolean;
}

const ChainSpecContext = createContext<ChainSpecContextType>({
  chainSpec: null,
  chainName: "",
  setChainName: (_: string) => {},
  revision: null,
  setRevision: (_: string | null) => {},
  insertChainSpec: (_: string, _chainId: number, _index: number) => {},
  deleteChainSpec: (_: number) => {},
  updateChainSpec: (_: ChainSpec) => {},
  latestChainSpec: () => null,
  findByChainId: (_: number) => undefined,
  readyToInteract: false,
  isInteracting: false,
  setIsInteracting: (_: boolean) => undefined,
  isChainActive: false, // Initial value
});

interface ChainSpecProviderProps {
  children: React.ReactNode;
}

export const ChainSpecProvider: React.FC<ChainSpecProviderProps> = ({ children }) => {
  const { LLMsNeedSave } = useContext(LLMContext);
  const [chainName, setChainName] = useState<string>("");

  // The chainSpec is what we expect the revision's spec to be in the database.
  // It is only updated after a load or a successful save. It is maintained
  // to determine whether the UI is in sync with the database.
  const [chainSpec, setChainSpec] = useState<ChainSpec | null>(null);

  // Dirty spec receives all updates to the spec from the UI (ie. onchange events)
  const [dirtyChainSpec, setDirtyChainSpec] = useState<ChainSpec | null>(null);

  const [nextChainId, setNextChainId] = useState<number>(0);
  const [revision, setRevision] = useState<string|null>(null);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);

  const insertChainSpec = (type: string, chainId: number, index: number): void => {
    const newSpec = insertGeneratedChainSpec(dirtyChainSpec, nextChainId, type, chainId, index);
    setDirtyChain(newSpec);
  };

  const latestChainSpec = (): ChainSpec | null => {
    setChainSpec(dirtyChainSpec)
    return dirtyChainSpec;
  }

  const setDirtyChain = (spec: ChainSpec | null): void => {
    // setDisplaySpec(spec);
    setDirtyChainSpec(spec);
    setNextChainId(spec ? Math.max(findNextChainId(spec), nextChainId) : 0);
  }

  const findChainInCurrentSpec = (chainId: number): ChainSpec | undefined => {
    if (!dirtyChainSpec) {
      return undefined;
    }
    return findByChainId(chainId, dirtyChainSpec);
  };

  const deleteChain = (chainId: number): void => {
    const newSpec = deleteChainSpec(dirtyChainSpec, chainId);
    setDirtyChain(newSpec);
  };

  const updateDirtyChainSpec = (spec: ChainSpec): void => {
    const result = updateChainSpec(dirtyChainSpec, spec);
    if (!result.found) {
      throw new Error(`Could not find chain spec with id ${spec.chain_id} to update`);
    }
    setDirtyChain(result.chainSpec);
  };

  const readyToInteract = useMemo(() => {
    return !LLMsNeedSave && !!chainSpec && deepEquals(chainSpec, dirtyChainSpec);
  }, [chainSpec, dirtyChainSpec, LLMsNeedSave]);

  const isChainActive = useMemo(() => {
    return !!chainName;
  }, [chainName]);

  return (
    <ChainSpecContext.Provider value={{ 
      chainSpec: dirtyChainSpec,
      chainName,
      setChainName,
      revision,
      setRevision,
      insertChainSpec,
      deleteChainSpec: deleteChain,
      updateChainSpec: updateDirtyChainSpec,
      latestChainSpec,
      findByChainId: findChainInCurrentSpec,
      readyToInteract,
      isInteracting,
      setIsInteracting,
      isChainActive, 
    }}>
      {children}
    </ChainSpecContext.Provider>
  );
};

export default ChainSpecContext;