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
  JOURNEY_INITIATED: 'Iniciada',
  DIAGNOSTIC_TRIGGERED: 'Diagnóstico',
  DIAGNOSTIC_COMPLETED: 'Diagnóstico concluído',
  ANALYSIS_STARTED: 'Análise',
  ANALYSIS_FINISHED: 'Análise concluída',
  CURRICULUM_GENERATED: 'Currículo gerado',
  CONTENT_DISPATCHED: 'Conteúdo enviado',
  STUDENT_ENGAGEMENT_RECEIVED: 'Engajamento',
  PROGRESS_MILESTONE_REACHED: 'Marco atingido',
  JOURNEY_COMPLETED: 'Concluída',
};

type Props = { currentStep: string; status: string };

export function JourneyProgress({ currentStep, status }: Props) {
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progresso da jornada</span>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          status === 'completed' ? 'bg-green-100 text-green-700' :
          status === 'failed' ? 'bg-red-100 text-red-700' :
          'bg-indigo-100 text-indigo-700'
        }`}>
          {status}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <div key={step} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-2 rounded-full ${
                done ? 'bg-indigo-600' :
                active ? 'bg-indigo-400' :
                'bg-gray-200'
              }`} />
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-2 text-center">
        {LABELS[currentStep] ?? currentStep}
        {' '}({currentIndex + 1}/{STEPS.length})
      </p>
    </div>
  );
}
