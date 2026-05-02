import type { ReactNode } from 'react';

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className = '' }: Props) {
  return (
    <div
      className={`rounded-xl p-6 ${className}`}
      style={{ background: '#111', border: '1px solid #1e1e1e' }}
    >
      {title && (
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#e2e2e2' }}>{title}</h2>
      )}
      {children}
    </div>
  );
}
