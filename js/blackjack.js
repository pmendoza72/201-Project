'use strict'

// Define some variables for DOM elements

var dealerScoreTr = document.getElementById('dealerScore');
var dealerCards = document.getElementById('dealerCards');

var playerScoreTr = document.getElementById('playerScore');
var playerCards = document.getElementById('playerCards');

var msg = document.getElementById('msg');

var money = document.getElementById('money');


//CONSTRUCTORS
function Card(file, value) {
  this.file = file;
  this.value = value;
}
//Card methods here
Card.prototype.copy = function() {
  return new Card(this.file, this.value);
};

function Deck() {
  this.cardObjects = []; //Card objects. Not to be modified after setup
  this.cards = []; //Numbers, representing the cards in the deck. Shuffle and draw from this array
}
//Deck methods here

//get a copy of the first card in the deck.
Deck.prototype.drawCard = function() {
  var index = this.cards.pop();
  var card = this.cardObjects[index];
  return card.copy();
}

//returns a random index in the cards array. Used by the shuffle method
Deck.prototype.getRandomCard = function() {
  return Math.floor(Math.random() * (this.cards.length));
}

//shuffles the deck by swapping each card with another one at random.
Deck.prototype.shuffle = function() {
  var temp, otherCard;
  for (var i = 0; i < this.cards.length; i++) {
    otherCard = this.getRandomCard();
    temp = this.cards[i];
    this.cards[i] = this.cards[otherCard];
    this.cards[otherCard] = temp;
  }
}

Deck.prototype.reset = function() {
  this.cards = [];
  for (var i = 0; i < 52; i++) {
    this.cards.push(i);
  }
  this.shuffle();
}

function Hand(hidden) {
  this.cardObjects = []; //store copies of the Card objects here for easier reference.
  //counts as false unless argument is included
  this.hidden = hidden || false;
}
//Hand methods here

Hand.prototype.empty = function() {
  this.cardObjects = [];
}

Hand.prototype.draw = function() {
  var card = deck.drawCard()
  // console.log('drew card ' + card.file + ' ' + card.value);
  this.cardObjects.push(card);
  game.clearCards();
  game.renderCards();
}

//checks if this hand has an ace.
Hand.prototype.hasAce = function() {
  for (var i = 0; i < this.cardObjects.length; i++) {
    if(this.cardObjects[i].value === 1) {
      return true;
    }
  }
  return false;
}

//returns whether the hand has a soft value. i.e. is counting an ace as an 11.
Hand.prototype.isSoft = function() {
  if(this.hasAce() === false) {
    return false;
  }
  var total = 0;
  for(var i = 0; i < this.cardObjects.length; ++i) {
    total += this.cardObjects[i].value;
  }
  if(this.value <= 11) {
    return true;
  }

  return false;
}

Hand.prototype.hitOnSoft17 = function() {
  if(game.hitOnSoft17 === false) {
    return false;
  }

  if(this.isSoft() && (this.getValue() === 17)) {
    return true;
  }
  else {
    return false;
  }
}

//gets the value of the dealer's face-up card
Hand.prototype.getInitialDValue = function() {
  var value = 0;
  if (this.cardObjects.length === 0) {
    return 0;
  }
  value += this.cardObjects[0].value;
  //ace
  if(value === 1) {
    value += 10;
  }
  return value;
}

//gets the value of the hand. Takes aces into account.
Hand.prototype.getValue = function() {
  var value = 0;
  for (var i = 0; i < this.cardObjects.length; i++) {
    value += this.cardObjects[i].value;
  }

  //add 10 for the ace if it helps
  if(this.hasAce() && value <= 11) {
    return value + 10;
  }
  else {
    return value;
  }
}

//Object keeping track of various parts of the game, like the Player's name and money, and any options we add.
//Game logic also goes here.
function Game(playerName, startMoney) {
  this.playerName = playerName;
  this.playerMoney = startMoney;
  this.currentBet = 0;
  this.roundInProgress = false;
  this.hideDealerCard = true;
  this.standSpecial = true;
  this.hitOnSoft17 = true;
}
//Game methods here
Game.prototype.getName = function() {
  this.playerName = localStorage.getItem('name');
}

Game.prototype.getCardPath = function(type, suit) {
  return 'cards/' + type + '_of_' + suit + '.png';
}

Game.prototype.startRound = function() {
  dealerHand.empty();
  playerHand.empty();
  hideDealerCard();

  this.roundInProgress = true;
  newGameButton.disabled = true;
  this.bet = document.getElementById('bet');
  this.bet.disabled = true;

  if (this.playerMoney < bet.value) {
    this.currentBet = this.playerMoney;
    this.playerMoney = 0;
    this.bet.value = this.currentBet;
  }
  else {
    this.currentBet = parseInt(this.bet.value);
    this.playerMoney -= this.currentBet;
  }
  dealerHand.draw();
  playerHand.draw();
  dealerHand.draw();
  playerHand.draw();

  // console.log(dealerHand.getInitialDValue());
  // console.log(playerHand.getValue());

  // setTimeout (#Deal to player#, 500);
  // setTimeout (#Deal to dealer#, 1000);
  // setTimeout (#Deal to player#, 1500);
  // setTimeout (#Deal to dealer#, 2000);

  setTimeout(game.checkBlackjack, 1000);
  game.clearCards();
  game.renderCards();
  printMoney();
  console.log('Player has $' + game.playerMoney + ' at the start of the round.');
}

Game.prototype.renderCards = function() {
  for (var i = 0; i < dealerHand.cardObjects.length; i++) {
    this.dealerCardTd  = document.createElement('td');
    this.dealerCardTd.id = ('dealerCard' + (i + 1));
    this.dealerCardImg = document.createElement('img');
    this.dealerCardImg.src = dealerHand.cardObjects[i].file;
    this.dealerCardTd.appendChild(this.dealerCardImg);
    dealerCards.appendChild(this.dealerCardTd);
  }
  for (var i = 0; i < playerHand.cardObjects.length; i++) {
    this.playerCardTd  = document.createElement('td');
    this.playerCardTd.id = ('dealerCard' + (i + 1));
    this.playerCardImg = document.createElement('img');
    this.playerCardImg.src = playerHand.cardObjects[i].file;
    this.playerCardTd.appendChild(this.playerCardImg);
    playerCards.appendChild(this.playerCardTd);
  }

  if(dealerHand.cardObjects.length < 2) {
    //don't worry about hiding or showing the dealer card that isn't there.
  }
  else if(game.hideDealerCard) {
    document.getElementById('dealerCard2').children[0].src = "cards/code_fellows_card.png";
  }
  else {
    document.getElementById('dealerCard2').children[0].src = dealerHand.cardObjects[1].file;
  }
  printScores();
}

Game.prototype.clearCards = function() {
  dealerCards.innerHTML = '';
  playerCards.innerHTML = '';
}

Game.prototype.checkBlackjack = function() {
  if(dealerHand.getValue() === 21) {
    game.endRound('dealerBlackjack');
    showDealerCard();
    return;
  }
  else if (playerHand.getValue() === 21) {
    game.endRound('playerBlackjack');
    return;
  }

  //if no blackjack, enable the player turn controls.
  hitButton.disabled = false;
  standButton.disabled = false;
  doubleButton.disabled = false;
}

Game.prototype.playerHit = function() {
  doubleButton.disabled = true;
  playerHand.draw();
  if(playerHand.getValue() > 21) {
    game.endRound('playerBust');
  }
  else if(playerHand.getValue() === 21) {
    hitButton.disabled = true;
    standButton.disabled = true;
    game.playerStand();
  }
}

Game.prototype.playerStand = function() {
  setTimeout(game.dealerTurn, 500);
  hitButton.disabled = true;
  standButton.disabled = true;
  doubleButton.disabled = true;
}

Game.prototype.playerDouble = function() {
  if(game.playerMoney < game.currentBet) {
    msg.textContent = 'Not enough money to double down!';
    return;
  }
  game.playerMoney -= game.currentBet;
  game.currentBet *= 2;
  printMoney();
  playerHand.draw();
  if(playerHand.getValue() > 21) {
    game.endRound('playerBust');
  }
  hitButton.disabled = true;
  standButton.disabled = true;
  doubleButton.disabled = true;
  setTimeout(game.dealerTurn, 500);
}

//recursively plays the dealer's turn.
Game.prototype.dealerTurn = function() {
  showDealerCard();
  if( (dealerHand.getValue() < 17) || dealerHand.hitOnSoft17()) {
    //dealer hits
    dealerHand.draw();
    if(dealerHand.getValue() > 21) {
      game.endRound('dealerBust');
      return;
    }
    setTimeout(game.dealerTurn, 750);
  }
  else {
    //dealer stands
    setTimeout(game.finalScore, 750);
  }
}

Game.prototype.finalScore = function() {
  var playerScore = playerHand.getValue();
  var dealerScore = dealerHand.getValue();

  if(dealerScore > playerScore) {
    game.endRound('pointsLose');
  }
  else if(playerScore > dealerScore) {
    game.endRound('pointsWin');
  }
  else {
    game.endRound('push');
  }
}

Game.prototype.endRound = function(outcome) {

  //Outcomes

  if (outcome === 'dealerBlackjack') {
    showDealerCard();
    msg.textContent = 'You lose.  Dealer has Blackjack.';
    console.log('You lose.  Dealer has Blackjack.');
  }
  else if (outcome === 'playerBlackjack') {
    this.playerMoney += Math.floor(this.currentBet * 3/2);
    msg.textContent = 'You win.  You have Blackjack! Payout 3 to 2.';
    console.log('You win.  You have Blackjack! Payout 3 to 2.');
  }
  else if (outcome === 'playerBust') {
    msg.textContent = 'You lose.  You went over 21.';
    console.log('You lose.  You went over 21.');
  }
  else if (outcome === 'dealerBust') {
    this.playerMoney += (this.currentBet * 2);

    msg.textContent = 'You win.  Dealer went over 21.';
    console.log('You win.  Dealer went over 21.');

    if(playerHand.getValue() <= 10 && game.standSpecial) {
      game.oreNoStando();
    }

  }
  else if (outcome === 'pointsLose') {
    msg.textContent = 'You lose.  Dealer scored higher than you.';
    console.log('You lose.  Dealer scored higher than you.');
  }
  else if (outcome === 'pointsWin') {
    this.playerMoney += (this.currentBet * 2);
    msg.textContent = 'You win.  You scored higher than dealer.';
    console.log('You win.  You scored higher than dealer.');
  }
  else if (outcome === 'push') {
    this.playerMoney += (this.currentBet * 1);
    msg.textContent = 'You\'ve tied.';
    console.log('You\'ve tied.');
  }
  else {
    msg.textContent = 'INVALID OUTCOME!';
    console.log('INVALID OUTCOME!');
  }
  printMoney();

  this.currentBet = 0;
  this.roundInProgress = false;
  deck.reset();

  newGameButton.disabled = false;
  hitButton.disabled = true;
  standButton.disabled = true;
  this.bet.disabled = false;
  console.log('Player now has $' + game.playerMoney + '.');
  if (game.playerMoney < bet.value) {
    game.bet.value = game.playerMoney;
  }

  if (game.playerMoney === 0) {
    // alert('You\'re out of money.  Refresh the page to start over.')
    this.outOfMoney = document.createElement('span');
    this.outOfMoney.textContent = '  You\'re out of money.  Refresh the page to start over.';
    msg.appendChild(this.outOfMoney);
    newGameButton.disabled = true;
  }

}

Game.prototype.oreNoStando = function() {
  game.clearCards();
  playerCards.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/bnifMws_pCI?autoplay=1" frameborder="0" allowfullscreen></iframe>';
}

//Define types of cards

var suits = ['spades', 'clubs', 'diamonds', 'hearts'];

var cardtypes = [
  ['ace', 1],
  ['2', 2],
  ['3', 3],
  ['4', 4],
  ['5', 5],
  ['6', 6],
  ['7', 7],
  ['8', 8],
  ['9', 9],
  ['10', 10],
  ['jack', 10],
  ['queen', 10],
  ['king', 10]
];

var game = new Game('name', 100);
var playerHand = new Hand();
var dealerHand = new Hand();
var deck = new Deck();

game.getName();
for (var i = 0; i < suits.length; i++) {
  for (var j = 0; j < cardtypes.length; j++) {
    deck.cardObjects.push(new Card(game.getCardPath(
      cardtypes[j][0], suits[i]) ,cardtypes[j][1]))
  }
}

deck.reset();
//ready to start the game

var hitButton = document.getElementById('hit');
var standButton = document.getElementById('stand');
var doubleButton = document.getElementById('double');
var newGameButton = document.getElementById('newGame');

hitButton.addEventListener('click', game.playerHit);
standButton.addEventListener('click', game.playerStand);
doubleButton.addEventListener('click', game.playerDouble);
newGameButton.addEventListener('click', newGame);

hitButton.disabled = true;
standButton.disabled = true;
doubleButton.disabled = true;

function newGame() {
  msg.textContent = '';
  game.clearCards();
  deck.reset();
  dealerHand.empty();
  playerHand.empty();
  game.startRound();
};

function hideDealerCard() {
  game.hideDealerCard = true;
  game.clearCards();
  game.renderCards();
};
function showDealerCard() {
  game.hideDealerCard = false;
  game.clearCards();
  game.renderCards();
};

// Functions for printing to DOM

function printScores() {
  if (game.hideDealerCard === true) {
    dealerScoreTr.textContent = 'Score: ' + dealerHand.getInitialDValue();
  }
  else {
    dealerScoreTr.textContent = 'Score: ' + dealerHand.getValue();
  }
  playerScoreTr.textContent = 'Score: ' + playerHand.getValue();
}

function printMoney() {
  money.textContent = 'You have: $' + game.playerMoney;
}

printMoney();
// money.textContent = 'You have: $100';

// NAVIGATION HAMBURGER MENU

function openNav() {
   document.getElementById("nav").style.height = "100%";
}

/* Close Menu */
function closeNav() {
   document.getElementById("nav").style.height = "0%";
}
