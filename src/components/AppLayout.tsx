/* Authenticated app shell — sidebar + content outlet. */
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GRID_ICON = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
    <rect x="1" y="1" width="5.5" height="5.5" rx="1" />
    <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" />
    <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" />
    <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" />
  </svg>
);

const PERSON_ICON = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
    <circle cx="7.5" cy="4.5" r="2.5" />
    <path d="M1.5 14c0-3.314 2.686-6 6-6s6 2.686 6 6" />
  </svg>
);

const JOURNEY_ICON = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="1,11 4,6 8,10 11,5 14,8" />
  </svg>
);

const DLQ_ICON = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="1" y="1" width="13" height="13" rx="2" />
    <path d="M5 5l5 5M10 5l-5 5" />
  </svg>
);

const NAV_ITEMS = [
  { to: '/dashboard',       label: 'Dashboard', icon: GRID_ICON,    adminOnly: false },
  { to: '/admin/students',  label: 'Alunos',    icon: PERSON_ICON,  adminOnly: true  },
  { to: '/admin/journeys',  label: 'Jornadas',  icon: JOURNEY_ICON, adminOnly: true  },
  { to: '/admin/dlq',      label: 'DLQ',       icon: DLQ_ICON,    adminOnly: true  },
];

export function AppLayout() {
  const { role, logout } = useAuth();
  const items = NAV_ITEMS.filter(n => !n.adminOnly || role === 'admin');

  return (
    <div className="flex min-h-screen">
      <aside
        className="flex flex-col shrink-0"
        style={{ width: 220, background: '#0d0d0d', borderRight: '1px solid #1a1a1a' }}
      >
        <div className="px-5 py-5" style={{ borderBottom: '1px solid #1a1a1a' }}>
          <span className="font-semibold text-white text-sm tracking-tight">dune-lab</span>
          <span className="text-xs ml-2" style={{ color: '#444' }}>arrakis</span>
        </div>

        <nav className="flex-1 p-2 flex flex-col gap-0.5">
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              style={({ isActive }) => ({
                background: isActive ? '#1a1a1a' : 'transparent',
                color: isActive ? '#e2e2e2' : '#555',
                boxShadow: isActive ? 'inset 2px 0 0 #aa3bff' : 'none',
              })}
              onMouseEnter={e => {
                if (!(e.currentTarget as HTMLElement).style.boxShadow.includes('aa3bff')) {
                  (e.currentTarget as HTMLElement).style.color = '#999';
                }
              }}
              onMouseLeave={e => {
                if (!(e.currentTarget as HTMLElement).style.boxShadow.includes('aa3bff')) {
                  (e.currentTarget as HTMLElement).style.color = '#555';
                }
              }}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid #1a1a1a' }}>
          <button
            onClick={logout}
            className="text-xs w-full text-left px-3 py-2 rounded-md transition-colors"
            style={{ color: '#444', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#e2e2e2')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#444')}
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
