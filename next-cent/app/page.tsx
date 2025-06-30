import Header from "@/components/header/page";
import Lesson from "@/components/lesson/page";
import Sponsors from "@/components/sponsors/page";

export default function Home() {
  return (
    <div className="w-full">
      <Header />
      <Lesson />
      <Sponsors />
    </div>
  );
}
