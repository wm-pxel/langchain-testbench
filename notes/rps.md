# Rock, Paper, Scissors -- few shot learing with zero shot reasoning

## Paper only strategy
player move | cpu move | result
=======================
rock | paper | player won
scissors | paper | cpu won
scissors | paper | cpu won
scissors | paper | cpu won
scissors | paper | cpu won
scissors | paper | cpu won
scissors | paper | cpu won
scissors | paper | cpu won
scissors | paper | cpu won
scissors | paper | cpu won

### paper
```
First, analyze the game history. If the player has been playing rock more often, then it is likely that they will play rock again. In this case, you should choose paper to win. If the player has been playing scissors more often, then it is likely that they will play scissors again. In this case, you should choose rock to win. If the player has been playing paper more often, then it is likely that they will play paper again. In this case, you should choose scissors to win.
paper
1. Analyze the game history: The player has won the last round by playing paper.

2. Predict the player's next move: Based on the game history, it is likely that the player will choose paper again.

3. Select move that makes cpu win: To win, the cpu should choose scissors.
```

### paper

```1. Analyze the game history: The player has played rock and paper, and won when playing paper.
2. Predict the player's next move: Based on the game history, the player is likely to play paper again.
3. Select move that makes cpu win: Choose scissors.
```

### paper

```
1. Analyze the game history: The player has played paper twice and won both times.

2. Predict the player's next move: Based on the game history, it is likely that the player will play paper again.

3. Select move that makes cpu win: Therefore, the best move for the cpu to make is to choose scissors.
```

### paper
```
1. Analyze all the game history for patterns of player behavior:
Based on the game history, it looks like the player is likely to choose paper.

2. Predict the player's next move based on this analysis:
The player is likely to choose paper.

3. Select move that makes cpu win based on the prediction of the player's move:
Therefore, the move that will make cpu win is scissors.
```
### paper
```
1. Analyze the game history: The player has played paper four times in a row.
2. Predict the player's next move: The player is likely to play paper again.
3. Select move that makes cpu win: Choose scissors.
```
### paper
```
1. Analyze all the game history for patterns of player behavior:
From the game history, it looks like the player is likely to choose paper.

2. Predict the player's next move based on this analysis:
Based on the analysis, it looks like the player is likely to choose paper again.

3. Select move that makes cpu win based on the prediction of the player's move:
Since the player is likely to choose paper, the cpu should choose scissors in order to win.
```
### paper
```
1. Analyze all the game history for patterns of player behavior.

From the game history, it appears that the player is likely to play paper.

2. Predict the player's next move based on this analysis.

Based on the analysis, it appears that the player is likely to play paper.

3. Select move that makes cpu win based on the prediction of the player's move.

Since the player is likely to play paper, the cpu should select scissors in order to win.
```
### paper
```
The player has been playing paper for the last 7 rounds. So, it is likely that the player will choose paper again. Therefore, the best move for the cpu is to choose scissors.
```
### paper
```
1. Analyze the game history: The player has been playing paper for the last 8 rounds.

2. Predict the player's next move: The player is likely to play paper again.

3. Select move that makes cpu win: Choose scissors.
```

## Paper / Rock Strategy

player move | cpu move | result
=======================
paper |  paper | draw
rock |  scissors | player won
paper |  rock | player won
rock |  paper | cpu won
paper |  scissors | cpu won
rock |  paper | cpu won
paper |  scissors | cpu won
rock |  paper | cpu won
paper |  rock | player won
rock |  scissors | player won

### paper
```
If the player has been playing rock, paper, scissors in a consistent pattern, then you can use that pattern to predict their next move. For example, if the player has been playing rock, paper, scissors in the order rock-paper-scissors, then you can predict that they will play rock again. In that case, you should choose paper to win.
```
### rock
```
If the player is likely to choose the same move as last time, then the best move for cpu is to choose the move that beats it. In this case, the best move for cpu is scissors.
```
### paper
```
The player has chosen rock and paper in the past, so they are likely to choose scissors next. Therefore, the move that will make cpu win is rock.
```
### rock
```
The player has won the last two rounds, so they may be more likely to choose the same move again. In this case, they may be more likely to choose rock. Therefore, the best move for the cpu to make is paper.
```
### paper
```
The player has won twice in a row, so they are likely to choose the same move again. Therefore, the best move for cpu to win is to choose the move that beats the player's previous move. In this case, the player has won twice with rock and paper, so the best move for cpu to win is scissors.
```
### rock
```
The player has played rock twice and paper twice. So it is likely that the player will choose rock again. Therefore, the best move for the cpu to make is paper.
```
### paper
```
The player has chosen rock twice and paper twice. So, the player is likely to choose paper this time. Therefore, the cpu should choose scissors to win.
```
### rock
```
The player has played rock twice, paper twice, and scissors twice. So the player is likely to play rock again. Therefore, the best move for the cpu to make next is paper.
```
### paper
```
The player has played rock, paper, scissors in that order. So, the player is likely to choose scissors next. Therefore, the cpu should choose rock.
```
### rock
```
The player has played paper twice, rock twice, and scissors twice. This suggests that the player is likely to choose paper again. Therefore, the best move for the cpu to make is scissors.
```

## Rock / Paper / Scissors Strategy

player move | cpu move | result
=======================
paper |  rock | player won
rock |  paper | cpu won
scissors |  rock | cpu won
paper |  paper | draw
rock |  scissors | player won
scissors |  paper | player won
paper |  scissors | cpu won
rock |  paper | cpu won
scissors |  paper | player won
paper |  paper | draw

### paper
```
If the player has played rock twice in a row, it is likely that they will play scissors next. Therefore, you should choose rock.
```
### rock
```
The player has played paper twice, so it is likely that they will play rock next. Therefore, the best move for the cpu to make is paper.
```
### scissors
```
The player has already played paper and rock. So, the player is likely to choose scissors next. Therefore, the move that makes cpu win is rock.
```
### paper
```
The player has won the last two rounds. So, the player is likely to choose the same move again. Therefore, the best move for cpu to win is to choose the move that beats the player's last move. In this case, it is paper.
```
### rock
```
The player has played rock, paper, and scissors. The most likely move for the player is paper. Therefore, the best move for the cpu is scissors.
```
### scissors
```
The player has played rock twice and paper twice. So it is likely that the player will play rock again. Therefore, the best move for the cpu to win is paper.
```
### paper
```
The player has played rock, paper, and scissors in the past. The most recent move was scissors. Therefore, the player is likely to choose paper next. Therefore, the cpu should choose scissors to win.
```
### rock
```
The player has chosen paper twice and rock twice. So the player is likely to choose rock again. Therefore, the move that makes cpu win is paper.
```
### scissors
```
The player has played rock twice, paper twice, and scissors twice. So the player is likely to choose rock again. Therefore, the move that makes cpu win is paper.
```
### paper
```
The player has played rock twice, paper twice and scissors twice. So, the player is likely to choose rock again. Therefore, the best move for the cpu to win is paper.
```
