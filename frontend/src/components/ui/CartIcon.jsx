"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function CartIcon({ className = "", iconClassName = "h-5 w-5 text-green-600" }) {
  const { cartItems } = useCart();
  
  // Calculate total number of items in cart
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  return (
    <Link href="/user/cart" className={`p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors relative ${className}`}>
      <ShoppingBag className={iconClassName} />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
          {itemCount}
        </span>
      )}
    </Link>
  );
} 