from chains.case_chain import CaseChain
from model.chain_spec import BaseSpec, LLMSpec, SequentialSpec, CaseSpec
from model.lang_chain_context import LangChainContext
from langchain.llms.fake import FakeListLLM


def test_base_spec_serialization():
    base_spec = BaseSpec(
        chain_id=1,
        input_keys=["input1", "input2"],
        output_keys=["output1", "output2"],
    )
    serialized = base_spec.json()
    assert serialized == '{"chain_id": 1, "input_keys": ["input1", "input2"], "output_keys": ["output1", "output2"]}'
    deserialized = BaseSpec.parse_raw(serialized)
    assert deserialized == base_spec


def test_llm_spec_serialization():
    llm_spec = LLMSpec(
        chain_id=1,
        input_keys=["input1", "input2"],
        output_keys=["output1", "output2"],
        prompt="prompt",
        llm_key="llm_key",
        chain_type="llm_spec",
    )
    serialized = llm_spec.json()
    assert serialized == '{"chain_id": 1, "input_keys": ["input1", "input2"], "output_keys": ["output1", "output2"], "chain_type": "llm_spec", "prompt": "prompt", "llm_key": "llm_key"}'
    deserialized = LLMSpec.parse_raw(serialized)
    assert deserialized == llm_spec


def test_llm_spec_to_lang_chain_creates_valid_chain():
    prompt_template = "the prompt {input1} {input2}"
    llm_spec = LLMSpec(
        chain_id=1,
        input_keys=["input1", "input2"],
        output_keys=["output1"],
        prompt=prompt_template,
        llm_key="test",
        chain_type="llm_spec",
    )
    llms = llms={"test": FakeListLLM(responses=["response1"])}
    ctx = LangChainContext(llms=llms)
    llm_chain = llm_spec.to_lang_chain(ctx)

    assert llm_chain.input_keys == ["input1", "input2"]
    assert llm_chain.output_key == "output1"
    assert llm_chain.prompt.template == prompt_template
    assert llm_chain.llm == llms["test"]

    output = llm_chain.run({"input1": "input1", "input2": "input2"})
    assert output == "response1"


def test_sequential_spec_serialization():
    sequential_spec = SequentialSpec(
        chain_id=1,
        input_keys=["input1", "input2"],
        output_keys=["output1", "output2"],
        chain_type="sequential_spec",
        chains=[
            LLMSpec(
                chain_id=1,
                input_keys=["input1", "input2"],
                output_keys=["output1", "output2"],
                prompt="prompt",
                llm_key="llm_key",
                chain_type="llm_spec"
            )
        ],
    )
    serialized = sequential_spec.json()
    assert serialized == '{"chain_id": 1, "input_keys": ["input1", "input2"], "output_keys": ["output1", "output2"], "chain_type": "sequential_spec", "chains": [{"chain_id": 1, "input_keys": ["input1", "input2"], "output_keys": ["output1", "output2"], "chain_type": "llm_spec", "prompt": "prompt", "llm_key": "llm_key"}]}'
    deserialized = SequentialSpec.parse_raw(serialized)
    assert deserialized == sequential_spec 


def test_sequential_spec_to_lang_chain_creates_valid_chain():
    llm_spec1 = LLMSpec(
                chain_id=1,
                input_keys=["input1", "input2"],
                output_keys=["llm1_output"],
                prompt="the prompt {input1} {input2}",
                llm_key="test",
                chain_type="llm_spec",
            )
    llm_spec2 = LLMSpec(
                chain_id=2,
                input_keys=["llm1_output", "input3"],
                output_keys=["llm2_output"],
                prompt="the prompt {llm1_output} {input3}",
                llm_key="test",
                chain_type="llm_spec",
            )

    sequential_spec = SequentialSpec(
        chain_id=3,
        input_keys=["input1", "input2", "input3"],
        output_keys=["llm2_output"],
        chain_type="sequential_spec",
        chains=[llm_spec1, llm_spec2],
    )

    llms = llms={"test": FakeListLLM(responses=["fake_response1", "fake_response2"])}
    ctx = LangChainContext(llms=llms)
    sequential_chain = sequential_spec.to_lang_chain(ctx)

    assert sequential_chain.input_keys == ["input1", "input2", "input3"]
    assert sequential_chain.output_keys == ["llm2_output"]
    assert sequential_chain.chains[0].input_keys == ["input1", "input2"]
    assert sequential_chain.chains[0].output_keys == ["llm1_output"]
    assert sequential_chain.chains[0].prompt.template == llm_spec1.prompt
    assert sequential_chain.chains[0].llm == llms["test"]

    assert sequential_chain.chains[1].input_keys == ["llm1_output", "input3"]
    assert sequential_chain.chains[1].output_keys == ["llm2_output"]
    assert sequential_chain.chains[1].prompt.template == llm_spec2.prompt
    assert sequential_chain.chains[1].llm == llms["test"]

    output = sequential_chain.run({"input1": "input1", "input2": "input2", "input3": "input3"})
    assert output == "fake_response2"


def test_case_spec_serialization():
    case_spec = CaseSpec(
        chain_id=3,
        input_keys=["input1", "input2", "input3", "input4"],
        output_keys=["output"],
        chain_type="case_spec",
        cases={
            "response1": LLMSpec(
                chain_id=1,
                input_keys=["input1", "input2"],
                output_keys=["output"],
                prompt="prompt",
                llm_key="test",
                chain_type="llm_spec"
            ),
            "response2": LLMSpec(
                chain_id=2,
                input_keys=["input3", "input4"],
                output_keys=["output"],
                prompt="prompt",
                llm_key="test",
                chain_type="llm_spec"
            )
        },
    )
    serialized = case_spec.json()
    deserialized = CaseSpec.parse_raw(serialized)
    assert deserialized == case_spec