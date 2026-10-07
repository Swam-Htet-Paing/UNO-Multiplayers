const COLORS = ['red', 'blue', 'green', 'yellow'];
const ACTION_VALUES = ['skip', 'reverse', 'draw2'];
const NUMBER_VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Creates a standard standard 108-card UNO deck.
 * - 19 Red cards (one '0', two each of '1'-'9')
 * - 19 Blue cards (one '0', two each of '1'-'9')
 * - 19 Green cards (one '0', two each of '1'-'9')
 * - 19 Yellow cards (one '0', two each of '1'-'9')
 * - 8 Draw Two cards (2 in each color)
 * - 8 Reverse cards (2 in each color)
 * - 8 Skip cards (2 in each color)
 * - 4 Wild cards
 * - 4 Wild Draw Four cards
 * @returns {Array} Shuffled array of 108 card objects
 */
const createDeck = () => {
  const deck = [];

  COLORS.forEach((color) => {
    // One '0' card per color
    deck.push({
      id: `${color}_0_${Math.random().toString(36).substring(2, 9)}`,
      color,
      value: '0'
    });

    // Two of each number 1-9 per color
    NUMBER_VALUES.slice(1).forEach((val) => {
      deck.push({
        id: `${color}_${val}_a_${Math.random().toString(36).substring(2, 9)}`,
        color,
        value: val
      });
      deck.push({
        id: `${color}_${val}_b_${Math.random().toString(36).substring(2, 9)}`,
        color,
        value: val
      });
    });

    // Two of each Action card (Skip, Reverse, Draw 2) per color
    ACTION_VALUES.forEach((val) => {
      deck.push({
        id: `${color}_${val}_a_${Math.random().toString(36).substring(2, 9)}`,
        color,
        value: val
      });
      deck.push({
        id: `${color}_${val}_b_${Math.random().toString(36).substring(2, 9)}`,
        color,
        value: val
      });
    });
  });

  // 4 Wild Cards & 4 Wild Draw Four Cards
  for (let i = 0; i < 4; i++) {
    deck.push({
      id: `wild_${i}_${Math.random().toString(36).substring(2, 9)}`,
      color: 'wild',
      value: 'wild'
    });
    deck.push({
      id: `wild_draw4_${i}_${Math.random().toString(36).substring(2, 9)}`,
      color: 'wild',
      value: 'wild_draw4'
    });
  }

  return shuffle(deck);
};

/**
 * Fisher-Yates shuffle algorithm for un-biased card randomization.
 * @param {Array} array 
 * @returns {Array} Shuffled array
 */
const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

module.exports = {
  createDeck,
  shuffle
};