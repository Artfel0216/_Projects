import user from '../../data/constants/user'
import LineUser from './lineuser'

export default function ListUser() {
    return(
        <div className="flex flex-col gap-4">
            {user.map((user, i)=> {
                return <LineUser key={user.id} user={user}/>
            })}
        </div>
    )
}