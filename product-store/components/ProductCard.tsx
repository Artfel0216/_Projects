import { Product } from "@/lib/types/data";
import Link from "next/link";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="border p-4 rounded shadow hover:shadow-md transition">
      <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-2" />
      <h2 className="text-lg font-bold">{product.name}</h2>
      <p>R$ {product.price.toFixed(2)}</p>
      <Link href={`/products/${product.id}`} className="text-blue-500 mt-2 block">Ver detalhes</Link>
    </div>
  );
}
