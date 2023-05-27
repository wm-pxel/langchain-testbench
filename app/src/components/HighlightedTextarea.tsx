import { useCallback, useRef, useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import FormatReducer from '../util/FormatReducer';
import { escapeHTML } from '../util/html';

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
    const formatted = formatReducer.format(escapeHTML(text));
    return DOMPurify.sanitize(formatted)
  }, [formatReducer]);
  
  useEffect(() => {
    const formatted = escapedAndFormatted(text);
    setFormattedText(formatted);
    onChange(text);
  }, [text]);

  useEffect(() => {
    setText(value);
  }, [value]);

  const syncScroll = (e: React.UIEvent) => {
    setTimeout(() => {
      if (!displayRef.current) return;
      displayRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
    }, 0)
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
