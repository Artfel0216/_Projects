import Logo from "../assets/Element.png"

const Date = () => {
    return(
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10 mt-[4rem]">
    
        <div>
          <h2 className="text-4xl font-bold mb-4">
            100% <span>your data</span>
          </h2>
          <p className="text-gray-600 mb-6">
            The app is open source and your notes are saved to an open format, so you'll always have access to them.
            Uses End-To-End Encryption (E2EE) to secure your notes and ensure no-one but yourself can access them.
          </p>
          <button className=" flex justify-center items-center bg-blue-500 text-white w-[7rem] h-[3rem] rounded hover:bg-blue-600 transition">
            Read more 
          </button>
        </div>
    
    
        <div>
          <img src={Logo} alt="Data Security Graphic" className="w-full rounded-md shadow-md" />
        </div>
        
      </div>
    )
}

export default Date