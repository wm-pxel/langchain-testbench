TODO:
* Bug: It is somehow possible to save an LLM within a sequence that is missing it's input keys. Updating input text resolves issue.
* Bug: Renaming 'llm' does not update the objects that reference it.
* Bug: Loding revision does not necessarily put it in the readyToInteract state.
* Bug: load revision is enables and interact is disabled after save (should be opposite)

* Rework header so user is asked to either create a new chain (and name it) or load an existing chain.
* UI shouldn't be editable until a new branch name is created or an existing one is loaded.
* Validation (e.g. case must have categorization_key)
* Add the ability to delete chains.
* Error responses from server for saves and interactive tests.
* Ensure user cannot create a new chain with an existing branch name.
* Include nested inputs in the response
* Within Reformat Chains, outputs of formatters should be available as inputs to subsequent formatters. This will require an update to the ReformatChain and a modification of the FormatReducer logic for inputs in the designer.
* Add a nextChainId field to revisions and associated logic so deleting and adding chains will not give unrelated chains the same id
* Add inputs and outputs to the left and right side of the chain.
* Change the color of outputs in the designer.
* Add disclosure widget for headers and body of API designer
