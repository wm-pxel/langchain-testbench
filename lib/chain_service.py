import logging
import traceback
from types import MappingProxyType
from typing import Optional, Dict
import json

from huggingface_hub.inference_api import InferenceApi
from langchain import HuggingFaceHub, OpenAI
from langchain.callbacks import SharedCallbackManager
from lib.model.chain_revision import ChainRevision, find_ancestor_ids
from lib.model.chain import Chain
from lib.model.chain_spec import LLMSpec
from lib.model.lang_chain_context import LangChainContext
from lib.db import chain_revision_repository, chain_repository, result_repository
from bson import ObjectId
import dotenv

logging.basicConfig(level=logging.INFO)
cs_logger = logging.getLogger("chain_service")


dotenv.load_dotenv()

class CustomJSONEncoder(json.JSONEncoder):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    def default(self, obj):
        if isinstance(obj, OpenAI):
            return obj.__dict__
        elif isinstance(obj, ChainRevision):
            return obj.__dict__
        elif isinstance(obj, type):
            return {}
        elif isinstance(obj, SharedCallbackManager):
            return {}
        elif isinstance(obj, MappingProxyType):
            return dict(obj)  
        elif isinstance(obj, classmethod):
            return {}
        elif isinstance(obj, HuggingFaceHub):
            return obj.__dict__
        elif isinstance(obj, InferenceApi):
            return obj.__dict__
        # Handle other custom objects if needed
        return super().default(obj)

def save_revision(chain_name, revision) -> str:
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
  
  return revision.id


def load_by_chain_name(chain_name):
  chain = chain_repository.find_one_by({"name": chain_name})
  return chain_revision_repository.find_one_by_id(chain.revision)


def load_by_id(revision_id):
  return chain_revision_repository.find_one_by_id(revision_id)


def history_by_chain_name(chain_name):
  """return the ids of all revisions of the chain.
  """
  chain = chain_repository.find_one_by({"name": chain_name})
  revision = chain_revision_repository.find_one_by_id(chain.revision)
  return [revision.id] + find_ancestor_ids(revision.id, chain_revision_repository)


def save_patch(chain_name, patch) -> str:
  chain = chain_repository.find_one_by({"name": chain_name})
  revision = chain_revision_repository.find_one_by_id(chain.revision)
  new_chain = revision.chain.copy_replace(lambda spec: patch if spec.chain_id == patch.chain_id else spec)

  try:
    ctx = LangChainContext(llms=revision.llms)
    revision.chain.to_lang_chain(ctx)
  except Exception as e:
    raise ValueError("Could not realize patched chain:", e)

  new_revision = revision.copy()
  new_revision.id = None
  new_revision.chain = new_chain
  new_revision.parent = revision.id

  chain_revision_repository.save(new_revision)
  chain.revision = new_revision.id
  chain_repository.save(chain)

  return revision.id

def branch(chain_name, branch_name):
  """Branch a chain revision.
  This will create a new chain that points to the same revision
  as the provided chain. The new chain may be then revised independently.
  """
  chain = chain_repository.find_one_by({"name": chain_name})

  new_chain = Chain(
    name = branch_name,
    revision = chain.revision,
  )
  chain_repository.save(new_chain)


def reset(chain_name, revision):
  """Reset a chain to a another revision.
  This will update the chain to point to the given revision.
  """
  new_revision = chain_revision_repository.find_one_by({"id": ObjectId(revision)})
  if new_revision is None:
    raise ValueError(f"Revision {revision} not found")

  chain = chain_repository.find_one_by({"name": chain_name})
  chain.revision = new_revision.id
  chain_repository.save(chain)


def list_chains():
  """List all chains."""
  return {chain_name.name: str(chain_name.revision) for chain_name in chain_repository.find_by({})}

def save_results(ctx: LangChainContext, revision_id: str):
  results = ctx.results(revision_id)
  for result in results:
    result_repository.save(result)

  ctx.reset_results()


def run_once(chain_name, input, record):
  """Run a chain revision.
  The revision is read from the database and fed input from stdin or the given file.
  The results are ouput as json to stdout.
  """
  chain = chain_repository.find_one_by({"name": chain_name})
  revision = chain_revision_repository.find_one_by_id(chain.revision)

  ctx = LangChainContext(llms=revision.llms, recording=True)
  lang_chain = revision.chain.to_lang_chain(ctx)
  output = lang_chain._call(input)

  if (record):
    save_results(ctx, revision.id)

  return output


def results(revision_id: str, ancestors: bool, chain_id: Optional[str] = None):
  """Find results for a prompt in for one or more chain revisions.
  One of chain-name or revision must be specified.
  If the ancestors flag is set, results for all ancestors of the specified revision are included.
  """
  revision_ids = [ObjectId(revision_id)]
  # if ancestors are requested, find all ancestors of the specified revision
  if ancestors:
    ancestors_id = find_ancestor_ids(revision_id, chain_revision_repository)
    revision_ids += [ObjectId(i) for i in ancestors_id]

  return result_repository.find_by({"revision": {"$in": revision_ids}, "chain_id": int(chain_id)})

def export_chain(chain_name: str) -> str:
    chain = chain_repository.find_one_by({"name": chain_name})
    if chain is None:
        return None

    chain_revision = chain_revision_repository.find_one_by_id(chain.revision)
    if chain_revision is None:
        return None

    ancestor_ids = find_ancestor_ids(chain_revision.id, chain_revision_repository)
    chain_revisions = [chain_revision]

    for ancestor_id in ancestor_ids:
        ancestor_revision = chain_revision_repository.find_one_by_id(ancestor_id)
        if ancestor_revision:
            chain_revisions.append(ancestor_revision)

    exported_chain = {
        "name": chain.name,
        "revisions": []
    }

    for revision in chain_revisions:
        exported_revision = {
            "_id": str(revision.id),
            "parent": str(revision.parent) if revision.parent else None,
            "chain": revision.chain.dict(),
            "llms": {}
        }
        for llm_key in revision.llms.keys():
          llm = revision.llms[llm_key]
          llm_dict = vars(llm)
          llm_dict["_type"] = determine_llm_type(llm)
          exported_revision["llms"][llm_key] = llm_dict  

        exported_chain["revisions"].append(exported_revision)

    return json.dumps(
        exported_chain,
        indent=2,
        cls=CustomJSONEncoder
    )

def determine_llm_type(llm):
    if isinstance(llm, OpenAI):
        return "openai"
    elif isinstance(llm, HuggingFaceHub):
        return "huggingface_hub"
    else:
        # Handle other cases or raise an error
        return "unknown"

def import_chain(chain_name, json_string):
    data = json.loads(json_string)

    id_mapping = {}

    for revision in data["revisions"]:
        old_id = revision["_id"]
        new_id = ObjectId()

        id_mapping[old_id] = new_id

        revision["_id"] = new_id

    root_revision = None

    for revision in data["revisions"]:
        try:
          if revision["parent"]:
              revision["parent"] = id_mapping[revision["parent"]]
          else:
             root_revision = revision
          chain_revision = ChainRevision(**revision)

          chain_revision_repository.save(chain_revision)
        except Exception as e:
          traceback.print_exc()

    leaf_revision = find_leaf_revision(data["revisions"], root_revision)

    chain = Chain(name=chain_name, revision=leaf_revision)
    chain_repository.save(chain)

def find_leaf_revision(revisions, current_revision):
    for revision in revisions:
        if revision["parent"] == current_revision["_id"]:
            # recurse on child
            return find_leaf_revision(revisions, revision)
    # if no child found, current_revision is a leaf
    return current_revision["_id"]


