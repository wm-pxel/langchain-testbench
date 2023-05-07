from flask import Flask, Response
from flask_pymongo import PyMongo
from bson.json_util import dumps
import lib.chain_service as chain_service

app = Flask(__name__)

@app.route("/")
def check():
  return Response('"ok"', mimetype="application/json")

# Create a REST API for the chain service
@app.route("/chains", methods=["GET"])
def list_chains():
  chains = chain_service.list_chains()
  return Response(dumps(chains), mimetype="application/json")

@app.route("/chain/<chain_name>/revision", methods=["POST"])
def save_revision(request, chain_name):
  revision = chain_service.save_revision(chain_name, request.json)
  return Response(dumps(revision), mimetype="application/json")

@app.route("/chain/<chain_name>/revision", methods=["GET"])
def load_by_chain_name(chain_name):
  revision = chain_service.load_by_chain_name(chain_name)
  return Response(dumps(revision), mimetype="application/json")

@app.route("/chain/<chain_name>/history", methods=["GET"])
def history_by_chain_name(chain_name):
  history = chain_service.history_by_chain_name(chain_name)
  return Response(dumps(history), mimetype="application/json")

@app.route("/chain/<chain_name>/patch", methods=["POST"])
def save_patch(request, chain_name):
  revision = chain_service.save_patch(chain_name, request.json)
  return Response(dumps(revision), mimetype="application/json")

@app.route("/chain/<revision_id>", methods=["GET"])
def load_by_id(revision_id):
  revision = chain_service.load_by_id(revision_id)
  return Response(dumps(revision), mimetype="application/json")

@app.route("/chain/<chain_name>/results", methods=["GET"])
def load_results_by_chain_name(chain_name):
  results = chain_service.load_results_by_chain_name(chain_name)
  return Response(dumps(results), mimetype="application/json")

@app.route("/chain/<chain_name>/run", methods=["POST"])
def run_chain(request, chain_name):
  result = chain_service.run_chain(chain_name, request.json)
  return Response(dumps(result), mimetype="application/json")

if __name__ == "__main__":
  app.run(debug=True)