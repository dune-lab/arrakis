import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe, listJourneys, startJourney, republish, type Me, type JourneyData } from '../api/imperium';
import { JourneyProgress } from '../components/JourneyProgress';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const EVENT_LABELS: Record<string, string> = {
  JOURNEY_INITIATED:           'Jornada iniciada',
  DIAGNOSTIC_TRIGGERED:        'Diagnóstico disparado',
  DIAGNOSTIC_COMPLETED:        'Diagnóstico concluído',
  ANALYSIS_STARTED:            'Análise iniciada',
  ANALYSIS_FINISHED:           'Análise concluída',
  CURRICULUM_GENERATED:        'Currículo gerado',
  CONTENT_DISPATCHED:          'Conteúdo enviado',
  STUDENT_ENGAGEMENT_RECEIVED: 'Engajamento recebido',
  PROGRESS_MILESTONE_REACHED:  'Marco atingido',
  JOURNEY_COMPLETED:           'Jornada concluída',
};

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  completed: { background: 'rgba(61,220,132,0.1)',  color: '#3ddc84' },
  failed:    { background: 'rgba(220,61,61,0.1)',   color: '#dc3d3d' },
};

function JourneyTimeline({ events }: { events: JourneyData['events'] }) {
  if (events.length === 0) {
    return <p className="text-xs mt-4" style={{ color: '#444' }}>Nenhum evento registrado ainda.</p>;
  }
  return (
    <div className="mt-4 flex flex-col gap-0">
      {events.map((ev, i) => (
        <div key={ev.id} className="flex items-start gap-3">
          <div className="flex flex-col items-center" style={{ minWidth: 12 }}>
            <div
              className="rounded-full shrink-0"
              style={{ width: 8, height: 8, background: '#aa3bff', marginTop: 4 }}
            />
            {i < events.length - 1 && (
              <div style={{ width: 1, flex: 1, minHeight: 20, background: '#252525' }} />
            )}
          </div>
          <div className="pb-3">
            <p className="text-xs font-medium" style={{ color: '#e2e2e2' }}>
              {EVENT_LABELS[ev.name] ?? ev.name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#444' }}>
              {new Date(ev.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function JourneyCard({ journey }: { journey: JourneyData }) {
  const [open, setOpen] = useState(false);
  const statusStyle = STATUS_STYLE[journey.status] ?? { background: 'rgba(170,59,255,0.1)', color: '#aa3bff' };

  return (
    <div className="rounded-xl p-5" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs" style={{ color: '#555' }}>
          {new Date(journey.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={statusStyle}
          >
            {journey.status}
          </span>
          <button
            onClick={() => setOpen(v => !v)}
            className="text-xs transition-colors"
            style={{ color: '#444', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#999')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#444')}
          >
            {open ? 'ocultar' : 'timeline'}
          </button>
        </div>
      </div>

      <JourneyProgress currentStep={journey.currentStep} status={journey.status} />

      {open && <JourneyTimeline events={journey.events} />}
    </div>
  );
}

export function Dashboard() {
  const { token } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [journeys, setJourneys] = useState<JourneyData[]>([]);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [republishing, setRepublishing] = useState(false);
  const [republishMsg, setRepublishMsg] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    const [meData, journeysData] = await Promise.all([
      getMe(token),
      listJourneys(token),
    ]);
    setMe(meData);
    setJourneys(journeysData);
  }, [token]);

  useEffect(() => {
    load().catch(err => setError(err.message));
  }, [load]);

  async function handleNewJourney() {
    if (!token || !me?.student) return;
    setStarting(true);
    try {
      await startJourney(me.student.id, token);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar jornada');
    } finally {
      setStarting(false);
    }
  }

  async function handleRepublish() {
    if (!token) return;
    setRepublishing(true);
    setRepublishMsg('');
    try {
      const { republished } = await republish(token);
      setRepublishMsg(`${republished} jornada(s) reativada(s)`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reativar jornadas');
    } finally {
      setRepublishing(false);
    }
  }

  if (error) return <div className="p-8 text-sm" style={{ color: '#f87171' }}>{error}</div>;
  if (!me) return <div className="p-8 text-sm" style={{ color: '#444' }}>Carregando…</div>;

  const myJourneys = me.student
    ? journeys.filter(j => j.studentId === me.student!.id).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  return (
    <div className="p-8">
      <div className="max-w-2xl flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Olá, {me.user.name}</h1>
            <p className="text-xs mt-1" style={{ color: '#555' }}>{me.user.email}</p>
          </div>
          {me.student && (
            <div className="flex gap-2 items-center">
              {republishMsg && (
                <span className="text-xs" style={{ color: '#3ddc84' }}>{republishMsg}</span>
              )}
              <Button
                variant="secondary"
                loading={republishing}
                onClick={handleRepublish}
              >
                Republish
              </Button>
              <Button loading={starting} onClick={handleNewJourney}>
                Nova jornada
              </Button>
            </div>
          )}
        </div>

        {/* Onboarding: sem perfil de aluno */}
        {!me.student && (
          <Card>
            <p className="text-sm mb-4" style={{ color: '#999' }}>
              Complete seu perfil de aluno para começar a jornada.
            </p>
            <Link to="/onboarding">
              <Button>Criar perfil de aluno</Button>
            </Link>
          </Card>
        )}

        {/* Jornadas */}
        {me.student && myJourneys.length === 0 && (
          <Card>
            <p className="text-sm mb-4" style={{ color: '#999' }}>
              Inicie sua primeira jornada de aprendizado.
            </p>
            <Button loading={starting} onClick={handleNewJourney}>Iniciar jornada</Button>
          </Card>
        )}

        {myJourneys.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#444' }}>
              Jornadas ({myJourneys.length})
            </p>
            {myJourneys.map(j => (
              <JourneyCard key={j.id} journey={j} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
