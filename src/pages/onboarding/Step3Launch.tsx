type Props = {
  interest: string;
  loading: boolean;
  error: string;
  onLaunch: () => void;
};

const STEPS_DESCRIPTION = [
  'Diagnóstico do seu perfil de aprendizado',
  'Análise e geração de currículo personalizado',
  'Entrega de conteúdo e acompanhamento de progresso',
];

export function Step3Launch({ interest, loading, error, onLaunch }: Props) {
  const label = interest ? `de ${interest}` : 'de aprendizado';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#aa3bff' }}>
          Passo 3 de 3
        </p>
        <h2 className="text-xl font-semibold text-white">Sua jornada {label} começa agora</h2>
        <p className="text-sm mt-1" style={{ color: '#666' }}>
          O sistema vai guiar você por três grandes fases:
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {STEPS_DESCRIPTION.map((s, i) => (
          <li key={i} className="flex items-start gap-3 text-sm" style={{ color: '#888' }}>
            <span
              className="shrink-0 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
              style={{ width: 20, height: 20, background: 'rgba(170,59,255,0.15)', color: '#aa3bff' }}
            >
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ul>

      {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}

      <button
        onClick={onLaunch}
        disabled={loading}
        className="px-4 py-2 rounded-lg font-medium text-sm w-fit disabled:opacity-40"
        style={{ background: '#aa3bff', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Iniciando…' : 'Iniciar minha jornada'}
      </button>
    </div>
  );
}
