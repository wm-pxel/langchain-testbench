
import click
from lib.model.chain_revision import ChainRevision, find_ancestor_ids
from lib.model.chain import Chain
from lib.model.chain_spec import LLMSpec
from lib.model.lang_chain_context import LangChainContext
from lib.db import chain_revision_repository, chain_repository, result_repository
from bson import ObjectId
from collections import defaultdict
from typing import Optional, Dict, Any
import lib.chain_service as chain_service
import csv
import dotenv
import json
import re
import sys

dotenv.load_dotenv()

@click.group()
def cli():
  pass


#####################
# Chain revisions
#####################


@click.group()
def revision():
  """Save and load chain revisions."""
  pass

cli.add_command(revision)


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

    revision_id = chain_service.save_revision(chain_name, revision)

    print("Saved revision", revision.id, "for chain", chain_name)

revision.add_command(save)


@click.command()
@click.argument('chain-name')
def load(chain_name):
  """Load a chain revision from the database.
  The revision will be loaded and then output as json to stdout.
  """
  revision = chain_service.load_by_chain_name(chain_name)
  print(revision.json(indent=2))

revision.add_command(load)


@click.command()
@click.argument('chain-name')
def history(chain_name):
  """Output the ids of all revisions of the chain.
  The ids will be output to stdout.
  """
  ancestor_ids = chain_service.history_by_chain_name(chain_name)
  for id in ancestor_ids:
    print(id)

revision.add_command(history)


@click.command()
@click.argument('chain-name')
def patch(chain_name):
  """Replace a single chain spec component to create a new chain.
  The patch must have the same chain_id as the chain spec to be replaced.
  The new chain will be saved as a new revision and the chain name will be
  updated to refrence it.
  """
  buffer = b""
  for f in sys.stdin:
    buffer += f.encode('utf-8')

  patch_dict = json.loads(buffer.decode('utf-8'))

  # junk revision lets us correctly deserialize the patch
  junk_revision = ChainRevision(**{'chain': patch_dict, 'llms':{}})
  patch = junk_revision.chain

  revision_id = chain_service.save_patch(chain_name, patch)
  print("Saved revision", revision_id, "for chain", chain_name)

revision.add_command(patch)


@click.command()
@click.argument('chain-name')
@click.argument('chain-id')
def patch_prompt(chain_name, chain_id):
  """Replace the prompt text for an LLMSpec of the given revision.
  The prompt text will be provided on stdin.
  The new chain will be saved as a new revision and the chain name will be
  updated to refrence it.
  """
  revision = chain_service.load_by_chain_name(chain_name)
  patch = revision.chain.find_by_chain_id(int(chain_id)).copy(deep=True)

  # error if spec is not an LLMSpec
  if not isinstance(patch, LLMSpec):
    print(f"Spec {chain_id} is not an LLMSpec")
    sys.exit(1)

  buffer = b""
  for f in sys.stdin:
    buffer += f.encode('utf-8')

  patch.prompt = buffer.decode('utf-8')

  revision_id = chain_service.save_patch(chain_name, patch)
  print("Saved revision", revision_id, "for chain", chain_name)

revision.add_command(patch_prompt)


#####################
# Chain names
#####################


@click.group()
def chain():
  """Branch and reset chain names."""
  pass

cli.add_command(chain)


@click.command()
@click.argument('chain-name')
@click.argument("branch-name")
def branch(chain_name, branch_name):
  """Branch a chain revision.
  This will create a new chain that points to the same revision
  as the provided chain. The new chain may be then revised independently.
  """
  new_chain_id = chain_service.branch(chain_name, branch_name)
  print(f"Created branch {branch_name} at {new_chain_id}")

chain.add_command(branch)


@click.command()
@click.argument('chain-name')
@click.argument("revision")
def reset(chain_name, revision):
  """Reset a chain to a another revision.
  This will update the chain to point to the given revision.
  """
  chain_service.reset(chain_name, revision)
  print(f"Reset {chain_name} to revision {revision}")

chain.add_command(reset)


@click.command()
def list():
  """List all chains."""
  for chain in chain_service.list_chains().items():
    print(f"{chain[0]}: {chain[1]}")

chain.add_command(list)


#####################
# Running
#####################


@click.group()
def run():
  """Run chains once or interactively."""
  pass

cli.add_command(run)


def save_results(ctx: LangChainContext, revision_id: str):
  results = ctx.results(revision_id)
  for result in results:
    result_repository.save(result)

  ctx.reset_results()


@click.command()
@click.argument('chain-name')
@click.argument("input", default="-", type=click.File("rb"))
@click.option("--record", is_flag=True, help="Record the inputs and outputs of LLM chains to the database.")
def once(chain_name, input, record):
  """Run a chain revision.
  The revision is read from the database and fed input from stdin or the given file.
  The results are ouput as json to stdout.
  """
  buffer = b""
  for f in input:
    buffer += f

  input_json = buffer.decode('utf-8')
  input = json.loads(input_json)

  chain_service.initialize_services()

  output = chain_service.run_once(chain_name, input, record)

  print(json.dumps(output, indent=2))

run.add_command(once)


@click.command()
@click.argument('chain-name')
@click.option("--record", is_flag=True, help = "Record the inputs and outputs of LLM chains to the database.")
def interactive(chain_name, record):
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
  revision = chain_service.load_by_chain_name(chain_name)

  ctx = LangChainContext(llms=revision.llms, recording=True)
  lang_chain = revision.chain.to_lang_chain(ctx)

  input_keys = set(lang_chain.input_keys)
  output_keys = set(lang_chain.output_keys)
  output_mapping = {re.sub(r"_out$", "_in", key): key
                    for key in output_keys
                    if re.search(r"_out$", key) and re.sub(r"_out$", "_in", key) in input_keys}

  if "input" in input_keys:
    user_input_key = "input"
  elif len(input_keys - output_keys) == 1:
    keys = input_keys - output_keys
    user_input_key = next(iter(keys))
  else:
    print("error inp key", input_keys)
    raise Exception("Chain must have exactly one input key that is not also an output key or an input key called 'input'")

  if "output" in output_keys:
    user_output_key = "output"
  elif len(output_keys - input_keys) == 1:
    user_output_key = list(output_keys - input_keys)[0]
  else:
    raise Exception("Chain must have exactly one output key that is not also an input key or an output key called 'output'")

  chain_service.initialize_services()

  inputs = {key: "" for key in input_keys if key != user_input_key}
  while True:
    inputs[user_input_key] = input(f"{user_input_key}> ")
    outputs = chain_service.run_once(chain_name, inputs, record)

    print(outputs[user_output_key])
    print()

    inputs = {key: outputs[output_mapping[key]] if key in output_mapping else "" for key in input_keys}

run.add_command(interactive)


#####################
# Results
#####################


@click.group()
def results():
  """Show results."""
  pass

cli.add_command(results)


def dict_to_csv_column(d: dict):
  return "\n".join([f"{key}: {value}" for key, value in d.items()])

@click.command()
@click.option("--chain-name", default=None, help="Find results for the current revision of named chain.")
@click.option("--revision", default=None, help="Find results for the given revision id.")
@click.option("--ancestors", is_flag=True, help="Include results for ancestors of specified revision.")
@click.option("--csv-format", is_flag=True, help="Return results as csv instead of json.")
@click.argument("chain-id")
def show(chain_name: str, revision: str, ancestors: bool, csv_format: bool, chain_id: str):
  """Find results for a prompt in for one or more chain revisions.
  One of chain-name or revision must be specified.
  If the ancestors flag is set, results for all ancestors of the specified revision are included.
  Results are output as json or csv (depending on the --csv-format flag) to stdout.
  """
  if chain_name is not None:
    revision = chain_service.load_by_chain_name(chain_name)
  elif revision is not None:
    revision = chain_service.load_by_id(revision)
  else:
    raise Exception("Must specify chain name, revision id, or chain id")  

  results = chain_service.results(revision.id, ancestors)
  if csv_format:
    csv_out = csv.writer(sys.stdout)
    csv_out.writerow(["chain_id", "revision", "input", "output"])
    for result in results:
      csv_out.writerow([
        result.chain_id, 
        result.revision, 
        dict_to_csv_column(result.input),
        result.output,
      ])
  else:
    print('[')
    for result in results:
      print(json.dumps(result.dict(), indent=2, default=lambda o: str(o)), end=',\n')
    print(']')

results.add_command(show)


def add_result(results: Dict, key: str, value: Any):
  if key not in results:
    results[key] = []
  results[key].append(value)

@click.command()
@click.argument('chain-name1')
@click.argument('chain-name2')
@click.option("-c", "--chain-id", help="limit diff to a specific chain id", required=False, type=int)
def diff(chain_name1, chain_name2, chain_id: Optional[int] = None):
  revision1 = chain_service.load_by_chain_name(chain_name1)
  revision2 = chain_service.load_by_chain_name(chain_name2)

  grouped_results = {}

  results1 = chain_service.results(revision1.id, False)
  for result in results1:
    add_result(grouped_results, json.dumps(result.input), result)

  results2 = chain_service.results(revision2.id, False)
  for result in results2:
    add_result(grouped_results, json.dumps(result.input), result)

  csv_out = csv.writer(sys.stdout)
  csv_out.writerow(["input", "revision 1", "revision 2"])
  for input, results in grouped_results.items():
    formatted_input = dict_to_csv_column(json.loads(input))
    if len(results) == 1:
      if results[0].revision == revision1.id:
        csv_out.writerow([formatted_input, results[0].output, ""])
      else:
        csv_out.writerow([formatted_input, "", results[0].output])
    else:
      csv_out.writerow([formatted_input, results[0].output, results[1].output])

results.add_command(diff)
