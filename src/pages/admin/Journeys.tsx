import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { listJourneys, republish, type JourneyData } from '../../api/imperium';
import { Button } from '../../components/ui/Button';

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  completed: { background: 'rgba(61,220,132,0.1)',  color: '#3ddc84' },
  failed:    { background: 'rgba(220,61,61,0.1)',   color: '#dc3d3d' },
};

export function Journeys() {
  const { token } = useAuth();
  const [journeys, setJourneys] = useState<JourneyData[]>([]);
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

        <div className="flex flex-col gap-2">
          {journeys.map(j => {
            const badgeStyle = STATUS_STYLE[j.status] ?? { background: 'rgba(170,59,255,0.1)', color: '#aa3bff' };
            return (
              <div
                key={j.id}
                className="flex justify-between items-center px-4 py-3 rounded-lg"
                style={{ background: '#111', border: '1px solid #1e1e1e' }}
              >
                <div>
                  <p className="text-sm font-medium text-white">{j.currentStep}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#555' }}>Student: {j.studentId}</p>
                </div>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={badgeStyle}
                >
                  {j.status}
                </span>
              </div>
            );
          })}

          {journeys.length === 0 && !error && (
            <p className="text-sm py-12 text-center" style={{ color: '#444' }}>
              Nenhuma jornada encontrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
