
import click
from model.chain_revision import ChainRevision
from model.chain import Chain
from model.lang_chain_context import LangChainContext
from db import chain_revision_repository, chain_repository
import dotenv
import json

dotenv.load_dotenv()

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