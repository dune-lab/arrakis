import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/imperium';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background: 'radial-gradient(ellipse at 65% -10%, rgba(170,59,255,0.14) 0%, transparent 55%), #080808',
      }}
    >
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold text-white tracking-tight">dune-lab</p>
        <p className="text-xs mt-0.5" style={{ color: '#444' }}>plataforma de aprendizado</p>
      </div>

      <div className="w-full max-w-sm rounded-xl p-6" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
        <h1 className="text-base font-semibold text-white mb-5">Criar conta</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Nome" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: '#666' }}>Perfil</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as 'student' | 'admin')}
              className="rounded-lg px-3 py-2 text-sm outline-none transition-colors"
              style={{ background: '#0a0a0a', border: '1px solid #252525', color: '#e2e2e2' }}
            >
              <option value="student">Aluno</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
          <Button type="submit" loading={loading} className="w-full mt-1">Criar conta</Button>
        </form>
      </div>

      <p className="text-xs mt-5" style={{ color: '#444' }}>
        Já tem conta?{' '}
        <Link to="/login" style={{ color: '#aa3bff' }}>Entrar</Link>
      </p>
    </div>
  );
}
