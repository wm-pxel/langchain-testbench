import { useCallback, useState, useContext, useEffect } from "react";
import { ModalContext } from "../contexts/ModalContext";
import "./style/TextModal.scss";

interface TextModalProps {
  modalKey: string
  title: string;
  buttonText: string;
  placeholder: string;
  disabled: boolean;
  enterValue: (option: string) => void;
  validateInput: (input: string) => Promise<boolean>;
}

const TextModal = ({enterValue, title, buttonText, placeholder, disabled, validateInput, modalKey}: TextModalProps) => {
  const { activeModalId, setActiveModalId } = useContext(ModalContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [text, setText] = useState("");
  const [shouldDisable, setShouldDisable] = useState(disabled);

  useEffect(() => {
    if (activeModalId !== modalKey) {
      setModalOpen(false);
    }
  }, [activeModalId]);

  useEffect(() => {
    setShouldDisable(disabled);
  }, [disabled]);

  const handleEnter = useCallback(async () => {
    if (await validateInput(text)) {
      setText('');
      setModalOpen(false);
      enterValue(text);
    }
  }, [text, validateInput]);

  const handleCancel = useCallback(() => {
    setText('');
    setModalOpen(false);
  }, [text]);

  const handleClick = () => {
    if (!modalOpen) {
      setActiveModalId(modalKey);
    }
    setModalOpen(!modalOpen);
  };


  return (
    <div className={`text-modal ${modalOpen ? 'open' : ''}`}>
      <button disabled={shouldDisable} onClick={handleClick} className="open-text-modal">{title}</button>
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
