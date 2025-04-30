const Chose = () => {
    return(
        <div className="mt-[5rem] w-full">
            <h1 className="font-bold text-[#000] text-[3rem] ml-[30rem]">Choose Your Plan</h1>
            <p className="flex justify-items-center items-center text-center ml-[18rem]">Whether you want to get organized, keep your personal life on track, or boost workplace productivity, Evernote has the <br />
             right plan for you.</p>

             <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
    
   
    <div className="border border-blue-500 rounded-lg p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold mb-2~">Free</h2>
        <p className="text-3xl font-bold mb-4">$0</p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✔ Sync unlimited devices</li>
          <li>✔ 10 GB monthly uploads</li>
          <li>✔ 200 MB max. note size</li>
          <li>✔ Customize Home dashboard and access extra widgets</li>
          <li>✔ Connect primary Google Calendar account</li>
          <li>✔ Add due dates, reminders, and notifications to your tasks</li>
        </ul>
      </div>
      <button className="mt-6  w-[7rem] cursor-pointer bg-white text-blue-500 border border-blue-500 py-2 rounded">
        Get Started
      </button>
    </div>


    <div className="bg-white rounded-lg p-6 shadow-md flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-[#043873]">Personal</h2>
        <p className="text-3xl font-bold mb-2 text-[#043873]">$11.99</p>
        <p className="text-sm text-[#043873] mb-4">Keep home and family on track</p>
        <ul className="space-y-2 text-sm text-[#043873]">
          <li>✔ Sync unlimited devices</li>
          <li>✔ 10 GB monthly uploads</li>
          <li>✔ 200 MB max. note size</li>
          <li>✔ Customize Home dashboard and access extra widgets</li>
          <li>✔ Connect primary Google Calendar account</li>
          <li>✔ Add due dates, reminders, and notifications to your tasks</li>
        </ul>
      </div>
      <button className="mt-6  w-[7rem] cursor-pointer bg-[#4F9CF9] text-[#4F9CF9] text-[#ffff] py-2 rounded hover:bg-[#043873]">
        Get Started
      </button>
    </div>

   
    <div className="border border-yellow-400 rounded-lg p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-[#000]">Organization</h2>
        <p className="text-3xl font-bold mb-2 text-[#000]">$49.99</p>
        <p className="text-sm text-[#000] mb-4">Capture ideas and find them quickly</p>
        <ul className="space-y-2 text-sm text-[#000]">
          <li>✔ Sync unlimited devices</li>
          <li>✔ 10 GB monthly uploads</li>
          <li>✔ 200 MB max. note size</li>
          <li>✔ Customize Home dashboard and access extra widgets</li>
          <li>✔ Connect primary Google Calendar account</li>
          <li>✔ Add due dates, reminders, and notifications to your tasks</li>
        </ul>
      </div>
      <button className="mt-6 w-[7rem] cursor-pointer bg-white text-yellow-600 border border-yellow-400 py-2 rounded hover:bg-[#FFE492]">
        Get Started
      </button>
    </div>

  </div>
        </div>
    )
}

export default Chose