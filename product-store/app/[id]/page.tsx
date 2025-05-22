import { products } from "@/lib/data";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id);
  if (!product) return notFound();

  return (
    <>
      <Header />
      <main className="p-8">
        <img src={product.image} alt={product.name} className="w-full max-w-sm mb-4" />
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p>{product.description}</p>
        <p className="mt-2 text-lg">R$ {product.price.toFixed(2)}</p>
      </main>
      <Footer />
    </>
  );
}
