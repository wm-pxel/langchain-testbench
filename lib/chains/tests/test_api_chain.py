import requests_mock
from chains.api_chain import APIChain

def test_api_chain_get():
  chain = APIChain(
    url='http://localhost:9200/test?q={query}',
    method='get',
    headers={'Authorization': 'Bearer {token}'},
    output_variable='response',
    input_variables=['query', 'token']
  )

  with requests_mock.Mocker() as m:
    response = '{"hits": {"hits": [{"_source": {"text": "x-ray"}}]}}'
    m.get('http://localhost:9200/test?q=x-ray',
      text=response,      
      headers={'Authorization': 'Bearer 1234'}
    )
    inputs = {"query": "x-ray", "token": "1234"}
    output = chain.run(inputs)
    assert output == response


def test_api_chain_post():
  chain = APIChain(
    url='http://localhost:9200/test',
    method='post',
    headers={'Authorization': 'Bearer {token}'},
    body='{{"query": "{query}"}}',
    output_variable='response',
    input_variables=['query', 'token']
  )

  with requests_mock.Mocker() as m:
    response = '{"hits": {"hits": [{"_source": {"text": "x-ray"}}]}}'
    m.post('http://localhost:9200/test', 
      text=response,
      headers={'Authorization': 'Bearer 1234'}
    )
    inputs = {"query": "x-ray", "token": "1234"}
    output = chain.run(inputs)
    assert m.last_request.json() == {"query": "x-ray"}
    assert output == response
