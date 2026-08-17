const PRIORITY_STYLES = {
  Critical: { color: 'var(--color-critical)', bg: 'var(--color-critical-bg)' },
  High: { color: 'var(--color-high)', bg: 'var(--color-high-bg)' },
  Medium: { color: 'var(--color-medium)', bg: 'var(--color-medium-bg)' },
  Low: { color: 'var(--color-low)', bg: 'var(--color-low-bg)' },
}

const STATUS_STYLES = {
  Open: { color: 'var(--color-open)', bg: 'var(--color-open-bg)' },
  'In Progress': { color: 'var(--color-progress)', bg: 'var(--color-progress-bg)' },
  Resolved: { color: 'var(--color-resolved)', bg: 'var(--color-resolved-bg)' },
  Closed: { color: 'var(--color-closed)', bg: 'var(--color-closed-bg)' },
}

export function PriorityBadge({ value }) {
  const style = PRIORITY_STYLES[value] || PRIORITY_STYLES.Medium
  return (
    <span className="badge" style={{ color: style.color, background: style.bg }}>
      <span className="badge-dot" style={{ background: style.color }} />
      {value}
    </span>
  )
}

export function StatusBadge({ value }) {
  const style = STATUS_STYLES[value] || STATUS_STYLES.Open
  return (
    <span className="badge" style={{ color: style.color, background: style.bg }}>
      <span className="badge-dot" style={{ background: style.color }} />
      {value}
    </span>
  )
}
