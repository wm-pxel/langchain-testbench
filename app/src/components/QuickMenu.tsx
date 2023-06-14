import { useState } from "react";
import "./style/QuickMenu.css";

interface QuickMenuProps {
  options: Record<string, string>;
  selectValue: (option: string) => void;
  buttonText?: string;
  menuClass?: string;
}
const QuickMenu = ({selectValue, options, buttonText, menuClass }: QuickMenuProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  buttonText = buttonText || '+';
  menuClass = menuClass || '';

  const handleInsert = (option: string) => {
    setModalOpen(false);
    selectValue(option);
  }

  return (
    <div className={`quick-menu ${modalOpen ? 'open' : ''} ${menuClass}`}>
      <button onClick={()=>setModalOpen(!modalOpen)} className='open-quick-menu'>{modalOpen ? 'x' : buttonText}</button>
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