const INTERESTS = ['Exatas', 'Humanas', 'Tecnologia', 'Saúde', 'Outros'];

type Props = { interest: string; onSelect: (v: string) => void; onNext: () => void };

export function Step2Interest({ interest, onSelect, onNext }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#aa3bff' }}>
          Passo 2 de 3
        </p>
        <h2 className="text-xl font-semibold text-white">Qual é a sua área de interesse?</h2>
        <p className="text-sm mt-1" style={{ color: '#666' }}>
          Isso nos ajuda a personalizar a mensagem da sua jornada.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {INTERESTS.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: interest === opt ? 'rgba(170,59,255,0.15)' : '#111',
              border: `1px solid ${interest === opt ? '#aa3bff' : '#1e1e1e'}`,
              color: interest === opt ? '#aa3bff' : '#999',
              cursor: 'pointer',
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!interest}
        className="px-4 py-2 rounded-lg font-medium text-sm w-fit disabled:opacity-40"
        style={{ background: '#aa3bff', color: '#fff', border: 'none', cursor: interest ? 'pointer' : 'not-allowed' }}
      >
        Continuar →
      </button>
    </div>
  );
}
