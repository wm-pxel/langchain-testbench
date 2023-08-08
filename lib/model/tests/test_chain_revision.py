import os
from model.chain_revision import ChainRevision
from model.chain_spec import LLMChainSpec
from model.llm_spec import OpenAILLMSpec


def test_chain_revision_serialization():
  if os.environ.get("OPENAI_API_KEY") is None:
    os.environ["OPENAI_API_KEY"] = "set me!"

  chain_revision = ChainRevision(
      chain_id=1,
      chain=LLMChainSpec(
          chain_id=1,
          input_keys=["input1", "input2"],
          output_key="output1",
          prompt="prompt",
          llm_key="llm_key",
          chain_type="llm_chain_spec",
      ),
      llms={"llm": OpenAILLMSpec(llm_id=0, llm_key="test")},
  )

  serialized = chain_revision.json()
  deserialized = ChainRevision.parse_raw(serialized)
  assert deserialized == chain_revision
