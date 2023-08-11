import os
from dotenv import load_dotenv
from pymongo import MongoClient


def updateChainType(chain, prefix, update_fields):
  chain_type = chain.get("chain_type")
  if chain_type and chain_type.count("_") == 1:
    update_fields[f"{prefix}.chain_type"] = chain_type.replace("_", "_chain_")

  if "chains" in chain:
    for index, child_chain in enumerate(chain["chains"]):
      updateChainType(child_chain, f"{prefix}.chains.{index}", update_fields)


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
