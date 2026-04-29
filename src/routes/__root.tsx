import { createRootRoute, Outlet, Link, HeadContent, Scripts } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Icon } from '../components/Icon'
import appStyles from '../styles.css?url'
import wmsStyles from '../wms-styles.css?url'
import { useEffect, useState } from 'react'
import { useRouter } from '@tanstack/react-router'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60, retry: 1 } },
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

function Shell() {
  const router   = useRouter()
  const pathname = router.state.location.pathname

  // Selalu mulai dengan null — baca sessionStorage di client via useEffect
  const [user, setUser] = useState<{ nama_lengkap: string; role: string } | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('auth_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setChecked(true)
  }, [pathname])

  // Belum selesai cek — render shell kosong (tidak blank, hanya tunggu)
  if (!checked) {
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
          <Scripts />
        </body>
      </html>
    )
  }

  // Belum login, bukan di /login → redirect
  if (!user && pathname !== '/login') {
    window.location.href = '/login'
    return null
  }

  // Halaman login → tanpa sidebar
  if (pathname === '/login') {
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
            <Outlet />
          </QueryClientProvider>
          <Scripts />
        </body>
      </html>
    )
  }

  const initials = user!.nama_lengkap
    ?.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() ?? 'U'

  function handleLogout() {
    sessionStorage.removeItem('auth_user')
    window.location.href = '/login'
  }

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
                  <div className="avatar">{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user!.nama_lengkap}
                    </div>
                    <div className="xsmall muted">{user!.role}</div>
                  </div>
                  <button className="icon-btn" title="Keluar" onClick={handleLogout}>
                    <Icon name="logout" className="ico ico-sm" />
                  </button>
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
  notFoundComponent: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div style={{ fontSize: 48, fontWeight: 700, fontFamily: 'var(--ff-mono)', color: 'var(--border)' }}>404</div>
      <div style={{ fontSize: 16, fontWeight: 500 }}>Halaman tidak ditemukan</div>
      <Link to="/" className="btn btn-primary btn-sm">Kembali ke Dashboard</Link>
    </div>
  ),
})