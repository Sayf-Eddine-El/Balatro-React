import { useState } from "react";
import { playingCard, typesValue } from "./Cards/playingCard.js";
import { useEffect } from "react";
import Cards from "./Cards.jsx";

function App() {
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [numberOfCards, setNumberOfCards] = useState(8);
  const [currentHandType, setCurrentHandType] = useState("");
  const [score, setScore] = useState(0);
  const [plays, setPlays] = useState();
  const [chipMult, setChipMult] = useState({
    chip: 0,
    multiplayer: 0,
  });
  const [currentBlind, setCurrentBlind] = useState(300);
  const [roundeWin, setRoundWin] = useState(false);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    initializeDeck();
    setPlays({
      hands: 4,
      discards: 4,
    });
    setNumberOfCards(8);
  }, [gameState]);

  useEffect(() => {
    if (score > currentBlind) {
      setRoundWin(true);
    }
    if (plays?.hands == 0 && score < currentBlind) {
      setRoundWin("Lose");
    }
  }, [plays, score]);

  const initializeDeck = () => {
    let cards = playingCard;
    const shuffledDeck = cards.map(() => {
      const randomIndex = Math.floor(Math.random() * (cards.length - 1));
      const randomCard = cards[randomIndex];
      cards = cards.filter((_, i) => i != randomIndex);
      return { ...randomCard, active: false, discard: false };
    });

    setDeck(shuffledDeck);
    setHand([]);
    setCurrentHandType("");
    if (gameState == true) {
      setCurrentBlind((prev) => prev + 300);
    }
    setScore(0);

    setChipMult({
      chip: 0,
      multiplayer: 0,
    });
    setRoundWin(false);
    setGameState(null);
  };

  const addCardToHand = (card) => {
    if (hand.length < 5 && !hand.includes(card)) {
      const currentDeck = [...deck];
      const cardIndex = currentDeck.indexOf(card);
      currentDeck[cardIndex].active = true;
      setDeck(currentDeck);
      setHand((prev) => [...prev, card]);
    } else if (hand.includes(card)) {
      const currentDeck = [...deck];
      const cardIndex = currentDeck.indexOf(card);
      currentDeck[cardIndex].active = false;
      setDeck(currentDeck);
      setHand((prev) => prev.filter((e, i) => i != hand.indexOf(card)));
    }
  };

  const handleDiscardCards = (type) => {
    if (plays.discards > 0) {
      const currentDeck = [...deck];
      for (let i = 0; i < hand.length; i++) {
        const cardIndex = currentDeck.indexOf(hand[i]);
        currentDeck[cardIndex].discard = true;
        setNumberOfCards((prev) => prev + 1);
      }
      setHand([]);
      setDeck(currentDeck);
      if (type == "discard")
        setPlays((prev) => {
          return {
            ...prev,
            discards: prev.discards - 1,
          };
        });
    }
  };

  const handleCalcScore = (type, cards) => {
    const verified = ["Flush", "Straight", "Full house", "Straight flush"];
    const notVerified = [
      "Pair",
      "Two Pair",
      "Three of a kind",
      "Four of a kind",
    ];
    if (verified.includes(type)) {
      const handChips = hand.reduce((prev, curr) => prev + curr.chip, 0);
      typesValue.map((e) => {
        if (e.type == type) {
          setScore((prev) => (handChips + e.chip) * e.multiplayer + prev);
          setChipMult({
            chip: e.chip + handChips,
            multiplayer: e.multiplayer,
          });
        }
      });
    } else {
      if (type == "High Card") {
        let max = hand[0].chip;
        hand.map((card) => {
          if (card.chip > max) {
            max = card.chip;
          }
        });
        setScore((prev) => max + 5 + prev);
        setChipMult({
          chip: 5 + max,
          multiplayer: 1,
        });
      }
      if (notVerified.includes(type)) {
        const cardsArray = [...Array(Object.keys(cards).length)].map((e, i) => {
          return {
            card: Object.keys(cards)[i],
            selected: Object.values(cards)[i],
          };
        });

        let max = cardsArray[0];

        cardsArray.map((card) => {
          if (max.selected < card.selected) {
            max = card;
          }
        });

        max = Number(Object.values(max)[0]);

        let chips = 0;
        for (let i = 0; i < hand.length; i++) {
          if (hand[i].number == Number(max)) {
            chips += hand[i].chip;
          }
        }
        typesValue.map((e) => {
          if (e.type == type) {
            setScore((prev) => (chips + e.chip) * e.multiplayer + prev);
            setChipMult({
              chip: e.chip + chips,
              multiplayer: e.multiplayer,
            });
          }
        });
      }
    }
  };

  const handleCheckHand = () => {
    if (checkStraight() && checkFlush()) {
      setCurrentHandType("Straight Flush");
      handleCalcScore("Straight flush");
      handleDiscardCards("play");
      setHand([]);
      setPlays((prev) => {
        return {
          ...prev,
          hands: prev.hands - 1,
        };
      });
    } else if (checkFlush()) {
      setCurrentHandType("Flush");
      handleCalcScore("Flush");
      handleDiscardCards();
      setHand([]);
      setPlays((prev) => {
        return {
          ...prev,
          hands: prev.hands - 1,
        };
      });
    } else if (checkStraight()) {
      setCurrentHandType("Straight");
      handleCalcScore("Straight");
      handleDiscardCards();
      setHand([]);
      setPlays((prev) => {
        return {
          ...prev,
          hands: prev.hands - 1,
        };
      });
    } else if (checkPair().type == "Pair") {
      setCurrentHandType("Pair");
      handleCalcScore("Pair", checkPair().cards);
      handleDiscardCards();
      setHand([]);
      setPlays((prev) => {
        return {
          ...prev,
          hands: prev.hands - 1,
        };
      });
    } else if (checkPair().type == "ThreeOfKind") {
      setCurrentHandType("Three Of Kind");
      handleCalcScore("Three of a kind", checkPair().cards);
      handleDiscardCards();
      setHand([]);
      setPlays((prev) => {
        return {
          ...prev,
          hands: prev.hands - 1,
        };
      });
    } else if (checkPair().type == "FourOfKind") {
      setCurrentHandType("Four Of Kind");
      handleCalcScore("Four Of a kind", checkPair().cards);
      handleDiscardCards();
      setHand([]);
      setPlays((prev) => {
        return {
          ...prev,
          hands: prev.hands - 1,
        };
      });
    } else if (checkPair().type == "TwoPair") {
      setCurrentHandType("Two Pair");
      handleCalcScore("Two Pair", checkPair().cards);
      handleDiscardCards();
      setHand([]);
      setPlays((prev) => {
        return {
          ...prev,
          hands: prev.hands - 1,
        };
      });
    } else if (checkPair() == "FullHouse") {
      setCurrentHandType("Full House");
      handleCalcScore("Full house");
      handleDiscardCards();
      setHand([]);
      setPlays((prev) => {
        return {
          ...prev,
          hands: prev.hands - 1,
        };
      });
    } else {
      setCurrentHandType("High Card");
      handleCalcScore("High Card");
      handleDiscardCards();
      setHand([]);
      setPlays((prev) => {
        return {
          ...prev,
          hands: prev.hands - 1,
        };
      });
    }
  };

  const checkFlush = () => {
    if (hand.length == 5) {
      let isFlush = [];
      for (let i = 0; i < hand.length; i++) {
        if (isFlush[0] == undefined) {
          isFlush = [hand[i].type];
        } else {
          if (isFlush[i - 1] == hand[i].type) {
            isFlush = [...isFlush, hand[i].type];
          } else {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  };
  const checkStraight = () => {
    if (hand.length == 5) {
      const sortedHand = [...hand].sort((a, b) => a.number - b.number);

      let isStraight = [];
      for (let i = 0; i < hand.length; i++) {
        if (isStraight[0] == undefined) {
          isStraight = [sortedHand[i].number];
        } else {
          if (isStraight[i - 1] + 1 == sortedHand[i].number) {
            isStraight = [...isStraight, sortedHand[i].number];
          } else {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  };
  const checkPair = () => {
    if (hand.length >= 2) {
      let isPair = {};

      for (let i = 0; i < hand.length; i++) {
        if (Object.keys(isPair).length == 0) {
          isPair = {
            [Number(hand[i].number)]: 1,
          };
        } else {
          isPair = {
            ...isPair,
            [Number(hand[i].number)]: isPair[[Number(hand[i].number)]]
              ? isPair[[Number(hand[i].number)]] + 1
              : 1,
          };
        }
      }
      const max = Math.max(...Object.values(isPair));
      const min = Math.min(...Object.values(isPair));
      if (max == 2) {
        if (
          Object.values(isPair).includes(
            max,
            Object.values(isPair).indexOf(max) + 1
          )
        )
          return {
            type: "TwoPair",
            cards: isPair,
          };
        else {
          return {
            type: "Pair",
            cards: isPair,
          };
        }
      }
      if (max == 3 && min != 2) {
        return { type: "ThreeOfKind", cards: isPair };
      } else if (max == 3 && min == 2) {
        return { type: "FullHouse", cards: isPair };
      }
      if (max == 4) {
        return { type: "FourOfKind", cards: isPair };
      }
    }
    return false;
  };
  console.log(hand);
  return (
    <div className="flex flex-col justify-center gap-10 items-center">
      <h1 className="text-center font-bold p-4 text-3xl">Balatro</h1>
      {roundeWin == true ? (
        <div className="flex flex-row gap-8 items-center justify-center">
          <h1 className="text-green-600 text-2xl font-bold">You won !</h1>
          <button
            onClick={() => setGameState(true)}
            className="border-2 border-black rounded-sm p-2 font-bold cursor-pointer transition-all hover:scale-105"
          >
            Next Round
          </button>
        </div>
      ) : roundeWin == "Lose" ? (
        <div>
          <h1 className="text-red-600 text-2xl font-bold">You Lose !</h1>
          <button
            onClick={() => setGameState(false)}
            className="border-2 border-black rounded-sm p-2 font-bold cursor-pointer transition-all hover:scale-105"
          >
            Restart
          </button>
        </div>
      ) : null}
      <div className="flex flex-row gap-14 mt-14 items-center">
        <div className="border-4 border-black gap-12 p-2 w-96">
          <div className="flex text-xl flex-row justify-evenly p-4">
            <h1 className="font-bold">Blind</h1>
            <h1>{currentBlind}</h1>
          </div>
          <div className="flex flex-row justify-evenly p-4">
            <h1>Round Score</h1>
            <h1>{score}</h1>
          </div>
          <h1 className="w-full text-2xl text-center mb-5 font-bold mt-3">
            {currentHandType || "No card type selected"}
          </h1>
          <div className="flex flex-row gap-4 p-2 items-center">
            <h1 className="p-2 text-white font-bold text-2xl rounded-md text-center bg-blue-600 w-1/2">
              {chipMult?.chip}
            </h1>
            <span className="text-red">X</span>
            <h1 className=" p-2 text-white font-bold text-2xl rounded-md text-center bg-red-600 w-1/2">
              {chipMult?.multiplayer}
            </h1>
          </div>
          <div className="flex  flex-row mt-4 justify-evenly gap-4">
            <div className="flex w-1/2 flex-col border-2 border-black rounded-sm gap-4 justify-center items-center p-2">
              <h1 className="text-center font-bold">Hands</h1>
              <h1>{plays?.hands}</h1>
            </div>
            <div className="flex w-1/2 items-center justify-center flex-col border-2 border-black rounded-sm gap-4 p-2">
              <h1 className="text-center font-bold">Discards</h1>
              <h1>{plays?.discards}</h1>
            </div>
          </div>
        </div>
        <div className="flex flex-col h-48 justify-between gap-8">
          <Cards
            deck={deck}
            addCardToHand={addCardToHand}
            numberOfCards={numberOfCards}
          />

          <div className="flex flex-row justify-center gap-4">
            <button
              onClick={handleCheckHand}
              className=" rounded-sm font-bold bg-blue-500 transition-all text-white hover:scale-105 border-2 w-40 cursor-pointer border-black p-2"
            >
              Play
            </button>
            <button
              onClick={() => handleDiscardCards("discard")}
              className=" rounded-sm font-bold  transition-all text-white hover:scale-105 active:scale-110 border-2 w-40 cursor-pointer border-black p-2"
              disabled={plays?.discards == 0 ? true : false}
              style={{ backgroundColor: plays?.discards == 0 ? "gray" : "red" }}
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
