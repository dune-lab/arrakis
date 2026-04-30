import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe, type Me } from '../api/imperium';
import { JourneyProgress } from '../components/JourneyProgress';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function Dashboard() {
  const { token, logout } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getMe(token).then(setMe).catch(err => setError(err.message));
  }, [token]);

  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!me) return <div className="p-8 text-gray-400">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Olá, {me.user.name}</h1>
          <Button variant="secondary" onClick={logout}>Sair</Button>
        </div>

        <Card title="Meu perfil">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">E-mail</dt>
            <dd className="text-gray-900">{me.user.email}</dd>
            <dt className="text-gray-500">Perfil</dt>
            <dd className="text-gray-900">{me.user.role}</dd>
            <dt className="text-gray-500">E-mail verificado</dt>
            <dd className="text-gray-900">{me.user.emailVerified ? 'Sim' : 'Não'}</dd>
          </dl>
        </Card>

        {!me.student && (
          <Card className="border-indigo-200 bg-indigo-50">
            <p className="text-sm text-indigo-700 mb-3">Complete seu perfil de aluno para começar a jornada.</p>
            <Link to="/onboarding/student">
              <Button>Criar perfil de aluno</Button>
            </Link>
          </Card>
        )}

        {me.student && !me.journey && (
          <Card className="border-indigo-200 bg-indigo-50">
            <p className="text-sm text-indigo-700 mb-3">Inicie sua jornada de aprendizado.</p>
            <Link to="/onboarding/journey" state={{ studentId: me.student.id }}>
              <Button>Iniciar jornada</Button>
            </Link>
          </Card>
        )}

        {me.student && me.journey && (
          <Card title="Jornada de aprendizado">
            <JourneyProgress currentStep={me.journey.currentStep} status={me.journey.status} />
          </Card>
        )}
      </div>
    </div>
  );
}
