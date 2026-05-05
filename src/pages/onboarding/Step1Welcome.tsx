type Props = { name: string; onNext: () => void };

export function Step1Welcome({ name, onNext }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#aa3bff' }}>
          Passo 1 de 3
        </p>
        <h1 className="text-2xl font-semibold text-white">Olá, {name} 👋</h1>
        <p className="text-sm mt-3" style={{ color: '#666' }}>
          Bem-vindo à sua jornada de aprendizado personalizada. Aqui você vai passar por diagnóstico,
          análise e geração de um currículo sob medida para o seu perfil.
        </p>
      </div>
      <button
        onClick={onNext}
        className="px-4 py-2 rounded-lg font-medium text-sm w-fit"
        style={{ background: '#aa3bff', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        Continuar →
      </button>
    </div>
  );
}
