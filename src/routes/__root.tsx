import { createRootRoute, Outlet, Link, HeadContent, Scripts } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Icon } from '../components/Icon'
import appStyles from '../styles.css?url'
import wmsStyles from '../wms-styles.css?url'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 menit
      retry: 1,
    },
  },
})

const NAV = [
  { to: '/',         icon: 'dashboard', label: 'Dashboard' },
  { to: '/products', icon: 'package',   label: 'Produk' },
  { to: '/inbound',  icon: 'inbound',   label: 'Stok Masuk' },
  { to: '/outbound', icon: 'outbound',  label: 'Stok Keluar' },
  { to: '/opname',   icon: 'clipboard', label: 'Stock Opname' },
  { to: '/alerts',   icon: 'alert',     label: 'Alert Stok' },
  { to: '/reports',  icon: 'chart',     label: 'Laporan' },
  { to: '/users',    icon: 'users',     label: 'User & Role' },
]

function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div style={{ fontSize: 48, fontWeight: 700, fontFamily: 'var(--ff-mono)', color: 'var(--border)' }}>404</div>
      <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>Halaman tidak ditemukan</div>
      <Link to="/" className="btn btn-primary btn-sm">
        <Icon name="home" className="ico ico-sm" /> Kembali ke Dashboard
      </Link>
    </div>
  )
}

function Shell() {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Inventaris Gudang</title>
        <link rel="stylesheet" href={appStyles} />
        <link rel="stylesheet" href={wmsStyles} />
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <div className="app-shell">
            <aside className="sidebar">
              <div className="sidebar-brand">
                <div className="sidebar-brand-mark">IG</div>
                <div className="sidebar-brand-name">
                  <div className="sidebar-brand-title">Inventaris Gudang</div>
                  <div className="sidebar-brand-sub mono">WH-JKT-01</div>
                </div>
              </div>
              <nav className="sidebar-nav">
                {NAV.map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="sidebar-link"
                    activeProps={{ className: 'sidebar-link active' }}
                    activeOptions={{ exact: item.to === '/' }}
                  >
                    <Icon name={item.icon} className="ico ico-sm" />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="sidebar-footer">
                <div className="sidebar-user">
                  <div className="avatar">RA</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Rangga Adiputra</div>
                    <div className="xsmall muted">Admin Gudang</div>
                  </div>
                  <Link to="/login" className="icon-btn" title="Keluar">
                    <Icon name="logout" className="ico ico-sm" />
                  </Link>
                </div>
              </div>
            </aside>
            <main className="main-content">
              <Outlet />
            </main>
          </div>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}

export const Route = createRootRoute({
  component: Shell,
  notFoundComponent: NotFound,
})