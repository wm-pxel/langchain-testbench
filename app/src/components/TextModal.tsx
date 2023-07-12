import { useCallback, useState, useContext, useEffect } from "react";
import { ModalContext } from "../contexts/ModalContext";
import "./style/TextModal.css";

interface TextModalProps {
  title: string;
  buttonText: string;
  placeholder: string;
  enterValue: (option: string) => void;
  validateInput: (input: string) => boolean;
}

const TextModal = ({
  enterValue,
  title,
  buttonText,
  placeholder,
  validateInput,
}: TextModalProps) => {
  const { activeModalId, setActiveModalId } = useContext(ModalContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [text, setText] = useState("");

  // Set latest modalID when modal opens
  useEffect(() => {
    // Global modal ID changed, check if global modal ID not is equal to local modal ID
    if (activeModalId !== "TextModal") {
      // If not, close modal
      setModalOpen(false);
    }
  }, [modalOpen, activeModalId]);

  const handleEnter = useCallback(async () => {
    if (validateInput(text)) {
      setText("");
      setModalOpen(false);
      enterValue(text);
    }
  }, [text, validateInput]);

  const handleCancel = useCallback(() => {
    setText("");
    setModalOpen(false);
  }, [text]);

  return (
    <div className={`text-modal ${modalOpen ? "open" : ""}`}>
      <button
        onClick={() => {
            setModalOpen(!modalOpen);
            setActiveModalId("TextModal");
        }}
        className="open-text-modal"
      >
        {title}
      </button>
      <div className="text-modal-selector">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
        />
        <div className="text-modal-actions">
          <button onClick={handleEnter}>{buttonText}</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default TextModal;
