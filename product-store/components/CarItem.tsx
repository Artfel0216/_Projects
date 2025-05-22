'use client';

import { Products } from '@/lib/type';
import useCart from '@/hooks/useCart';

interface CartItemProps {
  product: Products;
  quantity: number;
}

export default function CartItem({ product, quantity }: CartItemProps) {
  const { addToCart, removeFromCart, decreaseFromCart } = useCart();

  return (
    <div className="flex items-center justify-between border-b py-4">
      <div className="flex items-center gap-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-20 h-20 object-cover rounded"
        />
        <div>
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <p className="text-sm text-gray-500">R$ {product.price.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => decreaseFromCart(product.id)}
          className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          -
        </button>
        <span className="font-medium">{quantity}</span>
        <button
          onClick={() => addToCart(product)}
          className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          +
        </button>
        <button
          onClick={() => removeFromCart(product.id)}
          className="ml-2 px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
        >
          Remover
        </button>
      </div>
    </div>
  );
}
