import { useState, useContext, useEffect } from "react";
import "./style/QuickMenu.css";
import { ModalContext } from "../contexts/ModalContext";


interface QuickMenuProps {
  modalKey: string
  options: Record<string, string>;
  selectValue: (option: string) => void;
  buttonText?: string;
  menuClass?: string;
}
const QuickMenu = ({modalKey, selectValue, options, buttonText, menuClass }: QuickMenuProps) => {
  const { activeModalId, setActiveModalId } = useContext(ModalContext);
  const [modalOpen, setModalOpen] = useState(false);

  buttonText = buttonText || '+';
  menuClass = menuClass || '';

  useEffect(() => {
    if (activeModalId !== modalKey) {
      setModalOpen(false);
    }
  }, [activeModalId]);

  const handleInsert = (option: string) => {
    setModalOpen(false);
    selectValue(option);
  }

  const handleClick = () => {
    if (!modalOpen) {
      setActiveModalId(modalKey);
    }
    setModalOpen(!modalOpen);
  };

  return (
    <div className={`quick-menu ${modalOpen ? 'open' : ''} ${menuClass}`}>
      <button onClick={handleClick} className='open-quick-menu'>{modalOpen ? 'x' : buttonText}</button>
      <div className="quick-menu-selector">
        {
          Object.entries(options).map(([key, value], idx) => (
            <button key={`qm-option-${idx}`} onClick={() => handleInsert(key)}>{value}</button>
          ))
        }
      </div>
    </div>
  );
};

export default QuickMenu;