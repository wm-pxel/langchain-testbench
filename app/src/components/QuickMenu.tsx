import { useState } from "react";
import "./style/QuickMenu.css";

interface QuickMenuProps {
  options: Record<string, string>;
  selectValue: (option: string) => void;
}
const QuickMenu = ({selectValue, options}: QuickMenuProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleInsert = (option: string) => {
    setModalOpen(false);
    selectValue(option);
  }

  return (
    <div className={`quick-menu ${modalOpen ? 'open' : ''}`}>
      <button onClick={()=>setModalOpen(!modalOpen)} className="open-quick-menu">{modalOpen ? 'x' : '+'}</button>
      <div className="quick-menu-selector">
        {
          Object.entries(options).map(([key, value]) => (
            <button onClick={() => handleInsert(key)}>{value}</button>
          ))
        }
      </div>
    </div>
  );
};

export default QuickMenu;