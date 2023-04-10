from pprint import pprint
from model.test_chain import TestChain
from model.chain_revision import ChainRevision
from db import test_chain_repository, chain_revision_repository
from langchain.prompts import PromptTemplate
from langchain.llms import OpenAI
from langchain.chains import LLMChain, SequentialChain


def pretty_print(clas, indent=0):
  print(' ' * indent +  type(clas).__name__ +  ':')
  indent += 4
  for k,v in clas.__dict__.items():
    if '__dict__' in dir(v):
      pretty_print(v,indent)
    else:
      print(' ' * indent +  k + ': ' + str(v))


test_chain = TestChain(name="test")

test_chain_repository.save(test_chain)

categorization_template = '''Context: ${context}\n The following is a list of categories
that insurance customer questions fall into:

Questions about whether insurance will cover a medical procedure or service, Questions about how much insurance will cover for a medical procedure or service, Other statements or questions.

{user_input}

Category:'''

template2 = "Sumarize this response:\n\n{category}\n\nSummary:"

llm = OpenAI(temperature=0.7)

chain1 = LLMChain(llm=llm, prompt=PromptTemplate(input_variables=["context", "user_input"], template=categorization_template), output_key="category", verbose=True)
chain2 = LLMChain(llm=llm, prompt=PromptTemplate(input_variables=["category"], template=template2), verbose=True)
chain = ESequentialChain(
  input_variables=["context", "user_input"],
  output_variables=["text"],
  chains=[chain1, chain2]
)

revision = ChainRevision(parent=test_chain.id, major=0, minor=0, chain=chain)
chain_revision_repository.save(revision)


records = chain_revision_repository.find_by({})
revisions = [x for x in records]

pretty_print(revisions[0], indent=2)

for revision in revisions:
  print(chain_revision_repository.delete(revision))

records = test_chain_repository.find_by({})
chains = [x for x in records]
print(chains[0])

for c in chains:
  print(test_chain_repository.delete(c))