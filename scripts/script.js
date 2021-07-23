
// -----------------------------------------------
// -----------------------------------------------
// Backjack
// Author: Robert Koszegi
// General Assembly - Project 1
// 
// Version: 1.0
// Date: 2021-07-22
//
// -----------------------------------------------
// -----------------------------------------------

// -- CONSTANTS --
// Elements
//Header
const playerScrEl = document.getElementById("playerScore");
const dealerScrEl = document.getElementById("dealerScore");
const messageEl = document.getElementById("message");
//Bet
const betAmountEl = document.getElementById("betDisplay");
const btnAddTen = document.querySelector("addTen");
const btnAddFifty = document.querySelector("addFifty");
const btnAddHundred = document.querySelector("addhundred");
const btnBetReset = document.querySelector("betReset");
const setBetEl = document.getElementsByClassName("setBet")
const chipAmountEl = document.getElementById("chipDisplay"); //querySelector didn't work
const btnStart = document.querySelector("Start");
//Hands
const dealerCardsEl = document.getElementById("dealerCards");
const playerCardsEl = document.getElementById("playerCards");
//Deck
const deckEl = document.getElementById("drawBtContainer");
//Controls
const btnStand = document.getElementById("btnStand");
const btnReset = document.getElementById("btnReset");
//Modal Dialog
const mdlEl = document.getElementById('mdl');
const mdlClose = document.getElementById("mdlClose");


// Players
const dealer = {
    score: 0,
    cardsInHand: [],
    handTotal: 0,
    cardsEl: dealerCardsEl
};
const player = {
    score: 0,
    cardsInHand: [],
    handTotal: 0,
    cardsEl: playerCardsEl
};

//Cards
const deck = [];
const discards = [];
const suits = ["spades", "diamonds", "clubs", "hearts"];
const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const imgBack = "./images/backs/blue.svg"

// -- CLASSES -- 
class Card {
    constructor(rank, suit, value, imgFront) {
        this.rank = rank;
        this.suit = suit;
        this.value = value;
        this.imgFront = imgFront;  
        this.imgBack = imgBack;   // default
        this.faceDown = false; //default
    }
}

// -- APP STATE VARIABLES --
let message;
let betAmount;
let chipAmount;
let winnings;
let dealingPhase;
let dealersTurn;
let endOfGame;


// -- EVENT LISTENERS --
deckEl.addEventListener('click', function(){
    if(endOfGame == false){
        drawCard(player);
    }
});

mdlClose.onclick = function() {
    mdlEl.style.display = "none";
    initialize();
};

window.onclick = function(event) {
    if(event.target == mdlEl) {
        mdlEl.style.display = "none";
        initialize();
    }
}



// -- CACHED ELEMENT REFERENCES --

// -- FUNCTIONS --
function initialize() {
    // turn
    dealersTurn = false;
    //clear scores
    dealer.score = 0;
    player.score = 0;
    //clear bet
    betAmount = 0;
    chipAmount = 500;
    //clear hands
    dealer.cardsInHand = [];
    player.cardsInHand = [];
    dealer.handTotal = 0;
    player.handTotal = 0;
    //clear deck
    deck.length = 0;
    //recreate / shffle deck
    createDeck();
    shuffleDeck();
    //display deck
    playerCardsEl.innerHTML = '';
    dealerCardsEl.innerHTML = '';
    //clear notification
    message = '';    

    //Disable controls
    btnStand.style.display = "inline-block";
    btnStand.setAttribute("disabled", true);
    btnReset.style.display = "none";
    bettingDisabled(false)

    //Play status
    endOfGame = false;

    render()

};

function render() {
    //update scores
    playerScrEl.textContent = player.score;
    dealerScrEl.textContent = dealer.score;
    //update bet
    betAmountEl.innerHTML = betAmount;
    //update chips
    chipAmountEl.innerHTML = chipAmount;
    //update hands
    displayHand(dealer);
    displayHand(player);
    //update message
    messageEl.textContent = message;

};
//-----------------
function addToBet(amount) {
    if(  chipAmount > betAmount ) {
        //add to bet about
        betAmount += amount;
        //subtract from available chips
        // chipAmount -= amount;
    }
    //reset
    if(amount == 0) {
        // chipAmount += betAmount;
        betAmount = 0
    };


    render()
};

function bettingDisabled(trueFalse) {

	if(trueFalse == true) {
	    for(element of setBetEl) {
            element.setAttribute("disabled", true); 
        }
	} else if (trueFalse == false) {
		for(element of setBetEl) {
            element.removeAttribute("disabled"); 
        }
    }
	
}

function checkWinner() {
    //compare hands
    if(dealingPhase == false) {

        // ON PLAYER'S TURN
        if(
            //-on player's turn: (only 2 cards  dealer's hand or had card face down)
            //-triggered by drawCard()
            // Boolean(dealer.cardsInHand.find(card => card.faceDown == true)) &&
            // dealer.cardsInHand.length == 2 //just in case
            dealersTurn == false
        ) {
                //Bust
            if(player.handTotal > 21) {
                
                endOfTurn("loose");

            } else {
                // else [game conitunues]
                return
            }   
    
        // ON DEALER'S TURN
        // } else if(player.cardsInHand.length >= 2){
        } else {
            //triggered at end of dealerPlay(): 
            // at this point we know that pHandTotal < 21
            if(isBlackJack(player.cardsInHand) && isBlackJack(dealer.cardsInHand)){
                endOfTurn("tie")
            // blackjack for player
            } else if(isBlackJack(player.cardsInHand) && !isBlackJack(dealer.cardsInHand)) {
                endOfTurn("winBlackjack");
            
            // blackjack for dealer
            } else if(isBlackJack(dealer.cardsInHand) && !isBlackJack(player.cardsInHand)) {
                endOfTurn("loose");
            // dealer bust
            } else if(dealer.handTotal > 21 ) {
                endOfTurn("win");
    
            
            // player higher
            } else if(dealer.handTotal < player.handTotal) {
                endOfTurn("win")
    
            // dealer higher
            } else if (dealer.handTotal > player.handTotal) {
                endOfTurn("loose")
    
            
            } else if(player.handTotal == dealer.handTotal) {
                endOfTurn('tie');
            }
            
        }
    }

};

function createDeck() {

    // loop through suits
    for (let i = 0; i < suits.length; i++) {
        // loopt through ranks
        for (let x = 0; x < ranks.length; x++) {
            //determine card value
            let v = '';
            if('JKQ'.includes(ranks[x])) {
                v = 10;
              } else if ( ranks[x] == 'A' ) {
                v = 1;
              }
               else {
               v = Number(ranks[x]);
            };
              
            // Using Class
            let card = new Card(
                ranks[x],
                suits[i],
                v, // card value
                "./images/cards/" + suits[i] + "-" + ranks[x] + ".svg"
            )
                
            deck.push(card);                   
            
        }
    }
};

function dealerPlay () {
    dealersTurn = true
    message = "Dealer's turn";
    render();
    dealerReveal(); 
    if(isBlackJack(dealer.cardsInHand) || isBlackJack(player.cardsInHand)) {
        checkWinner();
        return
    };

    if(dealer.handTotal < 17) {
        // dealingPhase = true;
        // Recursive setTimeout
        setTimeout( 
            //function
            function run() {
                drawCard(dealer);
                if(dealer.handTotal > 16) {
                    clearTimeout();
                    // dealingPhase = false;
                    checkWinner()                
                } else {
                    setTimeout(run, 1000)
                };
            },
            //time
            2000
        );
    } else {
        checkWinner();
    };

};

function displayHand(playerDealer) {
    playerDealer.cardsEl.innerHTML = '';
    // return
    playerDealer.cardsInHand.forEach(card => {
        //create
        let cardEl = document.createElement('IMG');
        //add class
        cardEl.classList.add("card");
        //determine acive side
        let activeSide = ''
        if(card.faceDown == false) {
            activeSide = card.imgFront;
        } else {
            activeSide = card.imgBack;
        }
        //set img source
        cardEl.setAttribute("src", activeSide);
        //add to DOM
        playerDealer.cardsEl.appendChild(cardEl);

    });


};

function deal() {
    //ON START button press:
    dealingPhase = true;
    //Disable bet buttons
    bettingDisabled(true);
    //Enable 'Stand'
    btnStand.removeAttribute("disabled");
    // btnReset.removeAttribute("disabled");
    
    //draw player
    drawCard(player);
    //draw dealer
    drawCard(dealer);
    //draw player
    drawCard(player);
    //draw dealer (facedown)
    deck[0].faceDown = true;
    drawCard(dealer)
    //alert player to draw or stand
    message = "Your turn. Hit or stand?" 

    
    // ----  TEMP -------
    // - Uncomment to give either player a blackjack
    // - Player
    // player.cardsInHand = [
    //     {
    //         faceDown: false,
    //         imgBack: "./images/backs/blue.svg",
    //         imgFront: "./images/cards/spades-10.svg",
    //         rank: "10",
    //         suit: "spades",
    //         value: 10
    //     },
    //     {
    //         imgBack: "./images/backs/blue.svg",
    //         imgFront: "./images/cards/diamonds-A.svg",
    //         rank: "A",
    //         suit: "diamonds",
    //         value: 1,
    //         faceDown: false
    //     }
    // ];

    // - Dealer
    // dealer.cardsInHand = [
    //     {
    //         faceDown: false,
    //         imgBack: "./images/backs/blue.svg",
    //         imgFront: "./images/cards/diamonds-J.svg",
    //         rank: "J",
    //         suit: "diamonds",
    //         value: 10
    //     },
    //     {
    //         imgBack: "./images/backs/blue.svg",
    //         imgFront: "./images/cards/hearts-A.svg",
    //         rank: "A",
    //         suit: "hearts",
    //         value: 1,
    //         faceDown: true
    //     }
    // ]
    //------------------------------

    
    dealingPhase = false
    // Deal completed
    // If player has blackjack, check player's hand
    if(isBlackJack(player.cardsInHand)) {

        message = "You have BLACKJACK!!! Dealer's play.";
        render();
        setTimeout(
            function() {
                // dealerReveal()
                // if(isBlackJack(dealer.cardsInHand)) {
                // console.log(dealersTurn)
                // // endOfTurn("tie")
                dealerPlay()
                // checkWinner
                // return
                // }
            },
            2000)

    } 
    
    render();

};

function dealerReveal() {
    //Turn dealer's face down card over
    dealer.cardsInHand[1].faceDown = false;
    render()
};

function drawCard(playerDealer) {
    // Remove a card fromn deck 
    let newCard = deck.shift()
    //add to hand
    playerDealer.cardsInHand.push(newCard)
    //sum card values
    playerDealer.handTotal += newCard.value
    //check winning status after player draws
    if(dealersTurn == false) {
        checkWinner()
    }

    render() 

};

function endOfTurn(pWinLooseTie){

    // End of game marker
    endOfGame = true;
    // WIN
    if(pWinLooseTie === "win") {
        // player get chipAmount = chipAmount + betAmount + betAmount
        winnings = betAmount;
        betAmount = 0;
        chipAmount += winnings;
        message = "You win $" + winnings + "!";
        // increase player score by one
        player.score ++

        // reset()

        
    } else if (pWinLooseTie === "winBlackjack") {
        // player gets chipAmount = chipAmount + betAmout + betAmount*1.5
        winnings = betAmount * 1.5
        chipAmount += winnings
        betAmount = 0;
        message = "BLACKJACK!!! You win $" + winnings + "!";
        // increase player score by one
        player.score ++

        // reset()
    
    //LOOSE
    } else if(pWinLooseTie === "loose") {
        message = "Sorry, you loose."
        chipAmount -= betAmount
        betAmount = 0;
        // increase dealer score by one
        dealer.score ++

        // End of game dialog
        if(chipAmount == 0) {
            mdlEl.style.display = "block";
        }
        // reset()

    //tie
    } else {
        message = "It's a tie."
        betAmount = 0;
        
        // reset()

    }

    // Switch 'Stand' and 'Play Again' buttons
    btnStand.style.display = "none";
    btnReset.style.display = "inline-block"

    render()
}

function isBlackJack(cardsInHand) {
    if(
        //two cards: A paired with a 10 or face card
        cardsInHand.length == 2 && 
        cardsInHand.find(card => card.rank === 'A') && 
        cardsInHand.find(card => card.value === 10)
    ) {
        return true;
    } else {
        return false;
    }
};

function reset() {
    // clear turn
    dealersTurn = false;

    //End game marker
    endOfGame = false;

    // clear bet amount
    betAmount = 0;
    winnings = 0;

    //clear hands
    dealer.cardsInHand = [];
    player.cardsInHand = [];
    dealer.handTotal = 0;
    player.handTotal = 0;

    //Enable betting
    bettingDisabled(false);

    //clear notification
    message = '';

    render()

    //deck count low: create and reshuffle
    if(deck.length < 5) {
        deck.length = 0;
        createDeck();
        shuffleDeck();
    }

    // Switch 'Stand' and 'Play Again' buttons
    btnStand.style.display = "inline-block";
    btnStand.setAttribute("disabled", true);
    btnReset.style.display = "none";

}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * i);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
};




// ----  Initialize  -------

initialize();


