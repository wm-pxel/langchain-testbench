import FormatReducer from './FormatReducer'

describe('FormatReducer', () => {
  it('substitutes formatting into text', () => {
    const reducer = new FormatReducer(
      /\d+/g,
      () => '',
      (memo, match) => [memo, `->${match}<-`],
      (_) => undefined,
    );
    const formatted = reducer.format('I have 43 apples and my codename is j0hnny5');
    expect(formatted).toEqual('I have ->43<- apples and my codename is j->0<-hnny->5<-');
  });

  it('reduces as a side effect', () => {
    let allMatches: string[] = [];
    const reducer = new FormatReducer(
      /\d+/g,
      () => allMatches,
      (memo, match) => [[...memo,match], `->${match}<-`],
      (result) => allMatches = result,
    );
    reducer.format('I have 43 apples and my codename is j0hnny5');
    expect(allMatches).toEqual(['43', '0', '5']);
  });


  it('works with capture groups', () => {
    let bracketed: string[] = [];
    const reducer = new FormatReducer(
      /\[(.*?)\:(.*?)]/g,
      () => bracketed,
      (memo, _, result, replacement) => [[...memo, result], replacement],
      (result) => bracketed = result,
    );
    const result = reducer.format('Go to [room1:the living area] and pick up [item1:the fork], please.');
    expect(result).toEqual('Go to the living area and pick up the fork, please.');
    expect(bracketed).toEqual(['room1', 'item1']);
  });
})