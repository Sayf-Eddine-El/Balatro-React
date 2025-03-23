import { useState } from "react";
import { useEffect } from "react";

const Cards = ({ deck, addCardToHand, numberOfCards }) => {
  const [currentCard, setCurrentCards] = useState([]);
  useEffect(() => {
    function sortCards() {
      let currentCards = [];
      for (let i = 0; i < numberOfCards; i++) {
        currentCards.push(deck[i]);
      }
      currentCards.sort((a, b) => b.chip - a.chip);
      setCurrentCards(currentCards);
    }
    sortCards();
  }, [deck, numberOfCards]);

  return (
    <div className=" flex flex-row gap-6">
      {[...Array(numberOfCards)].map((e, i) =>
        currentCard[i]?.discard == false ? (
          <img
            className="border-4 scale-110 hover:scale-[1.15] max-h-[100px] cursor-pointer transition-all p-[1px] rounded-md border-black max-w-[69px]"
            src={currentCard[i]?.img}
            onClick={() => addCardToHand(currentCard[i])}
            key={i}
            style={{
              transform: currentCard[i]?.active
                ? "translateY(-20px)"
                : "translateY(0px)",
            }}
          />
        ) : null
      )}
    </div>
  );
};

export default Cards;
