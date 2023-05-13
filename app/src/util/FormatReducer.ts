
type MatchReducerInitializer<K> = () => K;
type MatchReducer<K> = (memo: K, ...matches: string[]) => [K, string];
type MatchReducerResultHandler<K> = (result: K) => void;

/**
 * FormatReducer is a utility class for formatting text using a regular expression
 * and capturing the results of the match.
 */
class FormatReducer<K> {
  private initializer: MatchReducerInitializer<K>;
  private regex: RegExp;
  private reducer: MatchReducer<K>;
  private resultHandler: MatchReducerResultHandler<K>;

  /**
   * Initialize a FormatReducer.
   * @param regex the regular expression to use for the match. It must have the global flag set.
   * @param initializer returns the initial state for the reducer.
   * @param reducer Handle the match results by returning the next state and the replacement string.
   * @param resultHandler receives the final state after all matches have been processed.
   */
  constructor(
    regex: RegExp,
    initializer: MatchReducerInitializer<K>,
    reducer: MatchReducer<K>,
    resultHandler: MatchReducerResultHandler<K>,
  ) {
    this.regex = regex;
    this.initializer = initializer;
    this.reducer = reducer;
    this.resultHandler = resultHandler;
  }

  /**
   * Uses the reducer to reformat the text with possible side effects like capturing matches.
   * @param text the text to be processed
   * @returns the formatted text
   */
  public format(text: string): string {
    let state = this.initializer();
    const formatted = text.replace(this.regex, (match, ...matches) => {
      const [nextState, replacement] = this.reducer(state, match, ...matches);
      state = nextState;
      return replacement;
    });
    this.resultHandler(state);
    return formatted;
  }
}

export default FormatReducer;