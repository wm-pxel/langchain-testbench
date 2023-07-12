import { createContext, useState } from "react";

export interface ModalContextType {
    activeModalId: string | null; 
    setActiveModalId: (id: string | null) => void;
}

export const ModalContext = createContext<ModalContextType>({
    activeModalId: null,
    setActiveModalId: () => {},
});

export interface ModalProviderProps {
    children: React.ReactNode;
}

export const ModalContextProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const [activeModalId, setActiveModalId] = useState<string | null>(null);

    return (
        <ModalContext.Provider value={{
            activeModalId,
            setActiveModalId,
        }}>
            {children}
        </ModalContext.Provider>
    );
}

export default ModalContextProvider;
