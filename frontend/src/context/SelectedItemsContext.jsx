"use client";

import { createContext, useContext, useState } from 'react';

const SelectedItemsContext = createContext();

export function SelectedItemsProvider({ children }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedItemsData, setSelectedItemsData] = useState([]);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0,
    promoApplied: false
  });

  const updateSelectedItems = (items) => {
    setSelectedItems(items);
  };

  const updateSelectedItemsData = (itemsData) => {
    setSelectedItemsData(itemsData);
  };

  const updateOrderSummary = (summary) => {
    setOrderSummary(summary);
  };

  const clearSelectedItems = () => {
    setSelectedItems([]);
    setSelectedItemsData([]);
    setOrderSummary({
      subtotal: 0,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: 0,
      promoApplied: false
    });
  };

  return (
    <SelectedItemsContext.Provider
      value={{
        selectedItems,
        selectedItemsData,
        orderSummary,
        updateSelectedItems,
        updateSelectedItemsData,
        updateOrderSummary,
        clearSelectedItems
      }}
    >
      {children}
    </SelectedItemsContext.Provider>
  );
}

export function useSelectedItems() {
  const context = useContext(SelectedItemsContext);
  if (context === undefined) {
    throw new Error('useSelectedItems must be used within a SelectedItemsProvider');
  }
  return context;
} 
