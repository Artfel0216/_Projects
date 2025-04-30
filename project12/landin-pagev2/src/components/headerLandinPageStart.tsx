import logo from '../assets/Logo.png';

const HeaderLandinPageStart = () => {
    return (
       <nav className="w-full h-[3rem] bg-[#FFFFFF] flex px-[3rem]">
        
        <img src={logo} className='w-[10rem] h-[2rem] mt-[2rem] cursor-pointer' alt="Logo" />

         <section className='font-dmSans text-[18px] font-medium justify-around flex items-center gap-[2rem] ml-[20rem] mr-[100%] mt-[2rem]'>
            <a href="" className='hover:text-[#043873] text-[#4F9CF9]'>Products</a>
            <a href="" className='hover:text-[#043873] text-[#4F9CF9]'>Solutions</a>
            <a href="" className='hover:text-[#043873] text-[#4F9CF9]'>Resoucers</a>
            <a href="" className='hover:text-[#043873] text-[#4F9CF9]'>Pricing</a>

            <button className='bg-[#FFE492] hover:bg-[#FFDC4D] text-[#043873] h-[4rem] w-[7rem] flex items-center justify-center rounded  cursor-pointer'>Login</button>
            <button className='bg-[#4F9CF9] hover:bg-[#043873] text-[#ffffff] h-[4rem] w-[15rem] flex items-center justify-center rounded  cursor-pointer'>Try Whitepace Free</button>
         </section>
       </nav>
    );
}

export default HeaderLandinPageStart;