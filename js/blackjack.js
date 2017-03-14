'use strict'

var dealerCards = document.getElementById('dealerCards');
var playerCards = document.getElementById('playerCards');

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
  console.log('drew card ' + card.file + ' ' + card.value);
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

//gets the value of the dealer's face-up card
Hand.prototype.getInitialDValue = function() {
  var value = this.cardObjects[0].value;
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
  hitButton.disabled = false;
  standButton.disabled = false;

  if (this.playerMoney < 10) {
    this.currentBet = this.playerMoney;
    this.playerMoney = 0;
  }
  else {
    this.currentBet = 10;
    this.playerMoney -= this.currentBet;
  }
  dealerHand.draw();
  playerHand.draw();
  dealerHand.draw();
  playerHand.draw();

  console.log(dealerHand.getInitialDValue());
  console.log(playerHand.getValue());

  // setTimeout (#Deal to player#, 500);
  // setTimeout (#Deal to dealer#, 1000);
  // setTimeout (#Deal to player#, 1500);
  // setTimeout (#Deal to dealer#, 2000);

  setTimeout(game.checkBlackjack, 1000);
  game.clearCards();
  game.renderCards();
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
}

Game.prototype.playerHit = function() {
  playerHand.draw();
  if(playerHand.getValue() > 21) {
    game.endRound('playerBust');
  }
}

Game.prototype.playerStand = function() {
  setTimeout(game.dealerTurn, 500);
}

//recursively plays the dealer's turn.
Game.prototype.dealerTurn = function() {
  showDealerCard();
  if(dealerHand.getValue() >= 17) {
    //dealer stands
    setTimeout(game.finalScore, 750);
  }
  else {
    //dealer hits
    dealerHand.draw();
    if(dealerHand.getValue() > 21) {
      game.endRound('dealerBust');
      return;
    }
    setTimeout(game.dealerTurn, 750);
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
    alert('You lose.  Dealer has Blackjack.');
  }
  else if (outcome === 'playerBlackjack') {
    this.playerMoney += (this.currentBet * 2);
    alert('You win.  You have Blackjack');
  }
  else if (outcome === 'playerBust') {
    alert('You lose.  You went over 21.');
  }
  else if (outcome === 'dealerBust') {
    this.playerMoney += (this.currentBet * 2);
    alert('You win.  Dealer went over 21.');
  }
  else if (outcome === 'pointsLose') {
    alert('You lose.  Dealer scored higher than you.');
  }
  else if (outcome === 'pointsWin') {
    this.playerMoney += (this.currentBet * 2);
    alert('You win.  You scored higher than dealer.');
  }
  else if (outcome === 'push') {
    this.playerMoney += this.currentBet;
    alert('You\'ve tied.');
  }
  else {
    alert('INVALID OUTCOME!')
  }
  this.currentBet = 0;
  this.roundInProgress = false;
  deck.reset();

  newGameButton.disabled = false;
  hitButton.disabled = true;
  standButton.disabled = true;
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

var game = new Game();
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
var newGameButton = document.getElementById('newGame');

hitButton.addEventListener('click', game.playerHit);
standButton.addEventListener('click', game.playerStand);
newGameButton.addEventListener('click', newGame);

hitButton.disabled = true;
standButton.disabled = true;

function newGame() {
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
