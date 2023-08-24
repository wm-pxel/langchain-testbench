import { createContext, useEffect, useState } from "react";

export interface PreviousRunsContextType {
  isViewingPreviousRuns: boolean;
  setIsViewingPreviousRuns: (isViewingPreviousRuns: boolean) => void;
}

export const PreviousRunsContext = createContext<PreviousRunsContextType>({
  isViewingPreviousRuns: false,
  setIsViewingPreviousRuns: (_: boolean) => {},
});

export interface PreviousRunsProviderProps {
  children: React.ReactNode;
}

export const PreviousRunsContextProvider: React.FC<
  PreviousRunsProviderProps
> = ({ children }) => {
  const [isViewingPreviousRuns, setIsViewingPreviousRuns] =
    useState<boolean>(false);

  return (
    <PreviousRunsContext.Provider
      value={{
        isViewingPreviousRuns,
        setIsViewingPreviousRuns,
      }}
    >
      {children}
    </PreviousRunsContext.Provider>
  );
};

export default PreviousRunsContextProvider;
