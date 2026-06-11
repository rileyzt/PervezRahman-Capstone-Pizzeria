// CART CONTEXT — manages cart items across the app

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // load cart from localStorage (so it survives page refresh)
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ADD item to cart
  const addToCart = (item) => {
    // check if item already in cart
    const exists = cartItems.find((x) => x._id === item._id);

    if (exists) {
      // item already in cart — increase quantity by 1
      setCartItems(
        cartItems.map((x) =>
          x._id === item._id ? { ...x, quantity: x.quantity + 1 } : x
        )
      );
    } else {
      // new item — add with quantity 1
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  // REMOVE item from cart
  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x._id !== id));
  };

  // UPDATE quantity
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCartItems(
      cartItems.map((x) => (x._id === id ? { ...x, quantity } : x))
    );
  };

  // CALCULATE total
  const getTotal = () => {
    let total = 0;
    for (let i = 0; i < cartItems.length; i++) {
      total = total + cartItems[i].price * cartItems[i].quantity;
    }
    return total;
  };

  // CLEAR cart (after order is placed)
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  // COUNT items
  const getCartCount = () => {
    let count = 0;
    for (let i = 0; i < cartItems.length; i++) {
      count = count + cartItems[i].quantity;
    }
    return count;
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, getTotal, clearCart, getCartCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
