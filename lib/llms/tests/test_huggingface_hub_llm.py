from llms.huggingface_hub_llm import HuggingFaceHubLLM

def simple_huggingface_hub_llm():
  temperature: float
  max_length: int
  min_new_tokens: int | None
  max_time: int | None
  repo_id: str
  task: str | None

  return HuggingFaceHubLLM(
    temperature=0.8,
    max_length=64,
    repo_id="google/flan-t5-xxl"
  )

def test_llm_type():
  llm = simple_huggingface_hub_llm()
  assert llm._llm_type == "huggingface_hub_llm"

def test_run():
  llm = simple_huggingface_hub_llm()
  prompt = "How many oceans are there in the world?"

  output = llm._call(prompt)

  assert type(output) == str
  assert output != ""
