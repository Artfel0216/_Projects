import icon from '@/public/Icon.png'

export default function Header() {
  return (
    <header className="w-full h-[6rem] flex items-center justify-between px-20 shadow-md">
      <div className="flex items-center">
        <img src={icon.src} alt="Logo" className="h-6 w-auto" />
        <span className="ml-2 font-bold text-xl text-gray-800">Nexcent</span>
      </div>
      <nav className="flex items-center gap-10 text-gray-700 text-sm font-medium">
        <a href="#">Home</a>
        <a href="#">Features</a>
        <a href="#">Community</a>
        <a href="#">Blog</a>
        <a href="#">Pricing</a>
        <button className="bg-green-500 hover:bg-green-600 cursor-pointer text-white px-4 py-2 rounded flex items-center gap-1">
          Register Now →
        </button>
      </nav>
    </header>
  );
}
