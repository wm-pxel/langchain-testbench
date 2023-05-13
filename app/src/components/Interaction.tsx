import { useContext, useEffect, useRef, useState } from "react";
import ChainSpecContext from "../contexts/ChainSpecContext";
import { runOnce } from "../api/api";
import { computeChainIO } from "../model/spec_control";
import DOMPurify from 'dompurify';
import "./style/Interaction.css"


interface Message {
  from: string;
  text: string;
}

interface InputState { primary: string | null, input: Record<string, string> }

const Interaction = () => {
  const { chainName, isInteracting, readyToInteract, latestChainSpec } = useContext(ChainSpecContext);

  const [input, setInput] = useState<string>("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [lastOutput, setLastOutput] = useState<Record<string, string>>({});
  const conversationRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    setTimeout(() => {
      if (conversationRef.current) {
        conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
      }
    }, 0);
  }

  const richText = (text: string): string => {
    return DOMPurify.sanitize(text.replace(/\n/g, "<br/>"));
  }

  const runChain = async () => {
    const chainSpec = latestChainSpec()
    if (!chainSpec) return;

    const [inputs]: [Set<string>, Set<string>] = computeChainIO(chainSpec)
    const inputVars = [...inputs].reduce((data, inVar) => ({
      primary: data.primary || (inVar.endsWith("_in") ? null : input),
      input: {...data.input, [inVar]: inVar.endsWith("_in") 
        ? (lastOutput[inVar.replace(/_in$/, "_out")] || 'replaced but not found')
        : (data.primary ? '' : input)
      }
    }), {primary: null, input: {}} as InputState);
    

    const newConversation = [...conversation, { from: 'user', text: inputVars.primary || ''}];
    setConversation(newConversation);
    setInput("");
    scrollDown();

    const response = await runOnce(chainName, inputVars.input);
    setLastOutput(response);
    setConversation([...newConversation, { from: 'chain', text: response.output }]);
    scrollDown();
  }

  useEffect(() => {
    setConversation([]);
    setInput("");
    setLastOutput({});
  }, [isInteracting, readyToInteract]);

  return (
    <div className={`interaction ${(readyToInteract && isInteracting) ? 'open' : ''}`}>
      <div className="conversation" ref={conversationRef}>
        {conversation.map((message, i) => (
          <div className={`message ${message.from}`} key={`message-${i}`} dangerouslySetInnerHTML={{__html: richText(message.text)}}>
          </div>
        ))}
      </div>
      <div className="input">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter interaction here"/>
        <button onClick={runChain}>Send</button>
      </div>
    </div>
  );
};

export default Interaction;