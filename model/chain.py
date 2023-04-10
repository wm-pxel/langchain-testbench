from langchain.chains import SequentialChain
from langchain.chains.loading import load_chain_from_config

class ESequentialChain(SequentialChain):
  @property
  def _chain_type(self) -> str:
    return "sequential_chain"


def chain_loader(v):
  match v['_type']:
    case 'sequential_chain':
      return ESequentialChain(
        input_variables=v['input_variables'],
        output_variables=v['output_variables'],
        chains=[chain_loader(c) for c in v['chains']]
      )
    case _:
      return load_chain_from_config(v)

