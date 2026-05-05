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

export function Journeys() {
  const { token } = useAuth();
  const [journeys, setJourneys] = useState<JourneyData[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
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
            const badgeStyle = stuck
              ? STATUS_STYLE['stuck']
              : (STATUS_STYLE[j.status] ?? { background: 'rgba(170,59,255,0.1)', color: '#aa3bff' });

            return (
              <div
                key={j.id}
                className="flex justify-between items-center px-4 py-3 rounded-lg"
                style={{
                  background: '#111',
                  border: `1px solid ${stuck ? 'rgba(220,61,61,0.3)' : '#1e1e1e'}`,
                }}
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {stuck ? formatStuckDuration(j) : j.currentStep}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#555' }}>Student: {j.studentId}</p>
                </div>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={badgeStyle}
                >
                  {stuck ? 'travada' : j.status}
                </span>
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
