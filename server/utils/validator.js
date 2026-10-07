/**
 * Validates whether a card can legally be played on top of the active discard pile.
 * 
 * Rules:
 * 1. Wild and Wild Draw 4 cards are always legally playable.
 * 2. Card matches the current active color.
 * 3. Card matches the number/action value of the top card on the discard pile.
 * 
 * @param {Object} cardToPlay - The card object selected by the player.
 * @param {Object} topDiscardCard - The current top card on the discard pile.
 * @param {string} currentColor - The active game color (especially after a Wild card).
 * @returns {boolean} True if the play is valid according to UNO rules.
 */
const isValidMove = (cardToPlay, topDiscardCard, currentColor) => {
  if (!cardToPlay || !topDiscardCard) return false;

  // Wild cards can be played on any turn
  if (cardToPlay.color === 'wild') return true;

  // Matching current active color
  if (cardToPlay.color === currentColor) return true;

  // Matching symbol/value (e.g. Blue Skip on Red Skip, or Red 7 on Green 7)
  if (cardToPlay.value === topDiscardCard.value) return true;

  return false;
};

/**
 * Verifies if it is currently the requesting player's turn.
 * 
 * @param {Array} players - Array of player objects in the room.
 * @param {number} currentTurnIndex - Current active player index.
 * @param {string} socketId - Socket ID of the player attempting an action.
 * @returns {boolean}
 */
const isPlayerTurn = (players, currentTurnIndex, socketId) => {
  if (!players || players.length === 0) return false;
  const activePlayer = players[currentTurnIndex];
  return activePlayer && activePlayer.socketId === socketId;
};

/**
 * Checks if a player has exactly 1 card left and is eligible to call UNO.
 * 
 * @param {Object} player - The player object to check.
 * @returns {boolean}
 */
const canCallUno = (player) => {
  return Boolean(player && player.hand && player.hand.length === 1 && !player.saidUno);
};

module.exports = {
  isValidMove,
  isPlayerTurn,
  canCallUno
};