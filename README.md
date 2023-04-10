# testbench
A system for testing chains

Types:

Chain
  name

ChainRevision
  chain
  major_version
  minor_version
  specification
  prompt_revisions

Prompt
  name

PrompRevision
  major_revision
  minor_revision
  prompt

Test
  inputs
  outputs
  prompt_or_chain_revision
  grades
