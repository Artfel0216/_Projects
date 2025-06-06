import { User } from "@/app/core/model/user"

export interface LineUserProps{
    user: User
}


export default function lineuser(props: LineUserProps) {
    return(
        <div className="flex p-4 bg-zinc-900 rounded-md">
         <div className="flex flex-col">

        <span className="text-xl font-black">{props.user.name}</span>
        <span className="text-sm text-zinc-400">{props.user.email}</span>

        </div>
        </div>
    )
}