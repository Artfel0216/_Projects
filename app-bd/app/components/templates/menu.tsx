import { Home, User } from "lucide-react"
import Menuitem from "./menuitem"

export default function Menu() {




    return(
        <div>
           <aside className="w-72 bg-zinc-900 h-screen">
                <nav className="flex flex-col gap-1 py-7">
                    <Menuitem icon={Home} text='ínicio' url="/"></Menuitem>
                    <Menuitem icon={User} text='user registration' url="/user"></Menuitem>
                </nav>
           </aside>
        </div>
    )
}