// components/header/page.tsx
import { Calendar, LayoutDashboard, Plus } from "lucide-react";

interface HeaderProps {
  onCreateProject: () => void;
  onOpenCalendarModal: () => void;
}

export default function Header({ onCreateProject, onOpenCalendarModal }: HeaderProps) {
  return (
    <header className="w-full h-[4rem] bg-black flex items-center justify-center px-4">
      <div className="flex items-center justify-center gap-8 mx-auto">
        <input
          id="projectName"
          type="text"
          placeholder="Enter the Name of the Project"
          className="w-[20rem] h-[3rem] border-white border-[1px] rounded p-4 text-white font-bold bg-black placeholder-white"
        />
        <button onClick={onCreateProject} className="w-[13rem] h-[3rem] bg-white text-black gap-2 flex items-center justify-center rounded font-bold">
          <Plus />
          Create New Project
        </button>
        <button className="w-[6rem] h-[3rem] bg-white text-black flex items-center justify-center rounded font-bold">
          <LayoutDashboard />
        </button>
        <button onClick={onOpenCalendarModal} className="w-[6rem] h-[3rem] bg-white text-black flex items-center justify-center rounded font-bold">
          <Calendar />
        </button>
      </div>
    </header>
  );
}
