const Footer = () => {
    return (
        <div className="bg-blue-900 text-white mt-[5rem]">

        <footer className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-8 text-sm">
          <div>
            <div className="font-bold text-xl mb-2">🏢 whitepace</div>
            <p>whitepace was created for the new ways we live and work. We make a better workspace around the world</p>
          </div>
      
          <div>
            <h4 className="font-semibold mb-2">Product</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">Overview</a></li>
              <li><a href="#" className="hover:underline">Pricing</a></li>
              <li><a href="#" className="hover:underline">Customer stories</a></li>
            </ul>
          </div>
      
          <div>
            <h4 className="font-semibold mb-2">Resources</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">Blog</a></li>
              <li><a href="#" className="hover:underline">Guides & tutorials</a></li>
              <li><a href="#" className="hover:underline">Help center</a></li>
            </ul>
          </div>
      
          <div>
            <h4 className="font-semibold mb-2">Company</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">About us</a></li>
              <li><a href="#" className="hover:underline">Careers</a></li>
              <li><a href="#" className="hover:underline">Media kit</a></li>
            </ul>
          </div>
      
          <div>
            <h4 className="font-semibold mb-2">Try It Today</h4>
            <p className="mb-4">Get started for free. Add your whole team as your needs grow.</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Start today →</button>
          </div>
        </footer>
      
        <div className="border-t border-blue-700 py-4 text-xs text-gray-300 px-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap gap-4 items-center">
            <span>🌐 English</span>
            <span className="hidden sm:inline">|</span>
            <a href="#" className="hover:underline">Terms & privacy</a>
            <span className="hidden sm:inline">|</span>
            <a href="#" className="hover:underline">Security</a>
            <span className="hidden sm:inline">|</span>
            <a href="#" className="hover:underline">Status</a>
          </div>
          <div className="flex items-center gap-4">
            <span>©2021 Whitepace LLC.</span>
            <div className="flex gap-2 text-white">
              <a href="#" className="hover:text-blue-400">🐦</a>
              <a href="#" className="hover:text-blue-400">📘</a>
              <a href="#" className="hover:text-blue-400">🔗</a>
            </div>
          </div>
        </div>
      
      </div>
    )
}

export default Footer