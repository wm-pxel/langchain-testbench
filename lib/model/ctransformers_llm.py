import os
from typing import Any, List, Optional
from langchain.callbacks.manager import CallbackManagerForLLMRun
from langchain.llms.base import LLM
from langchain.llms import CTransformers

DEFAULT_TEMP = 0
DEFAULT_MAX_NEW_TOKENS = 128

# TODO: make this configurable based on request body from the frontend.
LOCAL_LLM = f"{os.getcwd()}/models/llama-2-13b-chat.ggmlv3.q4_0.bin"


class CTransformersLLM(LLM):
    temperature: float = DEFAULT_TEMP
    max_new_tokens: int = DEFAULT_MAX_NEW_TOKENS

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.temperature = kwargs.get('temperature')
        self.max_new_tokens = kwargs.get('max_length')

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
            max_new_tokens=self.max_new_tokens,
            temperature=self.temperature,
        )

        response = llm(prompt)

        return response
