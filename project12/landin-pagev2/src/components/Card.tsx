


const Card = () => {
    return(
        <div className="max-w-7xl mx-auto text-center mt-[5rem]">
    <h2 className="text-4xl font-bold mb-10">
      See what our <span className="relative inline-block">
        <span className="bg-yellow-300 absolute bottom-1 left-0 w-full h-2 z-0"></span>
        <span className="relative z-10">trusted users</span>
      </span> Say
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div className="bg-white rounded-lg shadow p-6 text-left">
        <div className="flex items-center mb-4">
        </div>
        <p className="text-gray-600 mb-4">"If you haven’t tried whitepace yet, you need to give it a shot for your next event. It’s so easy and intuitive to get a new event setup and if you need any help their customer service is seriously amazing."</p>
        <div className="font-semibold text-gray-800">Jessie Owner</div>
        <div className="text-sm text-gray-500 mb-2">Founder, XYZ Company</div>
        <div className="text-yellow-400 text-lg">★★★★★</div>
      </div>

      <div className="bg-blue-500 text-white rounded-lg p-6 text-left">
        <div className="flex items-center mb-4">
        </div>
        <p className="mb-4">"If you haven’t tried whitepace yet, you need to give it a shot for your next event. It’s so easy and intuitive to get a new event setup and if you need any help their customer service is seriously amazing."</p>
        <div className="font-semibold">Jessie Owner</div>
        <div className="text-sm text-blue-100 mb-2">Founder, XYZ Company</div>
        <div className="text-yellow-300 text-lg">★★★★★</div>
      </div>

      <div className="bg-blue-600 text-white rounded-lg p-6 text-left">
        <div className="flex items-center mb-4">
        </div>
        <p className="mb-4">"If you haven’t tried whitepace yet, you need to give it a shot for your next event. It’s so easy and intuitive to get a new event setup and if you need any help their customer service is seriously amazing."</p>
        <div className="font-semibold">Jessie Owner</div>
        <div className="text-sm text-blue-100 mb-2">Founder, XYZ Company</div>
        <div className="text-yellow-300 text-lg">★★★★★</div>
      </div>
    </div>

    <div className="mt-10 flex justify-center gap-4">
      <button className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
        ←
      </button>
      <button className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
        →
      </button>
    </div>
  </div>
    )
}

export default Card;