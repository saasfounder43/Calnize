import Link from 'next/link';

interface ViralFooterProps {
  whiteLabel: boolean;
}

export default function ViralFooter({ whiteLabel }: ViralFooterProps) {
  if (whiteLabel) return null;

  return (
    <div style={{
      textAlign: 'center',
      padding: '24px 16px 16px',
      marginTop: '40px',
    }}>
      <Link
        href="https://calnize.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'color 0.2s ease',
        }}
      >
        Like this experience?{' '}
        <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
          Get Calnize →
        </span>
      </Link>
    </div>
  );
}
