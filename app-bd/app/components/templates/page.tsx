import Menu from "./menu";



export interface PageProps {
    children: any;
}

export default function Page(props: PageProps) {

    return(
        <div className="flex">
            <Menu/>
            <main className=" flex-1 p-7">
                {props.children}
            </main>
        </div>
    )
}