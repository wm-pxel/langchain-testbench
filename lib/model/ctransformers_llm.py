import os
from typing import Any, List, Optional
from langchain.callbacks.manager import CallbackManagerForLLMRun
from langchain.llms.base import LLM
from langchain.llms import CTransformers
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain import PromptTemplate, LLMChain

LOCAL_LLM = f"{os.getcwd()}/models/llama-2-13b-chat.ggmlv3.q4_0.bin"


class CTransformersLLM(LLM):
    @property
    def _llm_type(self) -> str:
        """Return type of llm."""
        return "ctransformers_llm"

    def _call(
            self,
            prompt: str,
            stop: Optional[List[str]] = None,
            run_manager: Optional[CallbackManagerForLLMRun] = None,
            **kwargs: Any,
    ) -> str:

        llm = CTransformers(
            model=LOCAL_LLM,
            model_type="llama",
            max_new_tokens=128,
            temperature=0,
        )

        response = llm(prompt)

        return response
