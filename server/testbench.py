import logging

import json
from flask import Flask, Response, request
from bson.json_util import dumps
from flask_cors import CORS
from lib.model.chain_revision import ChainRevision
from werkzeug.exceptions import BadRequest
from pydantic.json import pydantic_encoder
from pydantic import parse_obj_as
from typing import List
import lib.chain_service as chain_service

logging.basicConfig(level=logging.INFO)
app = Flask(__name__)

CORS(app)


@app.route("/")
def check():
  return Response('"ok"', mimetype="application/json")


# Create a REST API for the chain service
@app.route("/chains", methods=["GET"])
def list_chains():
  chains = chain_service.list_chains()
  return Response(dumps(chains), mimetype="application/json")


@app.route("/chain/<chain_name>/revision", methods=["POST"])
def save_revision(chain_name):
  try:
    next_revision = ChainRevision.parse_raw(request.data)
  except Exception as e:
    print("ERROR parsing revision:", e)
    return {"error": str(e)}, 400

  revision_id = chain_service.save_revision(chain_name, next_revision)
  return Response(dumps({"revision_id": str(revision_id)}), mimetype="application/json")


@app.route("/chain/<chain_name>/revision", methods=["GET"])
def load_by_chain_name(chain_name):
  revision = chain_service.load_by_chain_name(chain_name)
  return Response(revision.json(), mimetype="application/json")


@app.route("/chain/<chain_name>/history", methods=["GET"])
def history_by_chain_name(chain_name):
  history = chain_service.history_by_chain_name(chain_name)
  return Response(dumps(history), mimetype="application/json")


@app.route("/chain/<chain_name>/patch", methods=["POST"])
def save_patch(chain_name):
  revision_id = chain_service.save_patch(chain_name, request.json)
  return Response(dumps({"revision_id": str(revision_id)}), mimetype="application/json")


@app.route("/chain/<revision_id>", methods=["GET"])
def load_by_id(revision_id):
  revision_id = chain_service.load_by_id(revision_id)
  return Response(dumps({"revision_id": str(revision_id)}), mimetype="application/json")


@app.route("/chain/<chain_name>/results", methods=["GET"])
def load_results_by_chain_name(chain_name):
  results = chain_service.load_results_by_chain_name(chain_name)
  return Response(dumps(results), mimetype="application/json")


@app.route("/chain/<chain_name>/run", methods=["POST"])
def run_chain(chain_name):
  input = request.json
  result = chain_service.run_once(chain_name, input, True)
  return Response(dumps(result.to_dict()), mimetype="application/json")


if __name__ == "__main__":
  app.run(debug=True)


@app.route("/chain/<chain_name>/export", methods=["GET"])
def export_chain(chain_name):
  exported_chain = chain_service.export_chain(chain_name)

  if not exported_chain:
    return Response(
      dumps({"error": f"Chain '{chain_name}' not found."}),
      mimetype="application/json",
      status=404
    )

  chain_json = '[' + ','.join(revision.json() for revision in exported_chain) + ']'
  return Response(
      chain_json,
      mimetype="application/json"
  )


@app.route("/chain/<chain_name>/import", methods=["POST"])
def import_chain_route(chain_name):
  logging.info(f"Importing chain '{chain_name}'")
  try:
    json_data = request.get_json()
    if json_data is None:
      raise BadRequest("JSON data not present in request")

    revisions = parse_obj_as(List[ChainRevision], json_data)

    chain_service.import_chain(chain_name, revisions)
    return Response(
      dumps({"success": f"Import of '{chain_name}' successful."}),
      mimetype="application/json",
      status=200
    )
  except Exception as e:
    logging.error(f"Import of '{chain_name}' failed. Reason: {str(e)}")
    return Response(
      dumps({"error": f"Import of '{chain_name}' failed. Reason: {str(e)}"}),
      mimetype="application/json",
      status=400
    )


def allowed_file(filename):
  ALLOWED_EXTENSIONS = {'json'}
  return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
