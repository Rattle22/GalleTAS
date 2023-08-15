# GalleTAS

## What even is this?
Years ago, I got really into [Cookie Clicker](http://orteil.dashnet.org/cookieclicker/), and spent a lot of time thinking about how to play it efficiently.
I looked online for resources, and found various guides and tools and bots.
In particular, I found the [Build Script Y***](https://cookieclicker.fandom.com/wiki/Cheating#Auto-Buying_Scripts) on the Cookie Clicker wiki.
However, I was unsatisfied. Two things were notable to me:
  - The bot technically cheats, as it increases the amount for a very short fraction of a moment, to abuse the games CalculateGains function to figure out how much CPS it gains.
  - It wasn't necessarily the most efficient buying strategy. 

So, I got to work, creating a bot that would play the game as efficiently as possible, taking as many variables into account as possible, while only touching things that humans could.
I spent weeks on it, got it to a pretty cool spot, then left it lying around for years. Somewhere in there, I decided to make this what is essentially a TAS: Get all achievements as quickly as possible, which due to the nature of the game and many of its achievements means optimizing cookie generation as much as possible.
My interest in the project has reignited, so I started to work on it again and decided to finally make it public, leading to this repo.
This is not the primary repo of the bot, I hold a private repo on a private server. I will push here whenever I think of it. It serves mostly as a place where others can interact, give comments, feedback and suggestions.

### Why that name

I wanted a pun. This is a pun.

## Features

- Buying according to what gets you the most efficient buildings quickest
  - In particular, this means buying a cheaper building first if it gets you to the more efficient building quicker! This is particularly relevant in the early game.
- Using magic vaguely effectively
- Tending to the garden in a minimal fashion
- Using the stock market to generate additional funds for buying
- Popping wrinklers effectively
- Doing achievements to get the most out of kittens
- Probably some more I forgot about over the years

## Planned features

- Timing of golden Cookies
- Best playing of all minigames
- Doing all the seasons well
- Optimizing ascending and heavenly upgrades

## How to use

1. Launch [Cookie Clicker](http://orteil.dashnet.org/cookieclicker/).
2. Open the console.
3. Paste the code from GalleTAS into the console.
4. Enter "start()" into the console.

You can also set "autostart" to true, which will launch the bot directly upon pasting.

Yeah it's not good, but writing a plugin or for ScriptMonkey both seem daunting and incompatible with how this is written so far.
If you have suggestion to make usage easier, please do tell!

## Contributing

Feel free to submit issues for suggestions and bug reports.
Also feel free to fork, or create MRs. If you do make your own version of this, please do mention me!
