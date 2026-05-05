import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  listDlq,
  reprocessDlqOne,
  reprocessDlqAllByTopic,
  dismissDlq,
  type DlqMessage,
} from '../../api/imperium';
import { Button } from '../../components/ui/Button';

type Filter = 'all' | 'pending' | 'reprocessed' | 'dismissed';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',          label: 'Todas' },
  { key: 'pending',      label: 'Pendentes' },
  { key: 'reprocessed',  label: 'Reprocessadas' },
  { key: 'dismissed',    label: 'Descartadas' },
];

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  pending:     { background: 'rgba(248,113,113,0.1)', color: '#f87171' },
  reprocessed: { background: 'rgba(61,220,132,0.1)',  color: '#3ddc84' },
  dismissed:   { background: 'rgba(85,85,85,0.1)',    color: '#555' },
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

function TopicBadge({ topic }: { topic: string }) {
  const short = topic.split('.').pop() ?? topic;
  return (
    <span
      className="text-xs px-2 py-0.5 rounded font-mono"
      style={{ background: '#1a1a1a', color: '#888', border: '1px solid #222' }}
    >
      {short}
    </span>
  );
}

export function Dlq() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<DlqMessage[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editedPayloads, setEditedPayloads] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    listDlq(token).then(setMessages).catch(err => setError(err.message));
  }, [token]);

  const visible = filter === 'all'
    ? messages
    : messages.filter(m => m.status === filter);

  function countFor(f: Filter) {
    if (f === 'all') return messages.length;
    return messages.filter(m => m.status === f).length;
  }

  function getPayload(msg: DlqMessage): string {
    if (editedPayloads[msg.id] !== undefined) return editedPayloads[msg.id];
    try {
      return JSON.stringify(JSON.parse(msg.payload), null, 2);
    } catch {
      return msg.payload;
    }
  }

  async function handleReprocessOne(msg: DlqMessage) {
    if (!token) return;
    setLoading(l => ({ ...l, [msg.id]: true }));
    setError('');
    try {
      const payload = editedPayloads[msg.id] ?? msg.payload;
      await reprocessDlqOne(msg.id, payload, token);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'reprocessed' } : m));
      setExpanded(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reprocessar');
    } finally {
      setLoading(l => ({ ...l, [msg.id]: false }));
    }
  }

  async function handleDismiss(msg: DlqMessage) {
    if (!token) return;
    setLoading(l => ({ ...l, [`dismiss-${msg.id}`]: true }));
    setError('');
    try {
      await dismissDlq(msg.id, token);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'dismissed' } : m));
      setExpanded(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao descartar');
    } finally {
      setLoading(l => ({ ...l, [`dismiss-${msg.id}`]: false }));
    }
  }

  async function handleReprocessAllByTopic(topic: string) {
    if (!token) return;
    setLoading(l => ({ ...l, [`all-${topic}`]: true }));
    setError('');
    try {
      const { reprocessed } = await reprocessDlqAllByTopic(topic, token);
      setMessages(prev =>
        prev.map(m =>
          m.originalTopic === topic && m.status === 'pending'
            ? { ...m, status: 'reprocessed' }
            : m,
        ),
      );
      setError(`${reprocessed} mensagem(ns) reprocessada(s) do tópico ${topic}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reprocessar tópico');
    } finally {
      setLoading(l => ({ ...l, [`all-${topic}`]: false }));
    }
  }

  const topics = [...new Set(messages.filter(m => m.status === 'pending').map(m => m.originalTopic))];

  return (
    <div className="p-8">
      <div className="max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white">Harkonnen DLQ</h1>
            <p className="text-xs mt-0.5" style={{ color: '#444' }}>Mensagens Kafka que falharam após 3 tentativas</p>
          </div>
          {topics.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-end">
              {topics.map(topic => (
                <Button
                  key={topic}
                  variant="secondary"
                  loading={!!loading[`all-${topic}`]}
                  onClick={() => handleReprocessAllByTopic(topic)}
                >
                  Reprocessar tudo: {topic.split('.').pop()}
                </Button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p
            className="text-xs mb-4"
            style={{ color: error.includes('reprocessada') ? '#3ddc84' : '#f87171' }}
          >
            {error}
          </p>
        )}

        <div className="flex gap-1 mb-4 flex-wrap">
          {FILTERS.map(({ key, label }) => {
            const count = countFor(key);
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: active ? 'rgba(170,59,255,0.15)' : '#111',
                  color: active ? '#aa3bff' : '#555',
                  border: `1px solid ${active ? '#aa3bff' : '#1e1e1e'}`,
                  cursor: 'pointer',
                }}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          {visible.map(msg => {
            const isOpen = expanded === msg.id;
            const badgeStyle = STATUS_STYLE[msg.status] ?? STATUS_STYLE['pending'];
            const isPending = msg.status === 'pending';

            return (
              <div
                key={msg.id}
                className="rounded-lg"
                style={{
                  background: '#111',
                  border: `1px solid ${isOpen ? '#333' : '#1e1e1e'}`,
                }}
              >
                <div
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : msg.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-white">{msg.name}</p>
                        <TopicBadge topic={msg.originalTopic} />
                      </div>
                      <p className="text-xs mt-1 truncate" style={{ color: '#f87171' }}>{msg.error}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#444' }}>
                        Falhou em {formatTime(msg.failedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={badgeStyle}>
                        {msg.status}
                      </span>
                      <span className="text-xs" style={{ color: '#333' }}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div
                    className="px-4 pb-4"
                    style={{ borderTop: '1px solid #1a1a1a' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <p className="text-xs mt-3 mb-1.5 font-medium" style={{ color: '#666' }}>Payload</p>
                    <textarea
                      className="w-full font-mono text-xs rounded-md p-3 resize-y"
                      rows={8}
                      style={{
                        background: '#0d0d0d',
                        border: '1px solid #222',
                        color: '#c4c4c4',
                        outline: 'none',
                      }}
                      value={getPayload(msg)}
                      onChange={e => setEditedPayloads(prev => ({ ...prev, [msg.id]: e.target.value }))}
                      readOnly={!isPending}
                    />
                    {isPending && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="primary"
                          loading={!!loading[msg.id]}
                          onClick={() => handleReprocessOne(msg)}
                        >
                          Reprocessar
                        </Button>
                        <Button
                          variant="secondary"
                          loading={!!loading[`dismiss-${msg.id}`]}
                          onClick={() => handleDismiss(msg)}
                        >
                          Descartar
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {visible.length === 0 && !error && (
            <p className="text-sm py-12 text-center" style={{ color: '#444' }}>
              Nenhuma mensagem encontrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
