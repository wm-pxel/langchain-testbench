from langchain.llms import OpenAI
from model.chain_revision import ChainRevision
from model.chain_spec import LLMSpec
import dotenv

dotenv.load_dotenv()


llm = OpenAI(temperature=0.8)

chain_revision = ChainRevision(
  llms = {"llm": llm},
  chain = LLMSpec(
    chain_id = 0,
    input_keys = ["subject"],
    output_key = "output",
    prompt = "Write a funny story about {subject}",
    llm_key = "llm",
    chain_type = "llm_spec",
  )
)

print(chain_revision.json())