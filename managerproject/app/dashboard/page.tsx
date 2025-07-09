import Header from "../components/header/page";

export default function dashboard() {
    return(
        <div>
            <Header />

            <h1 className="font-bold text-[2rem] mt-[2rem] ml-[3rem]">Welcome, Arthur Fellipe 👨🏽‍💻</h1>

            <div className="w-[30rem] h-[20rem] bg-black mt-[2rem] ml-[3rem] font-bold text-[1.3rem] rounded text-white p-[2rem] shadow-2xl">
                <h1>📌 Recent:</h1>
            </div>
        </div>
    )
}