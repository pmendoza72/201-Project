'use strict'
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

function Hand() {
  this.cardObjects = []; //store copies of the Card objects here for easier reference.
}
//Hand methods here

//Object keeping track of various parts of the game, like the Player's name and money, and any options we add.
//Game logic also goes here.
function Game(playerName, startMoney) {
  this.playerName = playerName;
  this.playerMoney = startMoney;
  this.currentBet = 0;
  this.roundInProgress = false;
}
//Game methods here
Game.prototype.getName = function() {
  this.playerName = localStorage.getItem('name');
}

Game.prototype.getCardPath = function(type, suit) {
  return 'cards/' + type + '_of_' + suit + '.png';
}

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

for (var i = 0; i < 52; i++) {
  deck.cards.push(i);
}
deck.shuffle();
//ready to start the game
