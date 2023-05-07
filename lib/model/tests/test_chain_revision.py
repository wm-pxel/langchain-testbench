import os
from typing import List
from model.chain_revision import ChainRevision
from model.chain_spec import LLMSpec
from langchain.llms import OpenAI


def test_chain_revision_serialization():
  if os.environ.get("OPENAI_API_KEY") is None:
    os.environ["OPENAI_API_KEY"] = "set me!"

  llm = OpenAI()

  chain_revision = ChainRevision(
      chain_id=1,
      chain=LLMSpec(
          chain_id=1,
          input_keys=["input1", "input2"],
          output_key="output1",
          prompt="prompt",
          llm_key="llm_key",
          chain_type="llm_spec",
      ),
      llms={"llm": llm},
  )

  serialized = chain_revision.json()
  deserialized = ChainRevision.parse_raw(serialized)
  assert deserialized.llms["llm"] == llm
  assert deserialized == chain_revision