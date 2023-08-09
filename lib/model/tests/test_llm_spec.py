import os
from model.llm_spec import OpenAILLMSpec

def test_llm_spec_serialization():
  llm = OpenAILLMSpec(model_name="davinci", temperature=0.5, max_tokens=10, top_p=1.0, frequency_penalty=0.0,
                      presence_penalty=0.0, n=1, best_of=1, request_timeout=10, logit_bias=None)

  serialized = llm.json()
  deserialized = OpenAILLMSpec.parse_raw(serialized)

  assert deserialized == llm
