import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { startJourney } from '../../api/imperium';
import { Button } from '../../components/ui/Button';

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
    <div className="flex items-center justify-center min-h-full p-8">
      <div className="w-full max-w-sm rounded-xl p-6" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <h1 className="text-base font-semibold text-white mb-2">Iniciar jornada</h1>
        <p className="text-sm mb-6" style={{ color: '#666' }}>
          Sua jornada de aprendizado personalizada começa agora. O sistema vai gerar um diagnóstico e currículo automaticamente.
        </p>
        {error && <p className="text-xs mb-4" style={{ color: '#f87171' }}>{error}</p>}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>Voltar</Button>
          <Button loading={loading} onClick={handleStart} className="flex-1">Começar</Button>
        </div>
      </div>
    </div>
  );
}
