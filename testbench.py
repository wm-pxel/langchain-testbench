from flask import Flask, Response
from flask_pymongo import PyMongo
from bson.json_util import dumps

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://testbench:testbench@localhost:27017/testbench"
mongo = PyMongo(app)

@app.route("/")
def hello_world():
  graphs = mongo.db.graphs.find_one({"foo": "bar"})
  print("GRAPHS:", graphs)
  return Response(dumps(graphs), mimetype="application/json")