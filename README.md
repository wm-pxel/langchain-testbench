# testbench
A system for designing and testing chains

TODO:
* Add spinner and disable input when interactive request is being made.
* Error responses from server for saves and interactive tests.
* Rework header so user is asked to either create a new chain (and name it) or load an existing chain.
* Ensure user cannot create a new chain with an existing branch name.
* UI shouldn't be editable until a new branch name is created or an existing one is loaded.
* Add the ability to delete chains.
* Allow cancel of a chain insertion (possibly turn the + to an x so that clicking it closes the widget)
* Include nested inputs in the response
* Bug: Fix HighlightedDisplay alignment issue between textarea and display.
* Bug: load revision is enables and interact is disabled after save (should be opposite)
* save does not always save what's displayed on screen?
* Within Reformat Chains, outputs of formatters should be available as inputs to subsequent formatters. This will require an update to the ReformatChain and a modification of the FormatReducer logic for inputs in the designer.
* Add inteterminate spinner when waiting for interactive response.
* Add a nextChainId field to revisions and associated logic so deleting and adding chains will not give unrelated chains the same id
* Add inputs and outputs to the left and right side of the chain.
* Change the color of outputs in the designer.
* Add disclosure widget for headers and body of API designer
