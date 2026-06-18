import CaseHeader from "./components/CaseHeader";
import AuditForm from "./components/AuditForm";
import LedgerPanel from "./components/LedgerPanel";
import { useAuditState } from "./hooks/useAuditState";

export default function App() {
  const { data, loading, error, refetch } = useAuditState();

  return (
    <div className="min-h-screen">
      <CaseHeader />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-primary">
            AI Upgrade Safety Checker
          </h1>
          <p className="mt-2 font-mono text-sm text-ink-muted">
            One verdict per deployment. Validators reach consensus or the
            transaction doesn't settle — there is no in-between.
          </p>
        </div>

        <div className="space-y-6">
          <AuditForm onSettled={refetch} alreadyAudited={data.has_audited} />
          <LedgerPanel
            data={data}
            loading={loading}
            error={error}
            onRefresh={refetch}
          />
        </div>

        <footer className="mt-10 text-center font-mono text-[11px] text-ink-faint">
          Reads <code>get_audit_result()</code> from GenLayer studionet via
          the genlayer-js SDK.
        </footer>
      </main>
    </div>
  );
}
