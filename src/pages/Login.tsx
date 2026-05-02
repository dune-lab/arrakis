import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/imperium';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Login() {
  const { login: saveToken } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await login(email, password);
      saveToken(token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
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
        <h1 className="text-base font-semibold text-white mb-5">Entrar na conta</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
          <Button type="submit" loading={loading} className="w-full mt-1">Entrar</Button>
        </form>
      </div>

      <p className="text-xs mt-5" style={{ color: '#444' }}>
        Não tem conta?{' '}
        <Link to="/register" className="transition-colors" style={{ color: '#aa3bff' }}>
          Criar conta
        </Link>
      </p>
    </div>
  );
}
