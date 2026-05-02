import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
};

const VARIANTS = {
  primary:   { background: '#aa3bff', color: '#fff',     border: 'none' },
  secondary: { background: '#1a1a1a', color: '#e2e2e2',  border: '1px solid #252525' },
  danger:    { background: '#7f1d1d', color: '#fca5a5',  border: '1px solid #991b1b' },
};

const HOVER = {
  primary:   '#9930e8',
  secondary: '#222',
  danger:    '#991b1b',
};

export function Button({ variant = 'primary', loading, children, className = '', disabled, style, ...props }: Props) {
  const v = VARIANTS[variant];

  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      disabled={disabled ?? loading}
      style={{ ...v, cursor: 'pointer', ...style }}
      onMouseEnter={e => {
        if (!disabled && !loading) (e.currentTarget as HTMLElement).style.background = HOVER[variant];
      }}
      onMouseLeave={e => {
        if (!disabled && !loading) (e.currentTarget as HTMLElement).style.background = v.background;
      }}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="2" strokeDasharray="20 10" />
          </svg>
          Carregando…
        </span>
      ) : children}
    </button>
  );
}
