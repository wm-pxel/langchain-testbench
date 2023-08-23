import { useContext, useEffect, useRef, useState } from "react";
import ChainSpecContext from "../contexts/ChainSpecContext";
import { runOnce } from "../api/api";
import { computeChainIO } from "../model/spec_control";
import { escapeHTML } from "../util/html";
import DOMPurify from 'dompurify';
import { setTimedMessage } from "../util/errorhandling";
import "./style/Interaction.scss"


interface Message {
  from: string;
  text: string;
}

const Interaction = () => {
  const { chainName, isInteracting, readyToInteract, latestChainSpec, setIsInteracting } = useContext(ChainSpecContext);

  const [input, setInput] = useState<Record<string,string>>({});
  const [conversation, setConversation] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [primaryInput, setPrimaryInput] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isInteracting || !readyToInteract) return;
    setConversation([]);
    const chainSpec = latestChainSpec()
    if (!chainSpec) return;
    const [inputs] = computeChainIO(chainSpec)
    setInput(Object.fromEntries([...inputs].map((inVar) => [inVar, ''])));
    const firstInput = inputs.has('input') ? 'input' : [...inputs].find((inVar) => !inVar.endsWith("_in"));
    setPrimaryInput(firstInput || null);
    setActiveInput(firstInput || [...inputs][0]);
  }, [isInteracting, readyToInteract]);


  const scrollDown = () => {
    setTimeout(() => {
      if (conversationRef.current) {
        conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
      }
    }, 0);
  }

  const updateInput = (key: string, value: string) => {
    return setInput({...input, [key]: value})
  }

  const richText = (text: string): string => {
    return DOMPurify.sanitize(escapeHTML(text.trim()));
  }

  const runChain = async () => {
    setErrorMessage(null);
    const chainSpec = latestChainSpec()
    if (!chainSpec) return;

    setLoading(true);
    try {
      let newConversation = conversation;
      if (primaryInput) {
        newConversation = [...conversation, { from: 'user', text: input[primaryInput] || ''}];
        setConversation(newConversation);
        for (const key of Object.keys(input)) updateInput(key, '');
        scrollDown();
      }

      const response = await runOnce(chainName, input);
      const output = response.output || response[Object.keys(response)[0]];
      const text = output.text ?? output;
      setConversation([...newConversation, { from: 'chain', text }]);
      Object.entries(response).forEach(([key, value]) => console.log(`${key}:`, value))

      let nextInput = input;
      for (const key of Object.keys(input)) {
        if (!key.endsWith("_in")) {
          nextInput = {...nextInput, [key]: ''};
          continue;
        }
        const outputKey = key.replace(/_in$/, "_out");
        if (response[outputKey] === undefined) continue;
        nextInput = {...nextInput, [key]: response[outputKey]};
      }
      setInput(nextInput);

      scrollDown();
    } catch (e) {
      console.error(e);
      setTimedMessage(setErrorMessage, "Error running chain: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`interaction ${(readyToInteract && isInteracting) ? 'open' : ''}`}>
      <div className="page-top">
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <button className="close" onClick={() => setIsInteracting(false)}>close</button>
      </div>
      <div className="conversation" ref={conversationRef}>
        {conversation.map((message, i) => (
          <div className={`message ${message.from}`} key={`message-${i}`} dangerouslySetInnerHTML={{__html: richText(message.text)}}>
          </div>
        ))}
        {loading && <div className="loading">
          <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        </div>}
      </div>
      <div className="input">
        <div className="input-tabs">
          {Object.keys(input).map((key, i) => (
            <button
              key={`input-${i}`}
              className={activeInput === key ? 'active' : ''}
              onClick={() => setActiveInput(key)}>{key}</button>
          ))}
        </div>
        <div className="input-values">
          {Object.entries(input).map(([key, value], i) => (
            <textarea
              key={`input-${i}`}
              className={activeInput===key?'active':''}
              value={value}
              disabled={loading}
              onChange={e => updateInput(key, e.target.value)}
              placeholder={loading ? "" : `Enter ${key} here`}/>
          ))}
        </div>
        <button onClick={runChain}>Send</button>
      </div>
    </div>
  );
};

export default Interaction;