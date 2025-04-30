import Logo from '../assets/Apps.png'


const Apps = () => {
    return(
        <div className='w-full h-[30rem] bg-[#043873]'>
               <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
      
      <div className="flex flex-wrap justify-center gap-6">
       <img src={Logo} alt="" />
      </div>
  
      <div>
        <h2 className="text-4xl font-bold mb-4 leading-tight text-white">
          Work with Your <br /> Favorite Apps Using <br /> <span className="text-white">whitepace</span>
        </h2>
        <p className="text-gray-300 mb-6">
          Whitespace teams up with Zapier to integrate with over 1000+ apps with Zapier to have all the tools you need for your project success.
        </p>
        <button className="inline-flex items-center bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 transition">
          Read more
        </button>
        
      </div>
  
    </div>

        </div>
     
    )
}

export default Apps