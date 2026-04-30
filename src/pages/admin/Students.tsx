import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { listStudents, type StudentData } from '../../api/imperium';
import { Card } from '../../components/ui/Card';

export function Students() {
  const { token } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    listStudents(token).then(setStudents).catch(err => setError(err.message));
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Alunos</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex flex-col gap-3">
          {students.map(s => (
            <Card key={s.id}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <p className="text-sm text-gray-500">{s.email}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </Card>
          ))}
          {students.length === 0 && !error && (
            <p className="text-gray-400 text-center py-8">Nenhum aluno cadastrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
