'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import LogoUpload from '@/components/branding/logo-upload';
import WhiteLabelToggle from '@/components/branding/white-label-toggle';

export default function BrandingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [userId, setUserId] = useState('');
  const [planType, setPlanType] = useState('free');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [whiteLabel, setWhiteLabel] = useState(false);
  const [brandingId, setBrandingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: userData } = await supabase
        .from('users')
        .select('plan_type')
        .eq('id', user.id)
        .single();

      if (userData) setPlanType(userData.plan_type ?? 'free');

      const { data: branding } = await supabase
        .from('branding_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (branding) {
        setBrandingId(branding.id);
        setLogoUrl(branding.logo_url ?? null);
        setWhiteLabel(branding.white_label ?? false);
      }
    } catch (err) {
      console.error('Error loading branding:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isPro = planType === 'pro' || planType === 'paid';

      const payload = {
        user_id: user.id,
        logo_url: logoUrl || null,
        white_label: isPro ? whiteLabel : false,
      };

      if (brandingId) {
        await supabase.from('branding_settings').update(payload).eq('id', brandingId);
      } else {
        const { data } = await supabase.from('branding_settings').insert(payload).select('id').single();
        if (data) setBrandingId(data.id);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = () => {
    const url = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL;
    if (!url) { alert('Upgrade link not configured.'); return; }
    window.location.href = url;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Loader2 size={32} className="animate-spin" color="var(--color-accent)" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>Branding</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Customise how your booking pages look to clients.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '24px' }}>{error}</div>
      )}

      <div className="glass-card" style={{ padding: '32px', cursor: 'default', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Logo Upload */}
        <LogoUpload
          currentLogoUrl={logoUrl}
          userId={userId}
          onUpload={(url) => setLogoUrl(url || null)}
        />

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

        {/* White Label Toggle */}
        <WhiteLabelToggle
          enabled={whiteLabel}
          planType={planType}
          onChange={setWhiteLabel}
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '400px', width: '100%', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Pro feature</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
              White labelling requires a Pro plan. Upgrade to remove all Calnize branding from your booking pages.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleUpgrade} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Upgrade to Pro — $9/month
              </button>
              <button onClick={() => setShowUpgradeModal(false)} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
