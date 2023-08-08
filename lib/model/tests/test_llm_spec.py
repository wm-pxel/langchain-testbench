import os
from model.llm_spec import OpenAILLMSpec

def test_llm_spec_serialization():
  if os.environ.get("OPENAI_API_KEY") is None:
    os.environ["OPENAI_API_KEY"] = "set me!"

  llm = OpenAILLMSpec()

  serialized = llm.json()
  deserialized = OpenAILLMSpec.parse_raw(serialized)

  assert deserialized == llm
