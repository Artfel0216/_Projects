type DisplayProps = {
  value: string;
};

export default function Display({ value }: DisplayProps) {
  return (
    <div className="bg-[#1e1e2f] text-white p-5 text-2xl rounded-[10px] text-right overflow-x-auto min-h-[50px] mb-5">
      {value}
    </div>
  );
}
