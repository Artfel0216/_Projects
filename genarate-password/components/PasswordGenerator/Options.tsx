interface Props {
  includeUppercase: boolean;
  setIncludeUppercase: (v: boolean) => void;
  includeLowercase: boolean;
  setIncludeLowercase: (v: boolean) => void;
  includeNumbers: boolean;
  setIncludeNumbers: (v: boolean) => void;
  includeSymbols: boolean;
  setIncludeSymbols: (v: boolean) => void;
}

export default function Options({
  includeUppercase,
  setIncludeUppercase,
  includeLowercase,
  setIncludeLowercase,
  includeNumbers,
  setIncludeNumbers,
  includeSymbols,
  setIncludeSymbols,
}: Props) {
  return (
    <div className="options space-y-2">
      <label className="block">
        <input
          type="checkbox"
          checked={includeUppercase}
          onChange={(e) => setIncludeUppercase(e.target.checked)}
          className="mr-2"
        />
        Incluir letras maiúsculas
      </label>
      <label className="block">
        <input
          type="checkbox"
          checked={includeLowercase}
          onChange={(e) => setIncludeLowercase(e.target.checked)}
          className="mr-2"
        />
        Incluir letras minúsculas
      </label>
      <label className="block">
        <input
          type="checkbox"
          checked={includeNumbers}
          onChange={(e) => setIncludeNumbers(e.target.checked)}
          className="mr-2"
        />
        Incluir números
      </label>
      <label className="block">
        <input
          type="checkbox"
          checked={includeSymbols}
          onChange={(e) => setIncludeSymbols(e.target.checked)}
          className="mr-2"
        />
        Incluir símbolos
      </label>
    </div>
  );
}
