#BlackJack Outline

##Problem Domain
* ~~Determine the logic for blackjack~~
* ~~Coding the logic~~
* ~~Event handlers~~
* ~~Display cards~~
* Pre-load images
* ~~User interaction~~
* ~~Hit/Stay~~
* ~~Bet~~
* ~~New Round~~
* Reset
* ~~Track user’s money~~
* ~~Display current tally~~

##Stretch Goals
* ~~Alter bet amount~~
* ~~Enter username (option for persistent data)~~
* Leaderboard (persistent data)
* High scores, totals busts, total wins, number of blackjacks, number of 21s
* Not reshuffling decks
* Multiple decks
* Animation
* ~~Double-Down~~
* Split Hand
* Show chips
* Sound
* Card animations
* Change optional rules
* ~~Whether house hits on soft 16~~
* Number of decks: 1,2,4,6,8
* take insurance
* AI players
* multiple players

##Potential Issues
* ~~Displaying a lot of cards and screen space (we have a few solutions)~~
* ~~Timing the dealer’s play~~

#MVP

##Starting Page

* ~~Username page with form~~
* ~~Snazzy background image~~
* ~~LocalStorage~~
* ~~EventListener for submit button~~
* ~~Different js for this page - pretty simple for storage~~
* Add about-us page

##BlackJack Page

###What renders on page first:
* ~~Background image~~
* ~~Space for dealer’s hand and player’s hand~~
* ~~Display money amount~~

###After clicking play
* ~~Deals cards~~
* ~~Play button disappears~~
* ~~Controls show up (Hit, Stay)~~

###If blackjack occurs
* ~~Game ends~~
* ~~Results (Why you won or lost. $ total)~~
* Option to restart
* ~~button appears~~
* ~~Controls hidden~~

###If no blackjack
* ~~Player decides on hit vs stay~~
* ~~Player hits until they bust or stay~~
* ~~If bust Results~~

###If player stays the dealer’s turn
* ~~Dealer hits until they bust or stay within rules (logic) (Stay on 17 or higher)~~
* ~~If Dealer busts then go to Results~~
* ~~If Dealer stays then compare scores~~
* ~~Display Results~~
