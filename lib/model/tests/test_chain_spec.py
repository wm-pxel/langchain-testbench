from model.chain_spec import LLMSpec, SequentialSpec, CaseSpec, APISpec, ReformatSpec
from model.lang_chain_context import LangChainContext
from langchain.llms.fake import FakeListLLM
from model.tests.factory import SpecFactoryContext, llm_factory, sequential_factory, case_factory

def test_llm_spec_serialization():
    llm_spec = LLMSpec(
        chain_id=1,
        input_keys=["input1", "input2"],
        output_key="output1",
        prompt="prompt",
        llm_key="llm_key",
        chain_type="llm_spec",
    )
    serialized = llm_spec.json()
    assert serialized == '{"chain_id": 1, "input_keys": ["input1", "input2"], "output_key": "output1", "chain_type": "llm_spec", "prompt": "prompt", "llm_key": "llm_key"}'
    deserialized = LLMSpec.parse_raw(serialized)
    assert deserialized == llm_spec


def test_llm_spec_to_lang_chain_creates_valid_chain():
    prompt_template = "the prompt {input1} {input2}"
    llm_spec = LLMSpec(
        chain_id=1,
        input_keys=["input1", "input2"],
        output_key="output1",
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

    output = llm_chain._call({"input1": "input1", "input2": "input2"})
    assert output == {"output1": "response1"}


def test_llm_spec_to_lang_chain_creates_recording_chain():
    prompt_template = "the prompt {input1} {input2}"
    llm_spec = LLMSpec(
        chain_id=1,
        input_keys=["input1", "input2"],
        output_key="output1",
        prompt=prompt_template,
        llm_key="test",
        chain_type="llm_spec",
    )
    llms = llms={"test": FakeListLLM(responses=["response1"])}
    ctx = LangChainContext(llms=llms, recording=True)
    llm_chain = llm_spec.to_lang_chain(ctx)

    assert len(ctx.prompts) == 1

    output = llm_chain._call({"input1": "input1", "input2": "input2"})

    assert output == {"output1": "response1"}
    assert ctx.prompts[0].calls == [
        ({"input1": "input1", "input2": "input2"}, {"output1": "response1"})
    ]


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
                output_key="output1",
                prompt="prompt",
                llm_key="llm_key",
                chain_type="llm_spec"
            )
        ],
    )
    serialized = sequential_spec.json()
    deserialized = SequentialSpec.parse_raw(serialized)
    assert deserialized == sequential_spec 


def test_sequential_spec_to_lang_chain_creates_valid_chain():
    llm_spec1 = LLMSpec(
                chain_id=1,
                input_keys=["input1", "input2"],
                output_key="llm1_output",
                prompt="the prompt {input1} {input2}",
                llm_key="test",
                chain_type="llm_spec",
            )
    llm_spec2 = LLMSpec(
                chain_id=2,
                input_keys=["llm1_output", "input3"],
                output_key="llm2_output",
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
        chain_type="case_spec",
        categorization_key="categorization_input",
        cases={
            "response1": LLMSpec(
                chain_id=1,
                input_keys=["input1", "input2"],
                output_key="output",
                prompt="prompt",
                llm_key="test",
                chain_type="llm_spec"
            ),
            "response2": LLMSpec(
                chain_id=2,
                input_keys=["input3", "input4"],
                output_key="output",
                prompt="prompt",
                llm_key="test",
                chain_type="llm_spec"
            )
        },
        default_case=LLMSpec(
            chain_id=4,
            input_keys=["input1", "input2"],
            output_key="output",
            prompt="prompt",
            llm_key="test",
            chain_type="llm_spec"
        ),
    )
    serialized = case_spec.json()
    deserialized = CaseSpec.parse_raw(serialized)
    assert deserialized == case_spec


def test_case_spec_to_lang_chain_creates_valid_chain():
    llms = {"test1": FakeListLLM(responses=["fake_response1"]), "test2": FakeListLLM(responses=["fake_response2"])}
    llm_spec1 = LLMSpec(
                chain_id=1,
                input_keys=["input1", "input2"],
                output_key="output",
                prompt="ll1 prompt {input1} {input2}",
                llm_key="test1",
                chain_type="llm_spec",
            )
    llm_spec2 = LLMSpec(
                chain_id=2,
                input_keys=["input3", "input4"],
                output_key="output",
                prompt="llm2 prompt {input3} {input4}",
                llm_key="test2",
                chain_type="llm_spec",
            )
    llm_spec3 = LLMSpec(
                chain_id=4,
                input_keys=["input1", "input2"],
                output_key="output",
                prompt="default prompt {input1} {input2}",
                llm_key="test1",
                chain_type="llm_spec"
            )

    case_spec = CaseSpec(
        chain_id=3,
        chain_type="case_spec",  
        categorization_key="categorization_input",      
        cases={
            "response1": llm_spec1,
            "response2": llm_spec2,
        },
        default_case=llm_spec3,
    )

    ctx = LangChainContext(llms=llms)
    case_chain = case_spec.to_lang_chain(ctx)

    assert case_chain.input_keys == ["categorization_input", "input1", "input2", "input3", "input4"]
    assert case_chain.output_keys == ["output"]
    assert case_chain.subchains["response1"].input_keys == ["input1", "input2"]
    assert case_chain.subchains["response1"].output_keys == ["output"]
    assert case_chain.subchains["response1"].prompt.template == llm_spec1.prompt
    assert case_chain.subchains["response1"].llm == llms["test1"]

    assert case_chain.subchains["response2"].input_keys == ["input3", "input4"]
    assert case_chain.subchains["response2"].output_keys == ["output"]
    assert case_chain.subchains["response2"].prompt.template == llm_spec2.prompt
    assert case_chain.subchains["response2"].llm == llms["test2"]

    assert case_chain.default_chain.input_keys == ["input1", "input2"]
    assert case_chain.default_chain.output_keys == ["output"]
    assert case_chain.default_chain.prompt.template == llm_spec3.prompt
    assert case_chain.default_chain.llm == llms["test1"]

    output = case_chain.run({
        "categorization_input": "response2",
        "input1": "input1", 
        "input2": "input2",
        "input3": "input3",
        "input4": "input4"
    })
    assert output == "fake_response2"


def test_api_chain_spec_serialization():
    api_spec = APISpec(
        chain_id=3,
        chain_type="api_spec",
        input_keys=["input1", "input2"],
        output_key="output",
        url="http://test.com",
        method="POST",
        body="body {input1} {input2}",
        headers={"header1": "header1"},
    )
    serialized = api_spec.json()
    deserialized = APISpec.parse_raw(serialized)
    assert deserialized == api_spec


def test_api_chain_spec_to_lang_chain_creates_valid_chain():
    api_spec = APISpec(
        chain_id=3,
        chain_type="api_spec",
        input_keys=["input1", "input2"],
        output_key="output",
        url="http://test.com",
        method="POST",
        body="body {input1} {input2}",
        headers={"header1": "header1"},
    )
    ctx = LangChainContext(llms={})
    api_chain = api_spec.to_lang_chain(ctx)

    assert api_chain.input_keys == ["input1", "input2"]
    assert api_chain.output_keys == ["output"]
    assert api_chain.url == "http://test.com"
    assert api_chain.method == "POST"
    assert api_chain.body == "body {input1} {input2}"
    assert api_chain.headers == {"header1": "header1"}


def test_reformat_spec_serialization():
    reformat_spec = ReformatSpec(
        chain_id=3,
        chain_type="reformat_spec",
        input_keys=["input1", "input2"],
        formatters={"output1": "formatter1", "output2": "formatter2"},
    )
    serialized = reformat_spec.json()
    deserialized = ReformatSpec.parse_raw(serialized)
    assert deserialized == reformat_spec


def test_reformat_spec_to_lang_chain_creates_valid_chain():
    reformat_spec = ReformatSpec(
        chain_id=3,
        chain_type="reformat_spec",
        input_keys=["input1", "input2"],
        formatters={"output1": "formatter1", "output2": "formatter2"},
    )
    ctx = LangChainContext(llms={})
    reformat_chain = reformat_spec.to_lang_chain(ctx)

    assert reformat_chain.input_keys == ["input1", "input2"]
    assert reformat_chain.output_keys == ["output1", "output2"]
    assert reformat_chain.formatters == {"output1": "formatter1", "output2": "formatter2"}


class ChainDict:
    def __init__(self):
        self.chains = {}
    
    def add_chain(self, chain):
        self.chains[chain.chain_id] = chain


def test_chain_spec_copy_replace():
    ctx = SpecFactoryContext()
    chain = sequential_factory(ctx, chains=[
        llm_factory(ctx),
        case_factory(ctx, cases={
            "case1": llm_factory(ctx),
            "case2": sequential_factory(ctx, chains=[llm_factory(ctx), llm_factory(ctx)]),
        }, default_case=llm_factory(ctx)),
    ])

    original_specs = ChainDict()
    chain.traverse(original_specs.add_chain)
    copied_specs = {}
    
    copied_chain = chain.copy_replace(lambda spec: spec)
    copied_specs = ChainDict()
    copied_chain.traverse(copied_specs.add_chain)

    assert len(original_specs.chains) == len(copied_specs.chains)

    for chain_id, spec in original_specs.chains.items():
        copied_spec = copied_specs.chains.get(chain_id)
        assert copied_spec is not None
        assert copied_spec == spec
        assert copied_spec is not spec

    replacement = copied_specs.chains[3]
    replacement.prompt = "replaced"
    replace_chain = chain.copy_replace(lambda spec: spec if spec.chain_id != 3 else replacement)
    replace_specs = ChainDict()
    replace_chain.traverse(replace_specs.add_chain)

    assert len(original_specs.chains) == len(replace_specs.chains)
    assert replace_specs.chains[3] == replacement
    assert replace_specs.chains[3].prompt == "replaced"


def test_base_spec_find_by_chain_id():
    ctx = SpecFactoryContext()
    deep_llm = llm_factory(ctx)
    chain = sequential_factory(ctx, chains=[
        llm_factory(ctx),
        case_factory(ctx, cases={
            "case1": llm_factory(ctx),
            "case2": sequential_factory(ctx, chains=[llm_factory(ctx), deep_llm]),
        }, default_case=llm_factory(ctx)),
    ])

    assert chain.find_by_chain_id(deep_llm.chain_id) == deep_llm