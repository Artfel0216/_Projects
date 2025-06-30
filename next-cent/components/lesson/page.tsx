export default function Lesson() {
  return (
    <section className="bg-[#F5F7FA] w-full py-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12">
     
        <div className="flex-1">
          <h1 className="text-[#4D4D4D] text-[3rem] font-bold leading-tight">
            Lessons and Insights <br />
            <span className="text-[#4CAF4F]">from 8 years</span>
          </h1>
          <p className="text-[#717171] mt-4 text-lg">
            Where to grow your business as a photographer: site or social media?
          </p>
          <button className="mt-6 bg-[#4CAF4F] text-white cursor-pointer font-semibold px-6 py-2 rounded">
            Register
          </button>
        </div>

        <div className="flex-1 flex justify-center">
          <img
            src="/illustration.png"
            alt="Illustration"
            className="max-w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
