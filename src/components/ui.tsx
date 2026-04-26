import { Icon } from './Icon';

// ─── Badge ─────────────────────────────────────────────────────────────────

interface BadgeProps {
  kind?: string;
  children: React.ReactNode;
}

export function Badge({ kind = "neutral", children }: BadgeProps) {
  return <span className={`badge badge-${kind}`}>{children}</span>;
}

// ─── PageHeader ─────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-text">
        <h1 className="page-title">{title}</h1>
        {subtitle && <div className="page-sub">{subtitle}</div>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}

// ─── Sparkline ──────────────────────────────────────────────────────────────

interface SparklineProps {
  values: number[];
  color?: string;
  stroke?: number;
  fill?: boolean;
}

export function Sparkline({ values, color = "var(--accent)", stroke = 1.5, fill = true }: SparklineProps) {
  const w = 100, h = 28;
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return [x, y];
  });
  const d = "M " + pts.map((p) => p.join(",")).join(" L ");
  const area = d + ` L ${w},${h} L 0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      {fill && <path d={area} fill={color} opacity="0.1" />}
      <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ─── BarChart ───────────────────────────────────────────────────────────────

interface BarChartDataPoint {
  label: string;
  in: number;
  out: number;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  color?: string;
}

export function BarChart({ data, color = "var(--accent)" }: BarChartProps) {
  const w = 600, h = 180;
  const max = Math.max(...data.map(d => Math.max(d.in, d.out)));
  const barW = w / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1="0" x2={w} y1={h * t} y2={h * t} stroke="var(--border)" strokeDasharray={t === 1 ? "0" : "2 3"} />
      ))}
      {data.map((d, i) => {
        const hin = (d.in / max) * (h - 20);
        const hout = (d.out / max) * (h - 20);
        const cx = i * barW + barW / 2;
        return (
          <g key={i}>
            <rect x={cx - 10} y={h - hin - 16} width="8" height={hin} fill={color} rx="1" />
            <rect x={cx + 2} y={h - hout - 16} width="8" height={hout} fill="var(--text-3)" opacity="0.4" rx="1" />
            <text x={cx} y={h - 4} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="var(--ff-mono)">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── statusBadge helper ─────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { kind: string; label: string }> = {
  diterima:   { kind: "ok",      label: "DITERIMA" },
  parsial:    { kind: "warn",    label: "PARSIAL" },
  ditinjau:   { kind: "info",    label: "DITINJAU" },
  ditolak:    { kind: "danger",  label: "DITOLAK" },
  dikirim:    { kind: "ok",      label: "DIKIRIM" },
  picking:    { kind: "info",    label: "PICKING" },
  menunggu:   { kind: "warn",    label: "MENUNGGU" },
  dibatalkan: { kind: "danger",  label: "DIBATALKAN" },
};

export function StatusBadge({ status }: { status: string }) {
  const v = STATUS_MAP[status] ?? { kind: "neutral", label: status.toUpperCase() };
  return <Badge kind={v.kind}>{v.label}</Badge>;
}

// ─── LineChart (for Reports) ─────────────────────────────────────────────────

interface Series {
  color: string;
  values: number[];
}

export function LineChart({ series }: { series: Series[] }) {
  const w = 600, h = 200;
  const n = series[0].values.length;
  const max = Math.max(...series.flatMap(s => s.values));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <line key={t} x1="0" x2={w} y1={h * t} y2={h * t} stroke="var(--border)" strokeDasharray={t === 1 ? "0" : "2 3"} />
      ))}
      {series.map((s, si) => {
        const pts = s.values.map((v, i) => [(i / (n - 1)) * w, h - (v / max) * (h - 20) - 10] as [number, number]);
        const d = "M " + pts.map(p => p.join(",")).join(" L ");
        return (
          <g key={si}>
            <path d={d} fill="none" stroke={s.color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="var(--surface)" stroke={s.color} strokeWidth="1.5" />)}
          </g>
        );
      })}
    </svg>
  );
}

// ─── DonutChart (for Reports) ────────────────────────────────────────────────

interface DonutSlice {
  v: number;
  c: string;
}

export function DonutChart({ data }: { data: DonutSlice[] }) {
  const total = data.reduce((a, d) => a + d.v, 0);
  let acc = 0;
  const r = 56, cx = 70, cy = 70;
  const fmtNum = (n: number) => n.toLocaleString("id-ID");
  return (
    <svg viewBox="0 0 140 140" width="140" height="140">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-3)" strokeWidth="16" />
      {data.map((d, i) => {
        const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
        acc += d.v;
        const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
        const large = end - start > Math.PI ? 1 : 0;
        const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
        const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
        return (
          <path key={i}
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
            fill="none" stroke={d.c} strokeWidth="16" strokeLinecap="butt" />
        );
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="18" fontWeight="600" fill="var(--text)" fontFamily="var(--ff-mono)">{fmtNum(total)}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="var(--text-3)">SKU</text>
    </svg>
  );
}
