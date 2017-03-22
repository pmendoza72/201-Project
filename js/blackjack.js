'use strict'

// Define some variables for DOM elements

var dealerScoreTr = document.getElementById('dealerScore');
var dealerCards = document.getElementById('dealerCards');

var playerScoreTr = document.getElementById('playerScore');
var playerCards = document.getElementById('playerCards');

var msg = document.getElementById('msg');

var money = document.getElementById('money');

var highScore = 0;

var HSTable = document.getElementById('HSTable');


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

//gets the high score object from the game.highScoreArr array
Game.prototype.getHighScore = function(name) {
  if(game.highScoreArr === null) {return false;}

  for (var i = 0; i < game.highScoreArr.length; i++) {
    if(game.highScoreArr[i].name === name) {
      return game.highScoreArr[i];
    }
  }

  return false;
}

Game.prototype.highScore = function() {
  if (this.playerMoney > highScore) {
    highScore = this.playerMoney;
  }
  if (localStorage.getItem('highScores')){
    this.stringifiedScores = localStorage.getItem('highScores');
    this.highScoreArr = JSON.parse(this.stringifiedScores);
  }
  else {
    this.highScoreArr = [];
  }
  this.playerHighScore = {name:this.playerName, score:highScore};
  var currentHS = game.getHighScore(this.playerName);
  if(currentHS) {
    if(currentHS.score < this.playerHighScore.score) {
      currentHS.score = this.playerHighScore.score;
    }
  }
  else {
    this.highScoreArr.push(this.playerHighScore);
  }
  this.highScoreArr.sort(function(a, b){
    return b.score - a.score;
  })
  while (this.highScoreArr.length > 5) {
    this.highScoreArr.pop();
  }
  console.log(this.highScoreArr);
  this.stringifiedScores = JSON.stringify(this.highScoreArr);
  console.log(this.stringifiedScores);
  localStorage.setItem('highScores', this.stringifiedScores);
  this.renderHS();
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
  this.betForm = document.getElementById('betForm');
  this.bet.disabled = true;
  this.betForm.className = 'disabled';

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

  hitButton.disabled = true;
  standButton.disabled = true;
  doubleButton.disabled = true;
  if(playerHand.getValue() > 21) {
    game.endRound('playerBust');
  }
  else {
    setTimeout(game.dealerTurn, 500);
  }
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
    msg.className = 'red';
    msg.textContent = 'You lose.  The dealer has Blackjack.';
  }
  else if (outcome === 'playerBlackjack') {
    this.playerMoney += Math.floor(this.currentBet * 3/2);
    msg.className = 'blue';
    msg.textContent = 'You win.  You have Blackjack!  Your payout is 3 to 2.';
  }
  else if (outcome === 'playerBust') {
    msg.className = 'red';
    msg.textContent = 'You lose.  You went over 21.';
  }
  else if (outcome === 'dealerBust') {
    this.playerMoney += (this.currentBet * 2);
    msg.className = 'blue';
    msg.textContent = 'You win.  The dealer went over 21.';

    if(playerHand.getValue() <= 10 && game.standSpecial) {
      game.oreNoStando();
    }

  }
  else if (outcome === 'pointsLose') {
    msg.className = 'red';
    msg.textContent = 'You lose.  The dealer scored higher than you.';
  }
  else if (outcome === 'pointsWin') {
    this.playerMoney += (this.currentBet * 2);
    msg.className = 'blue';
    msg.textContent = 'You win.  You scored higher than the dealer.';
  }
  else if (outcome === 'push') {
    this.playerMoney += (this.currentBet * 1);
    msg.className = 'blue';
    msg.textContent = 'You\'ve tied.';
  }
  else {
    msg.className = 'red';
    msg.textContent = 'INVALID OUTCOME!';
  }
  printMoney();
  game.highScore();

  this.currentBet = 0;
  this.roundInProgress = false;
  deck.reset();

  newGameButton.disabled = false;
  hitButton.disabled = true;
  standButton.disabled = true;
  this.bet.disabled = false;
  this.betForm.classList.remove('disabled');
  console.log('Player now has $' + game.playerMoney + '.');
  if (game.playerMoney < bet.value) {
    game.bet.value = game.playerMoney;
  }

  if (game.playerMoney === 0) {
    // alert('You\'re out of money.  Refresh the page to start over.')
    this.outOfMoney = document.createElement('span');
    this.outOfMoney.innerHTML = '  You\'re out of money.';
    this.startOver = document.createElement('a');
    this.startOver.textContent = 'Start over.';
    this.startOver.href = './blackjack.html';
    this.startOver.className = 'startOver';
    msg.appendChild(this.outOfMoney);
    this.outOfMoney.appendChild(this.startOver);
    newGameButton.disabled = true;
  }

}

Game.prototype.oreNoStando = function() {
  game.clearCards();
  playerCards.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/bnifMws_pCI?autoplay=1" frameborder="0" allowfullscreen></iframe>';
}

Game.prototype.renderHS = function() {

  if (document.getElementById('HSUL')) {
    this.HSUL = document.getElementById('HSUL');
    this.HSUL.remove();
  }
  this.HSUL = document.createElement('ul');
  this.HSUL.id = 'HSUL';
  HSTable.appendChild(this.HSUL);

  for (var i = 0; i < game.highScoreArr.length; i++) {
    this.HSLI = document.createElement('li');
    this.HSLI.textContent = (i+1 + '. ' +  game.highScoreArr[i].name + ': ' + game.highScoreArr[i].score);
    this.HSUL.appendChild(this.HSLI);
  }
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

game.highScore();

// Functions for printing to DOM

function printScores() {
  if (game.hideDealerCard === true) {
    dealerScoreTr.textContent = 'Dealer Score: ' + dealerHand.getInitialDValue();
  }
  else {
    dealerScoreTr.textContent = 'Dealer Score: ' + dealerHand.getValue();
  }
  playerScoreTr.textContent = 'Player Score: ' + playerHand.getValue();
}

function printMoney() {
  money.textContent = 'Welcome, ' + game.playerName + '!  You have: $' + game.playerMoney + '.';
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
