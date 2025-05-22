interface ToggleButtonProps {
  isRunning: boolean;
  onClick: () => void;
}

export default function ToggleButton({ isRunning, onClick }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mt-5 px-5 py-2 text-lg border-none rounded bg-[#007BFF] hover:bg-[#0056b3] text-white cursor-pointer"
    >
      {isRunning ? 'Parar' : 'Iniciar'}
    </button>
  );
}
