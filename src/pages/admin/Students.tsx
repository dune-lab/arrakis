import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { listStudents, listJourneys, type StudentData, type JourneyData } from '../../api/imperium';

type ActivityStatus =
  | { kind: 'active' }
  | { kind: 'stuck'; daysSince: number }
  | { kind: 'completed' }
  | { kind: 'none' };

function deriveStudentActivity(studentId: string, journeys: JourneyData[]): ActivityStatus {
  const studentJourneys = journeys.filter(j => j.studentId === studentId);
  if (studentJourneys.length === 0) return { kind: 'none' };

  const active = studentJourneys.find(j => j.status === 'active');
  if (active) {
    if (active.events.length === 0) return { kind: 'active' };
    const lastEventAt = Math.max(...active.events.map(e => new Date(e.createdAt).getTime()));
    const daysSince = Math.floor((Date.now() - lastEventAt) / (1000 * 60 * 60 * 24));
    if (daysSince >= 1) return { kind: 'stuck', daysSince };
    return { kind: 'active' };
  }

  const completed = studentJourneys.find(j => j.status === 'completed');
  if (completed) return { kind: 'completed' };

  return { kind: 'none' };
}

function ActivityBadge({ activity }: { activity: ActivityStatus }) {
  if (activity.kind === 'active') {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(61,220,132,0.1)', color: '#3ddc84' }}>
        ● ativa
      </span>
    );
  }
  if (activity.kind === 'stuck') {
    const color = activity.daysSince >= 3 ? '#f87171' : '#fbbf24';
    const bg = activity.daysSince >= 3 ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)';
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ background: bg, color }}>
        ⚠ {activity.daysSince}d parado
      </span>
    );
  }
  if (activity.kind === 'completed') {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(100,100,100,0.1)', color: '#666' }}>
        ✓ concluída
      </span>
    );
  }
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(170,59,255,0.1)', color: '#aa3bff' }}>
      sem jornada
    </span>
  );
}

export function Students() {
  const { token } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [journeys, setJourneys] = useState<JourneyData[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    Promise.all([listStudents(token), listJourneys(token)])
      .then(([s, j]) => { setStudents(s); setJourneys(j); })
      .catch(err => setError(err.message));
  }, [token]);

  return (
    <div className="p-8">
      <div className="max-w-3xl">
        <h1 className="text-xl font-semibold text-white mb-6">Alunos</h1>

        {error && <p className="text-sm mb-4" style={{ color: '#f87171' }}>{error}</p>}

        <div className="flex flex-col gap-2">
          {students.map(s => (
            <div
              key={s.id}
              className="flex justify-between items-center px-4 py-3 rounded-lg"
              style={{ background: '#111', border: '1px solid #1e1e1e' }}
            >
              <div>
                <p className="text-sm font-medium text-white">{s.name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#555' }}>{s.email}</p>
              </div>
              <ActivityBadge activity={deriveStudentActivity(s.id, journeys)} />
            </div>
          ))}

          {students.length === 0 && !error && (
            <p className="text-sm py-12 text-center" style={{ color: '#444' }}>
              Nenhum aluno cadastrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
