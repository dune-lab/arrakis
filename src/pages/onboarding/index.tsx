import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMe, createStudent, startJourney, type Me } from '../../api/imperium';
import { Step1Welcome } from './Step1Welcome';
import { Step2Interest } from './Step2Interest';
import { Step3Launch } from './Step3Launch';

export function Onboarding() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [interest, setInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getMe(token).then((data) => {
      setMe(data);
      if (data.student && data.journey) {
        navigate('/dashboard', { replace: true });
      } else if (data.student && !data.journey) {
        setStep(3);
      }
    });
  }, [token, navigate]);

  async function handleLaunch() {
    if (!token || !me) return;
    setLoading(true);
    setError('');
    try {
      let studentId = me.student?.id;
      if (!studentId) {
        const student = await createStudent(me.user.name, me.user.email, token);
        studentId = student.id;
      }
      await startJourney(studentId, token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar jornada');
    } finally {
      setLoading(false);
    }
  }

  if (!me) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p className="text-sm" style={{ color: '#444' }}>Carregando…</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-full p-8">
      <div className="w-full max-w-md rounded-xl p-8" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        {step === 1 && (
          <Step1Welcome name={me.user.name} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <Step2Interest
            interest={interest}
            onSelect={setInterest}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3Launch
            interest={interest}
            loading={loading}
            error={error}
            onLaunch={handleLaunch}
          />
        )}
      </div>
    </div>
  );
}
