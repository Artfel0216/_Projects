import { Home, Import } from "lucide-react"
import Link from "next/link"
import { ElementType } from "react"

export interface MenuItemProps{
    icon: ElementType,
    url: string,
    text:string
}
export default function Menuitem(props: MenuItemProps ) {
    return(
        <Link href={props.url} className="flex gap-2 p-2 px-4 py-2 hover: bg-black">

           <props.icon className='text-zinc-200' size={24} stroke={1}/>

           <span className="text-zinc-200">{props.text}</span>
        </Link>
    )
}