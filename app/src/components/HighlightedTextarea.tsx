import { useCallback, useRef, useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import FormatReducer from '../util/FormatReducer';

export interface HighlightedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  formatReducer: FormatReducer<any>;
  placeholder?: string;
}

const HighlightedTextarea = ({ value, formatReducer, onChange, placeholder }: HighlightedTextareaProps) => {
  const displayRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState<string>(value);
  const [formattedText, setFormattedText] = useState<string>(value);

  const escapedAndFormatted = useCallback((text: string) => {
    const escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const formatted = formatReducer.format(escaped).replace(/\n/g, "<br/>");
    return DOMPurify.sanitize(formatted)
  }, [formatReducer]);
  
  useEffect(() => {
    const formatted = escapedAndFormatted(text);
    setFormattedText(DOMPurify.sanitize(formatted));
    onChange(text);
  }, [text]);

  const syncScroll = (e: React.UIEvent) => {
    if (!displayRef.current) return;
    displayRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
  }

  return (
    <div className="highlighted-editor">
      <div className="highlighted-display" ref={displayRef} dangerouslySetInnerHTML={{__html: formattedText}}></div>
      <textarea className="highlighted-input" value={text} 
        onChange={e => setText(e.target.value)} 
        placeholder={placeholder}
        onScroll={syncScroll}>
      </textarea>
    </div>
  )
}

export default HighlightedTextarea;
