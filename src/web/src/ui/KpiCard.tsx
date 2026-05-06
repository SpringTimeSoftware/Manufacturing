interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function KpiCard({ hint, label, value }: KpiCardProps) {
  return (
    <article className="ui-kpi-card">
      <strong className="ui-kpi-card__value">{value}</strong>
      <span className="ui-kpi-card__label">{label}</span>
      {hint ? <span className="ui-kpi-card__hint">{hint}</span> : null}
    </article>
  );
}
