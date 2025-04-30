import Logo from '../assets/sponsors.png'


const Sponsors = () => {
    return(
 <div className='flex flex-col items-center justify-center py-20 bg-[#F9F9F9] px-4'>
    <h2 className="text-3xl font-bold mb-8 text-[3rem]">
      Our <span className="relative z-10">sponsors</span>
    </h2>
    <img src={Logo} alt="" className='mt-[3rem]' />
 </div>
    
    )
}
 
export default Sponsors;