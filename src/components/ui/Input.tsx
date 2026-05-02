import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: '#666' }}>{label}</label>
      <input
        className={`rounded-lg px-3 py-2 text-sm outline-none transition-colors ${className}`}
        style={{
          background: '#0a0a0a',
          border: `1px solid ${error ? '#7f1d1d' : '#252525'}`,
          color: '#e2e2e2',
        }}
        onFocus={e => {
          (e.currentTarget as HTMLElement).style.borderColor = error ? '#ef4444' : '#aa3bff';
          (e.currentTarget as HTMLElement).style.boxShadow = error
            ? '0 0 0 3px rgba(239,68,68,0.1)'
            : '0 0 0 3px rgba(170,59,255,0.12)';
        }}
        onBlur={e => {
          (e.currentTarget as HTMLElement).style.borderColor = error ? '#7f1d1d' : '#252525';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && <span className="text-xs" style={{ color: '#f87171' }}>{error}</span>}
    </div>
  );
}
