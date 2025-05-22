import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Bem-vindo à nossa Loja</h1>
        <p>Confira nossos produtos incríveis!</p>
      </main>
      <Footer />
    </>
  );
}
