import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { listJourneys, republish, type JourneyData } from '../../api/imperium';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Jornadas</h1>
          <Button variant="secondary" loading={republishing} onClick={handleRepublish}>
            Reativar travadas
          </Button>
        </div>
        {republishResult !== null && (
          <p className="text-sm text-green-600 mb-4">{republishResult} jornada(s) reativada(s).</p>
        )}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex flex-col gap-3">
          {journeys.map(j => (
            <Card key={j.id}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{j.currentStep}</p>
                  <p className="text-xs text-gray-500">Student: {j.studentId}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  j.status === 'completed' ? 'bg-green-100 text-green-700' :
                  j.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  {j.status}
                </span>
              </div>
            </Card>
          ))}
          {journeys.length === 0 && !error && (
            <p className="text-gray-400 text-center py-8">Nenhuma jornada encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
