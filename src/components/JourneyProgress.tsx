const STEPS = [
  'JOURNEY_INITIATED',
  'DIAGNOSTIC_TRIGGERED',
  'DIAGNOSTIC_COMPLETED',
  'ANALYSIS_STARTED',
  'ANALYSIS_FINISHED',
  'CURRICULUM_GENERATED',
  'CONTENT_DISPATCHED',
  'STUDENT_ENGAGEMENT_RECEIVED',
  'PROGRESS_MILESTONE_REACHED',
  'JOURNEY_COMPLETED',
];

const LABELS: Record<string, string> = {
  JOURNEY_INITIATED:           'Iniciada',
  DIAGNOSTIC_TRIGGERED:        'Diagnóstico disparado',
  DIAGNOSTIC_COMPLETED:        'Diagnóstico concluído',
  ANALYSIS_STARTED:            'Análise iniciada',
  ANALYSIS_FINISHED:           'Análise concluída',
  CURRICULUM_GENERATED:        'Currículo gerado',
  CONTENT_DISPATCHED:          'Conteúdo enviado',
  STUDENT_ENGAGEMENT_RECEIVED: 'Engajamento recebido',
  PROGRESS_MILESTONE_REACHED:  'Marco atingido',
  JOURNEY_COMPLETED:           'Concluída',
};

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  completed: { background: 'rgba(61,220,132,0.1)',  color: '#3ddc84' },
  failed:    { background: 'rgba(220,61,61,0.1)',   color: '#dc3d3d' },
};

type Props = { currentStep: string; status: string };

export function JourneyProgress({ currentStep, status }: Props) {
  const currentIndex = STEPS.indexOf(currentStep);
  const pct = Math.round(((currentIndex + 1) / STEPS.length) * 100);
  const statusStyle = STATUS_STYLE[status] ?? { background: 'rgba(170,59,255,0.1)', color: '#aa3bff' };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: '#666' }}>Progresso da jornada</span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={statusStyle}
        >
          {status}
        </span>
      </div>

      {/* Track */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, index) => {
          const done   = index < currentIndex;
          const active = index === currentIndex;
          return (
            <div
              key={step}
              className="flex-1 h-1 rounded-full transition-colors"
              style={{
                background: done
                  ? '#aa3bff'
                  : active
                    ? 'rgba(170,59,255,0.45)'
                    : '#1e1e1e',
              }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: '#555' }}>
          {LABELS[currentStep] ?? currentStep}
        </p>
        <p className="text-xs font-medium" style={{ color: '#aa3bff' }}>{pct}%</p>
      </div>
    </div>
  );
}
