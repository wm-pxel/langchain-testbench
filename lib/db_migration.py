import os
from dotenv import load_dotenv
from pymongo import MongoClient

chain_spec_conversion = {
      "llm_spec": "llm_chain_spec",
      "chat_spec": "chat_chain_spec",
      "sequential_spec": "sequential_chain_spec",
      "case_spec": "case_chain_spec",
      "reformat_spec": "reformat_chain_spec",
      "transform_spec": "transform_chain_spec",
      "api_spec": "api_chain_spec",
      "vector_search_spec": "vector_search_chain_spec"
}


def updateChainType(chain, prefix, update_fields):
  # make sure chain_type is properly formatted
  try:
    chain_type = chain.get("chain_type")

    if chain_type and chain_type in chain_spec_conversion:
      update_fields[f"{prefix}.chain_type"] = chain_spec_conversion[chain_type]

  except Exception as e:
    print(e, chain, flush=True)

  # recursively handle sequential chains
  if "chains" in chain:
    if type(chain["chains"]) is list:
      for index, child_chain in enumerate(chain["chains"]):
        updateChainType(child_chain, f"{prefix}.chains.{index}", update_fields)
    else:
      for key, child_chain in chain["chains"].items():
        updateChainType(child_chain, f"{prefix}.chains.{key}", update_fields)

  # recursively handle case chains
  if "cases" in chain:
    for key, case in chain["cases"].items():
      updateChainType(case, f"{prefix}.cases.{key}", update_fields)
    updateChainType(chain["default_case"], f"{prefix}.default_case", update_fields)


load_dotenv()

client = MongoClient(host=["localhost:27017"],
                     username="mongoadmin",
                     password=os.environ["MONGO_ROOT_PASSWORD"])
database = client[os.environ["MONGODB_DATABASE"]]

chain_revisions = database["chain_revisions"]

for revision in chain_revisions.find({}):
  update_fields = {}
  unset_fields = {}

  # Handle the recursive case when chains have children
  updateChainType(revision["chain"], "chain", update_fields)

  for key, llm in revision.get("llms", {}).items():
    if "_type" in llm and llm["_type"] is not None:
      llm_type = llm["_type"].replace("_llm", "")
      update_fields[f"llms.{key}.llm_type"] = llm_type
      unset_fields[f"llms.{key}._type"] = ""

  if update_fields or unset_fields:
    try:
      updates = {}
      if update_fields:
        updates["$set"] = update_fields
      if unset_fields:
        updates["$unset"] = unset_fields
      chain_revisions.update_one({"_id": revision["_id"]}, updates)
    except Exception as e:
      print(f"Error updating document with _id={revision['_id']}: {e}")

client.close()
