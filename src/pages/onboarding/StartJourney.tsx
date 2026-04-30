import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { startJourney } from '../../api/imperium';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function StartJourney() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const studentId = (location.state as { studentId?: string } | null)?.studentId ?? '';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!token || !studentId) return;
    setError('');
    setLoading(true);
    try {
      await startJourney(studentId, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar jornada');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Iniciar jornada</h1>
        <p className="text-sm text-gray-500 mb-6">
          Sua jornada de aprendizado personalizada começa agora. O sistema irá gerar um diagnóstico e currículo automaticamente.
        </p>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>Voltar</Button>
          <Button loading={loading} onClick={handleStart} className="flex-1">Começar</Button>
        </div>
      </Card>
    </div>
  );
}
