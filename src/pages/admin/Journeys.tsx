import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { listJourneys, republish, type JourneyData } from '../../api/imperium';
import { Button } from '../../components/ui/Button';

type Filter = 'all' | 'active' | 'completed' | 'failed' | 'stuck';

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  completed: { background: 'rgba(61,220,132,0.1)',  color: '#3ddc84' },
  failed:    { background: 'rgba(220,61,61,0.1)',   color: '#dc3d3d' },
  stuck:     { background: 'rgba(220,61,61,0.07)',  color: '#f87171' },
};

function computeStuck(journey: JourneyData): boolean {
  if (journey.status !== 'active') return false;
  if (journey.events.length === 0) return false;
  const lastEventAt = Math.max(...journey.events.map(e => new Date(e.createdAt).getTime()));
  const oneHourMs = 60 * 60 * 1000;
  return Date.now() - lastEventAt > oneHourMs;
}

function formatStuckDuration(journey: JourneyData): string {
  if (journey.events.length === 0) return '';
  const lastEventAt = Math.max(...journey.events.map(e => new Date(e.createdAt).getTime()));
  const diffMs = Date.now() - lastEventAt;
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  const days = Math.floor(hours / 24);
  if (days > 0) return `parada há ${days}d`;
  return `parada há ${hours}h`;
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',       label: 'Todas' },
  { key: 'active',    label: 'Ativas' },
  { key: 'completed', label: 'Concluídas' },
  { key: 'failed',    label: 'Falhas' },
  { key: 'stuck',     label: 'Travadas' },
];

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const STEP_COLOR: Record<string, string> = {
  JOURNEY_INITIATED:          '#aa3bff',
  DIAGNOSTIC_TRIGGERED:       '#60a5fa',
  DIAGNOSTIC_COMPLETED:       '#60a5fa',
  CURRICULUM_GENERATED:       '#fbbf24',
  CONTENT_DELIVERED:          '#fbbf24',
  PROGRESS_MILESTONE_REACHED: '#3ddc84',
  JOURNEY_COMPLETED:          '#3ddc84',
};

function Timeline({ events }: { events: JourneyData['events'] }) {
  const sorted = [...events].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return (
    <div className="mt-3 pl-1">
      {sorted.map((e, i) => (
        <div key={e.id} className="flex gap-3 items-start" style={{ minHeight: 36 }}>
          <div className="flex flex-col items-center" style={{ width: 16, flexShrink: 0 }}>
            <div
              className="rounded-full"
              style={{
                width: 8, height: 8, marginTop: 4, flexShrink: 0,
                background: STEP_COLOR[e.name] ?? '#555',
                boxShadow: `0 0 6px ${STEP_COLOR[e.name] ?? '#555'}`,
              }}
            />
            {i < sorted.length - 1 && (
              <div style={{ width: 1, flex: 1, background: '#222', minHeight: 20 }} />
            )}
          </div>
          <div className="pb-3">
            <p className="text-xs font-medium" style={{ color: STEP_COLOR[e.name] ?? '#888' }}>{e.name}</p>
            <p className="text-xs" style={{ color: '#444' }}>{formatTime(e.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Journeys() {
  const { token } = useAuth();
  const [journeys, setJourneys] = useState<JourneyData[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [republishing, setRepublishing] = useState(false);
  const [republishResult, setRepublishResult] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    listJourneys(token).then(setJourneys).catch(err => setError(err.message));
  }, [token]);

  async function handleRepublish() {
    if (!token) return;
    setRepublishing(true);
    try {
      const { republished } = await republish(token);
      setRepublishResult(republished);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reativar jornadas');
    } finally {
      setRepublishing(false);
    }
  }

  function countFor(f: Filter): number {
    if (f === 'all') return journeys.length;
    if (f === 'stuck') return journeys.filter(computeStuck).length;
    return journeys.filter(j => j.status === f).length;
  }

  const visible = filter === 'all'
    ? journeys
    : filter === 'stuck'
      ? journeys.filter(computeStuck)
      : journeys.filter(j => j.status === filter);

  return (
    <div className="p-8">
      <div className="max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-white">Jornadas</h1>
          <Button variant="secondary" loading={republishing} onClick={handleRepublish}>
            Reativar travadas
          </Button>
        </div>

        {republishResult !== null && (
          <p className="text-xs mb-4" style={{ color: '#3ddc84' }}>
            {republishResult} jornada(s) reativada(s).
          </p>
        )}

        {error && <p className="text-sm mb-4" style={{ color: '#f87171' }}>{error}</p>}

        <div className="flex gap-1 mb-4 flex-wrap">
          {FILTERS.map(({ key, label }) => {
            const count = countFor(key);
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: active ? 'rgba(170,59,255,0.15)' : '#111',
                  color: active ? '#aa3bff' : '#555',
                  border: `1px solid ${active ? '#aa3bff' : '#1e1e1e'}`,
                  cursor: 'pointer',
                }}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          {visible.map(j => {
            const stuck = computeStuck(j);
            const isOpen = expanded === j.id;
            const badgeStyle = stuck
              ? STATUS_STYLE['stuck']
              : (STATUS_STYLE[j.status] ?? { background: 'rgba(170,59,255,0.1)', color: '#aa3bff' });

            return (
              <div
                key={j.id}
                className="px-4 py-3 rounded-lg"
                style={{
                  background: '#111',
                  border: `1px solid ${stuck ? 'rgba(220,61,61,0.3)' : isOpen ? '#333' : '#1e1e1e'}`,
                  cursor: 'pointer',
                }}
                onClick={() => setExpanded(isOpen ? null : j.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {stuck ? formatStuckDuration(j) : j.currentStep}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#555' }}>Student: {j.studentId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={badgeStyle}
                    >
                      {stuck ? 'travada' : j.status}
                    </span>
                    <span className="text-xs" style={{ color: '#333' }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>
                {isOpen && j.events.length > 0 && <Timeline events={j.events} />}
                {isOpen && j.events.length === 0 && (
                  <p className="text-xs mt-3" style={{ color: '#444' }}>Nenhum evento registrado.</p>
                )}
              </div>
            );
          })}

          {visible.length === 0 && !error && (
            <p className="text-sm py-12 text-center" style={{ color: '#444' }}>
              Nenhuma jornada encontrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
