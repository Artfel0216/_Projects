interface Props {
  password: string;
}

export default function PasswordBox({ password }: Props) {
  return (
    <div className="bg-gray-100 p-3 rounded border text-center font-mono text-lg" id="password">
      {password || 'Sua senha aparecerá aqui'}
    </div>
  );
}
