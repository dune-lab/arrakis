import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { listStudents, type StudentData } from '../../api/imperium';

export function Students() {
  const { token } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    listStudents(token).then(setStudents).catch(err => setError(err.message));
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
              <span className="text-xs" style={{ color: '#444' }}>
                {new Date(s.createdAt).toLocaleDateString('pt-BR')}
              </span>
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
