# testbench
A system for designing and testing chains

TODO:
* Error responses from server for saves and interactive tests.
* Include nested inputs in the response
* Bug: Fix HighlightedDisplay alignment issue between textarea and display.
* save does not always save what's displayed on screen
* Bug: load revision is enables and interact is disabled after save (should be opposite)
* Within Reformat Chains, outputs of formatters should be available as inputs to subsequent formatters. This will require an update to the ReformatChain and a modification of the FormatReducer logic for inputs in the designer.
* Add LLM specification pane (initially only for OpenAI LLMs)
* Add other LLM specification options.
* Add the ability to delete chains.
* Add inteterminate spinner when waiting for interactive response.
* Add a nextChainId field to revisions and associated logic so deleting and adding chains will not give unrelated chains the same id
* Add inputs and outputs to the left and right side of the chain.
* Change the color of outputs in the designer.
* Add disclosure widget for headers and body of API designer
* Allow cancel of a chain insertion (possibly turn the + to an x so that clicking it closes the widget)