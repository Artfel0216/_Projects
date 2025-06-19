import { CarFront } from "lucide-react";

export default function Header() {
    return(
        <div className="w-full h-[5rem] bg-black text-[#DAA520] align-center items-center flex gap-2 p-5">
            <h1 className="text-[2rem] font-bold">Gerenciador de Veículos</h1>
            <CarFront className="ml-2 text-[#DAA520] w-[2rem] h-[2rem]"/>
            <p className="text-[1.2rem] ml-[31rem] text-[#fff] font-bold">Gerencie seus veículos de forma fácil e rápida</p>
        </div>
    )
}