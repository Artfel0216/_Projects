import logo from '../assets/WorkTogether.png'

const WorkTogether = () => {
    return(
        <div className='flex'>
            <img src={logo} className='w-[30rem] h-[28rem] mt-[5rem] ml-[2rem]' alt="" />
            <div>
                <h1 className='text-[2.5rem] font-bold mt-[5rem] ml-[10rem]'>Work Together</h1>
                <p className='text-[1rem]  mt-[2rem] ml-[10rem]'>With whitepace, share your notes with your colleagues and collaborate on <br />
                them.You can also publish a note to the internet and share the URL with <br />
                 others.
</p>
                <button className='bg-[#4F9CF9] hover:bg-[#043873] cursor-pointer text-white w-[10rem] h-[3rem] rounded mt-[2rem] ml-[10rem]'>Try it Now</button>
            </div>
        </div>
    )
}

export default WorkTogether;