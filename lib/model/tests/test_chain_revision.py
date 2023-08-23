import os
from model.chain_revision import ChainRevision
from model.chain_spec import LLMChainSpec
from model.llm_spec import OpenAILLMSpec


def test_chain_revision_serialization():
  if os.environ.get("OPENAI_API_KEY") is None:
    os.environ["OPENAI_API_KEY"] = "set me!"

  llm = OpenAILLMSpec(model_name="davinci", temperature=0.5, max_tokens=10, top_p=1.0, frequency_penalty=0.0,
                      presence_penalty=0.0, n=1, request_timeout=10, logit_bias=None)

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
      llms={"llm": llm},
  )

  serialized = chain_revision.json()
  deserialized = ChainRevision.parse_raw(serialized)
  assert deserialized == chain_revision
