import { useCallback, useState } from "react";
import "./style/TextModal.css";

interface TextModalProps {
  title: string;
  buttonText: string;
  placeholder: string;
  enterValue: (option: string) => void;
  validateInput: (input: string) => boolean;
}

const TextModal = ({enterValue, title, buttonText, placeholder, validateInput}: TextModalProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [text, setText] = useState('');

  const handleEnter = useCallback(async () => {
    if (validateInput(text)) {
      setText('');
      setModalOpen(false);
      enterValue(text);
    }
  }, [text, validateInput]);

  const handleCancel = useCallback(() => {
    setText('');
    setModalOpen(false);
  }, [text]);

  return (
    <div className={`text-modal ${modalOpen ? 'open' : ''}`}>
      <button onClick={()=>setModalOpen(!modalOpen)} className="open-text-modal">{title}</button>
      <div className="text-modal-selector">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} />
        <div className="text-modal-actions">
          <button onClick={handleEnter}>{buttonText}</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default TextModal;
