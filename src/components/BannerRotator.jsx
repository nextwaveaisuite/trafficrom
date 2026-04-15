import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Rotates approved banners — shown on dashboard, inbox, etc.
const BannerRotator = ({ size = 'leaderboard', className = '' }) => {
  const [banner, setBanner] = useState(null);
  const [idx, setIdx] = useState(0);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    supabase
      .from('banner_ads')
      .select('id, image_url, destination_url, title')
      .eq('status', 'approved')
      .gt('impressions_remaining', 0)
      .limit(10)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setBanners(data);
          setBanner(data[0]);
          // Track impression
          trackImpression(data[0].id);
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Rotate every 8 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setIdx(prev => {
        const next = (prev + 1) % banners.length;
        setBanner(banners[next]);
        trackImpression(banners[next].id);
        return next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [banners]);

  const trackImpression = async (bannerId) => {
    await supabase.rpc('record_impression', { p_banner_id: bannerId }).maybeSingle();
  };

  const handleClick = async () => {
    if (!banner) return;
    await supabase.from('banner_clicks').insert({ banner_id: banner.id }).maybeSingle();
    window.open(banner.destination_url, '_blank', 'noopener,noreferrer');
  };

  if (!banner) return null;

  const heights = {
    leaderboard:  { h: 90,  w: '100%', maxW: 728 },
    rectangle:    { h: 250, w: 300,    maxW: 300 },
    skyscraper:   { h: 600, w: 160,    maxW: 160 },
    bar:          { h: 60,  w: '100%', maxW: 468 },
  };
  const dims = heights[size] || heights.bar;

  return (
    <div className={`flex justify-center ${className}`}>
      <div style={{ position: 'relative', width: dims.w, maxWidth: dims.maxW }}>
        <button onClick={handleClick} style={{ display: 'block', width: '100%', cursor: 'pointer', border: 'none', padding: 0, background: 'none' }} title={banner.title}>
          <img
            src={banner.image_url}
            alt={banner.title}
            style={{ width: '100%', height: dims.h, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
            onError={e => { e.target.parentElement.parentElement.parentElement.style.display = 'none'; }}
          />
        </button>
        <span style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 9, color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>AD</span>
      </div>
    </div>
  );
};

export default BannerRotator;
