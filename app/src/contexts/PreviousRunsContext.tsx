import { createContext, useState } from "react";

export interface PreviousRunsContextType {
  isViewingPreviousRuns: boolean;
  chainName: string;
  updateViewingPreviousRuns: (isViewingPreviousRuns: boolean, chainName: string) => void;
}

export const PreviousRunsContext = createContext<PreviousRunsContextType>({
  isViewingPreviousRuns: false,
  chainName: '',
  updateViewingPreviousRuns: (_: boolean, __: string) => {},
});

export interface PreviousRunsProviderProps {
  children: React.ReactNode;
}

export const PreviousRunsContextProvider: React.FC<
  PreviousRunsProviderProps
> = ({ children }) => {
  const [isViewingPreviousRuns, setIsViewingPreviousRuns] =
    useState<boolean>(false);
  const [chainName, setChainName] =
    useState<string>('');

  const updateViewingPreviousRuns = (isViewingPreviousRunsIn: boolean, chainNameIn: string) => {
    setChainName(chainNameIn);
    setIsViewingPreviousRuns(isViewingPreviousRunsIn);
  }

  return (
    <PreviousRunsContext.Provider
      value={{
        isViewingPreviousRuns,
        chainName,
        updateViewingPreviousRuns,
      }}
    >
      {children}
    </PreviousRunsContext.Provider>
  );
};

export default PreviousRunsContextProvider;
