import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const PNG_FALLBACK = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/SuoAAAAASUVORK5CYII=';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scoreValue = Number.parseInt(searchParams.get('score') || '78', 10);
  const score = Number.isFinite(scoreValue) ? Math.max(0, Math.min(100, scoreValue)) : 78;
  const grade = (searchParams.get('grade') || 'Decent Offer').slice(0, 32);
  const inhand = (searchParams.get('inhand') || '₹42,000').slice(0, 24);
  const trapsValue = Number.parseInt(searchParams.get('traps') || '2', 10);
  const traps = Number.isFinite(trapsValue) ? Math.max(0, trapsValue) : 0;
  const stampColor = score < 60 ? '#C2402A' : score < 80 ? '#B7791F' : '#1E6B4A';
  const stampBackground = score < 60 ? '#FAECE9' : score < 80 ? '#FEF7E8' : '#EBF5F0';
  const stats = `${traps} ${traps === 1 ? 'trap' : 'traps'} · ${inhand}/mo real in-hand`;

  try {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#FAF8F3', border: '12px solid #1B1710', padding: '48px 64px', color: '#1B1710', fontFamily: 'serif' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E2DACB', paddingBottom: 18 }}>
            <div style={{ fontSize: 32, fontWeight: 900 }}>whatsforyou</div>
            <div style={{ fontFamily: 'sans-serif', color: '#6B655A', fontSize: 18 }}>Offer Scorecard</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, paddingTop: 16, paddingBottom: 16 }}>
            <div style={{ fontFamily: 'sans-serif', fontSize: 20, textTransform: 'uppercase', letterSpacing: 3, color: '#6B655A' }}>Offer Health Score</div>
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 4 }}>
              <div style={{ fontSize: 164, fontWeight: 900, lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: 48, color: '#6B655A', marginLeft: 14 }}>/ 100</div>
            </div>
            <div style={{ display: 'flex', alignSelf: 'flex-start', border: `4px solid ${stampColor}`, backgroundColor: stampBackground, color: stampColor, borderRadius: 6, padding: '10px 22px', marginTop: 10, fontFamily: 'sans-serif', fontSize: 24, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>{grade}</div>
            <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, marginTop: 30, color: '#C2402A' }}>{stats}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #E2DACB', paddingTop: 16, fontFamily: 'sans-serif', fontSize: 16, color: '#6B655A' }}>
            <div>whatsforyou.app · Private offer letter audit</div>
            <div>No personal details shared</div>
          </div>
        </div>
      ),
      { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } }
    );
  } catch (error) {
    console.error('[whatsforyou] OG image generation failed', error);
    return new Response(Uint8Array.from(atob(PNG_FALLBACK), (character) => character.charCodeAt(0)), {
      status: 200,
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' },
    });
  }
}
