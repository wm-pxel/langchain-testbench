
import click
from model.chain_revision import ChainRevision
from model.chain import Chain
from model.lang_chain_context import LangChainContext
from db import chain_revision_repository, chain_repository
import dotenv
import json
import re

dotenv.load_dotenv()

# TODO:
# - Add an interactive command to run a chain interactively
# - Add flags to the run and interactive command to trigger recording (implement recording)
# - Add a command to branch a chain
# - Add a command to patch a single chain element by chain_id

@click.group()
def cli():
  pass

@click.command()
@click.argument('chain-name')
@click.argument("file", default="-", type=click.File("rb"))
def save(chain_name, file):
    """Save a new chain revision.
    The revision is read as json from stdin or from the given file.
    If chain-name is unknown, a new chain is created. Otherwise,
    This revision will be saved with the chain's current revision as
    its parent, and the chain's reference will be updated to this
    revision.
    """
    buffer = b""
    for f in file:
      buffer += f

    revision_json = buffer.decode('utf-8')
    revision = ChainRevision.parse_raw(revision_json)

    chain = chain_repository.find_one_by({"name": chain_name})

    if chain is not None:
      revision.parent = chain.revision
      chain.revision = revision.id
      chain_revision_repository.save(revision)

      chain.revision = revision.id
      chain_repository.save(chain)
    else:
      chain_revision_repository.save(revision)

      chain = Chain(name=chain_name, revision=revision.id)
      chain_repository.save(chain)
    
    print("Saved revision", revision.id, "for chain", chain_name)

cli.add_command(save)


@click.command()
@click.argument('chain-name')
def load(chain_name):
  """Load a chain revision from the database.
  The revision will be loaded and then output as json to stdout.
  """
  chain = chain_repository.find_one_by({"name": chain_name})
  revision = chain_revision_repository.find_one_by_id(chain.revision)
  print(revision.json(indent=2))

cli.add_command(load)


@click.command()
@click.argument('chain-name')
@click.argument("input", default="-", type=click.File("rb"))
def run(chain_name, input):
  """Run a chain revision.
  The revision is read from the database and fed input from stdin or the given file.
  The results are ouput as json to stdout.
  """
  buffer = b""
  for f in input:
    buffer += f

  input_json = buffer.decode('utf-8')
  input = json.loads(input_json)

  chain = chain_repository.find_one_by({"name": chain_name})
  revision = chain_revision_repository.find_one_by_id(chain.revision)

  ctx = LangChainContext(llms=revision.llms)
  lang_chain = revision.chain.to_lang_chain(ctx)
  output = lang_chain.run(input)

  print(json.dumps(output, indent=2))

cli.add_command(run)

@click.command()
@click.argument('chain-name')
def interactive(chain_name):
  """Interact with a chain from the database on the command line.  
  The chain must either have an input key called 'input' or have exactly one 
  input key that is not also an output key. The user's input will be fed to this key.

  The chain must either have an output key called 'output' or have exactly one
  output key that is not also an input key. The output of this key will be
  displayed to the user for each iteration.

  Outputs can be fed as inputs to subsequent iterations by adding '_in' to the
  input name and '_out' to the output name. 
  
  For example, if the inputs are 'subject' and 'memory_in', and the outputs are
  'output' and 'memory_out', then the user will be prompted for 'subject',
  the output of 'output' will be displayed, and the output of 'memory_out' will
  be fed to 'memory_in' in the next iteration.

  All other inputs will get the empty string as input, and all other outputs
  will be ignored.
  """
  chain = chain_repository.find_one_by({"name": chain_name})
  revision = chain_revision_repository.find_one_by_id(chain.revision)
  ctx = LangChainContext(llms=revision.llms)
  lang_chain = revision.chain.to_lang_chain(ctx)

  input_keys = set(lang_chain.input_keys)
  output_keys = set(lang_chain.output_keys)
  output_mapping = {re.sub(r"_out$", "_in", key): key
    for key in output_keys
    if re.search(r"_out$", key) and re.sub(r"_out$", "_in", key) in input_keys}

  if "input" in input_keys:
    user_input_key = "input"
  elif len(input_keys - output_keys) == 1:
    user_input_key = list(input_keys - output_keys)[0]
  else:
    raise Exception("Chain must have exactly one input key that is not also an output key or an input key called 'input'")
  
  if "output" in output_keys:
    user_output_key = "output"
  elif len(output_keys - input_keys) == 1:
    user_output_key = list(output_keys - input_keys)[0]
  else:
    raise Exception("Chain must have exactly one output key that is not also an input key or an output key called 'output'")
  
  inputs = {key: "" for key in input_keys if key != user_input_key}
  while True:
    inputs[user_input_key] = input(f"{user_input_key}> ")
    outputs = lang_chain._call(inputs)

    print(outputs[user_output_key])
    print()

    inputs = {key: outputs[output_mapping[key]] if key in output_mapping else "" for key in input_keys}


cli.add_command(interactive)