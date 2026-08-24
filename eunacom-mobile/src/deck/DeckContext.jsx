import React, { createContext, useContext } from 'react';

export const DeckContext = createContext({
  slide: 0,
  total: 1,
  clicks: 0,
  isStatic: false,
  registerMax: () => {},
  next: () => {},
  prev: () => {},
  go: () => {},
});

export const useDeck = () => useContext(DeckContext);
