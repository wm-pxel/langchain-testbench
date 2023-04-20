from chains.reformat_chain import ReformatChain

def test_reformat_chain_formats_inputs():
  chain = ReformatChain(
      formatters={"output1": "{input1}-{input2}", "output2": "{input2}"},
      input_variables=["input1", "input2"],
  )

  inputs = {"input1": "foo", "input2": "bar"}
  output = chain._call(inputs)
  assert output == {"output1": "foo-bar", "output2": "bar"}

def test_reformat_chain_decodes_json_inputs():
  chain = ReformatChain(
      formatters={"output1": "{input1}-{input2[a][0]}", "output2": "{input2[a][1]}"},
      input_variables=["input1", "input2"],
      json_inputs=["input2"],
  )

  inputs = {"input1": "foo", "input2": '{"a": [42, 36]}'}
  output = chain._call(inputs)
  assert output == {"output1": "foo-42", "output2": "36"}