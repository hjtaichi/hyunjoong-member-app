import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addToCart(product, quantity = 1) {
    setItems((prev) => {
      const found = prev.find((item) => item.product.id === product.id);

      if (found) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { product, quantity }];
    });
  }

  function updateQuantity(productId, quantity) {
    const nextQuantity = Math.max(1, Number(quantity || 1));

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: nextQuantity }
          : item
      )
    );
  }

  function removeFromCart(productId) {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.product.price || 0) * item.quantity,
        0
      ),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return value;
}