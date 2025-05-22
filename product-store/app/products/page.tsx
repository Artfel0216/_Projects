import type { Products } from "@/lib/type";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

// Example mock data; replace with your actual data fetching logic
const products: Product[] = [
  { id: 1, name: "Product 1", price: 10, image: "/img1.jpg" },
  { id: 2, name: "Product 2", price: 20, image: "/img2.jpg" },
  { id: 3, name: "Product 3", price: 30, image: "/img3.jpg" },
];

export default function ProductsPage() {
  return (
    <>
      <Header />
      <main className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </main>
      <Footer />
    </>
  );
}
