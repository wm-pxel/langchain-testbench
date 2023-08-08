from llms.openai_llm import OpenAILLM

def simple_openai_llm():
  return OpenAILLM(
    model_name="text-davinci-003",
    temperature=0.8,
    max_tokens=256,
    top_p=1.0,
    frequency_penalty=0.0,
    presence_penalty=0.0,
    n=1,
    best_of=1,
    request_timeout=None,
    logit_bias={}
    )

def test_llm_type():
  llm = simple_openai_llm()
  assert llm._llm_type == "openai_llm"
  assert llm.temperature == 0.8
