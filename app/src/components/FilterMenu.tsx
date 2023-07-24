import { useEffect, useState, useContext } from "react";
import { ModalContext } from "../contexts/ModalContext";
import "./style/FilterMenu.css";

interface FilterMenuProps {
  modalKey: string
  title: string;
  options: string[];
  selectValue: (option: string) => void;
}
const FilterMenu = ({ selectValue, options, title, modalKey }: FilterMenuProps) => {
  const { activeModalId, setActiveModalId } = useContext(ModalContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);

  useEffect(() => {
    if (activeModalId !== modalKey) {
      setModalOpen(false);
    }
  }, [modalOpen, activeModalId]);

  useEffect(() => setFilteredOptions(filter === '' 
    ? options
    : options.filter((value) => value.toLowerCase().includes(filter.toLowerCase()))
  ), [filter, options]);

  const handleInsert = (option: string) => {
    setModalOpen(false);
    selectValue(option);
  };

  const handleClick = () => {
    setModalOpen(!modalOpen);
    if (!modalOpen) {
      setActiveModalId(modalKey);
    }
  };

  return (
    <div className={`filter-menu ${modalOpen ? 'open' : ''}`}>
      <button onClick={handleClick} className="open-filter-menu">{title}</button>
      <div className="filter-menu-selector">
        <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="filter" />
        <button onClick={()=>setModalOpen(false)} className="close-filter-menu">x</button>
        <div className="filter-menu-entries">
          {
            filteredOptions.map((key, idx) => (
              <button key={`qm-option-${idx}`} onClick={() => handleInsert(key)}>{key}</button>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;
