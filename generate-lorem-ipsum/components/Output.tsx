interface Props {
  paragraphs: string[];
}

export default function Output({ paragraphs }: Props) {
  return (
    <div className="text-left mt-4 space-y-4" id="output">
      {paragraphs.map((p, idx) => (
        <p key={idx} className="text-gray-800">
          {p}
        </p>
      ))}
    </div>
  );
}
