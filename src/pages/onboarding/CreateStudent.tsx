import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createStudent } from '../../api/imperium';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function CreateStudent() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError('');
    setLoading(true);
    try {
      await createStudent(name, email, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar perfil');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-full p-8">
      <div className="w-full max-w-sm rounded-xl p-6" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <h1 className="text-base font-semibold text-white mb-5">Perfil de aluno</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Nome" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
          <div className="flex gap-2 mt-1">
            <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>Voltar</Button>
            <Button type="submit" loading={loading} className="flex-1">Criar perfil</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
