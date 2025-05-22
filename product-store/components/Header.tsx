'use client';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-700 text-white p-4 flex justify-between">
      <Link href="/" className="font-bold text-xl">Loja</Link>
      <nav className="flex gap-4">
        <Link href="/products">Produtos</Link>
        <Link href="/cart">Carrinho</Link>
      </nav>
    </header>
  );
}
