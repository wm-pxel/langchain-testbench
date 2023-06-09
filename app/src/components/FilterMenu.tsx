import { useEffect, useState } from "react";
import "./style/FilterMenu.css";

interface FilterMenuProps {
  title: string;
  options: string[];
  selectValue: (option: string) => void;
}
const FilterMenu = ({selectValue, options, title}: FilterMenuProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);

  useEffect(() => setFilteredOptions(filter === '' 
    ? options
    : options.filter((value) => value.toLowerCase().includes(filter.toLowerCase()))
  ), [filter, options]);

  const handleInsert = (option: string) => {
    setModalOpen(false);
    selectValue(option);
  }

  return (
    <div className={`filter-menu ${modalOpen ? 'open' : ''}`}>
      <button onClick={()=>setModalOpen(!modalOpen)} className="open-filter-menu">{title}</button>
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