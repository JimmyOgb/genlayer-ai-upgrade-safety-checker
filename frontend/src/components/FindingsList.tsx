interface FindingsListProps {
  findings: string[];
}

export default function FindingsList({ findings }: FindingsListProps) {
  return (
    <div>
      <p className="eyebrow mb-2">Automated analysis highlights</p>
      {findings.length === 0 ? (
        <p className="font-mono text-sm text-ink-muted">
          No audit recorded yet. Submit two IPFS CIDs to invoke the GenLayer
          Intelligent Predictor.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {findings.map((finding, i) => (
            <li
              key={i}
              className="flex gap-2 font-mono text-sm text-ink-primary"
            >
              <span className="text-ink-faint">–</span>
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
