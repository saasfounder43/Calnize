'use client';

interface WhiteLabelToggleProps {
  enabled: boolean;
  planType: string;
  onChange: (value: boolean) => void;
  onUpgradeClick: () => void;
}

export default function WhiteLabelToggle({
  enabled,
  planType,
  onChange,
  onUpgradeClick,
}: WhiteLabelToggleProps) {
  const isPro = planType === 'pro' || planType === 'paid';

  const handleToggle = () => {
    if (!isPro) {
      onUpgradeClick();
      return;
    }
    onChange(!enabled);
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
        White Label
        {!isPro && (
          <span style={{
            marginLeft: '8px', fontSize: '10px', fontWeight: 600,
            padding: '2px 8px', borderRadius: '999px',
            background: 'rgba(108, 92, 231, 0.15)',
            color: 'var(--color-accent)', letterSpacing: '0.05em',
          }}>
            PRO
          </span>
        )}
      </label>
      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
        Remove all Calnize branding from your booking pages, including the "Powered by Calnize" and "Scheduling powered by Calnize" footers.
      </p>

      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          background: isPro ? 'var(--color-bg-secondary)' : 'rgba(108, 92, 231, 0.04)',
          cursor: isPro ? 'pointer' : 'default',
        }}
        onClick={handleToggle}
      >
        <div>
          <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>
            Remove Calnize branding
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {isPro
              ? enabled
                ? 'Calnize branding is hidden on your booking pages'
                : 'Calnize branding is visible on your booking pages'
              : 'Upgrade to Pro to enable white labelling'}
          </p>
        </div>

        {/* Toggle */}
        <div
          style={{
            width: '44px', height: '24px', borderRadius: '999px',
            background: isPro && enabled ? 'var(--color-accent)' : 'var(--color-border)',
            position: 'relative', flexShrink: 0,
            transition: 'background 0.2s ease',
            opacity: isPro ? 1 : 0.5,
          }}
        >
          <div
            style={{
              position: 'absolute', top: '3px',
              left: isPro && enabled ? '23px' : '3px',
              width: '18px', height: '18px',
              borderRadius: '50%', background: 'white',
              transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      </div>

      {!isPro && (
        <button
          type="button"
          onClick={onUpgradeClick}
          style={{
            marginTop: '10px', fontSize: '12px',
            color: 'var(--color-accent)', background: 'none',
            border: 'none', cursor: 'pointer', padding: 0,
            textDecoration: 'underline',
          }}
        >
          Upgrade to Pro to unlock white labelling →
        </button>
      )}
    </div>
  );
}
