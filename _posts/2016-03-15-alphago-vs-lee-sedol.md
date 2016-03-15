---
layout: post
title: AlphaGo vs. Lee Sedol
time: 12:07AM EST
datetime: 2016-03-15 12:07AM EST
summary: Thoughts on the ongoing match between AlphaGo and Lee Sedol
---

I was dimly aware of the [ongoing competition between AlphaGo and Lee
Sedol][wiki], but I hadn't paid much attention until I saw this chart [on
reddit][]:

<img src="http://i.imgur.com/3HcJKbk.png" border=0 width=700 alt="time per move during game 4">

It's hard to read "Lee Sedol's brilliant attack (78th)" and not get curious!
This led me into a deep dive on the competition. You can read more about [the
move][analysis] or watch a [15 minute summary][match4-15m] of the match. The
full [6 hour match][match4], including a press conference afterwards, is also
online. You can learn a lot about Go from listening to the YouTube
commentators. One of them is [Michael Redmond][], the all-time top-rated
American Go player. Even if you don't understand how to play Go (I barely do),
it's fun to watch [the experts react][commentary] to this move: "Oh, this [is]
very creative."

<img src="/images/alphago.png" width=231 height=190 style="float: right; margin-left: 1em;">
[Lee Sedol][]'s win in the fourth match is being celebrated as a victory for
humankind. But it's surprising that we're here at all. AlphaGo, Google
DeepMind's computer Go program, had already won the first three games and hence
the best-of-five competition. This is a coming of age moment for the neural net
community. Over the past ten years, thanks to the emergence of [large data
sets][large] and [GPUs][], the whole field has experienced a renaissance. But
most of the great results have been on toy problems like image classification
or traditional signal processing problems like speech recognition. Beating an
elite Go player for the first time is a marquee result that transcends the
field. As long as I've worked in software, Go has been the one game at which
computers couldn't compete. Everyone thought that this result was years away.

Last fall, AlphaGo competed against [Fan Hui][], a lower-ranked Go
professional. It beat him 5-0. This was the first time that a computer Go
program had defeated a professional. What happened next is suggestive.
[According to Wired][wired], he began consulting with the DeepMind team:

> As he played match after match with AlphaGo over the past five months, he
> watched the machine improve. But he also watched himself improve. The
> experience has, quite literally, changed the way he views the game. When he
> first played the Google machine, he was ranked 633rd in the world. Now, he is
> up into the 300s. In the months since October, AlphaGo has taught him, a
> human, to be a better player. He sees things he didn’t see before. And that
> makes him happy. “So beautiful,” he says. “So beautiful.”

We learn most quickly from our betters -- people who can review your work, say
what you did well and point out what would have been better. But if you're the
best Go player in the world, who do you learn from? I wouldn't be surprised if
this result prompts humans to discover new styles of play. Computers may get
the best of us at Go in the long run, but we'll get better at it in the
process.

The fifth and final game happens tonight. If Lee Sedol wins, you could make the
case that he just took a few games to figure out how to get the best of
AlphaGo. If not, it means that it took completely brilliant play from the best
in the world to beat a computer, and it's likely to be the last time a human
ever pulls this off. The match is being [streamed live on YouTube][match5].

[wiki]: https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol
[wired]: http://www.wired.com/2016/03/sadness-beauty-watching-googles-ai-play-go/
[commentary]: https://www.youtube.com/watch?v=SMqjGNqfU6I&feature=youtu.be&t=1h25m32s
[match4]: https://www.youtube.com/watch?v=yCALyQRN3hw&feature=youtu.be&t=3h10m20s
[match4-15m]: https://www.youtube.com/watch?v=G5gJ-pVo1gs
[michael redmond]: https://en.wikipedia.org/wiki/Michael_Redmond_(Go_player)
[analysis]: https://gogameguru.com/lee-sedol-defeats-alphago-masterful-comeback-game-4/
[on reddit]: https://www.reddit.com/r/dataisbeautiful/comments/4a8336/lee_sedol_vs_alphago_4th_game_thinking_time_in/
[gpus]: http://www.nvidia.com/object/what-is-gpu-computing.html 
[large]: https://www.cs.toronto.edu/~kriz/cifar.html
[lee sedol]: https://en.wikipedia.org/wiki/Lee_Sedol
[fan hui]: https://en.wikipedia.org/wiki/Fan_Huio
[match5]: https://www.youtube.com/watch?v=mzpW10DPHeQ
