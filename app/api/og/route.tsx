import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const score = searchParams.get('score') || '78';
    const grade = searchParams.get('grade') || 'Decent Offer';
    const inhand = searchParams.get('inhand') || '₹42,000';
    const traps = searchParams.get('traps') || '2';
    const verdict = searchParams.get('verdict') || 'Review hidden clauses before signing';

    const numScore = parseInt(score, 10);
    let stampColor = '#1E6B4A'; // green
    let stampBg = '#EBF5F0';
    let stampBorder = '#96CEB4';

    if (numScore < 40) {
      stampColor = '#C2402A';
      stampBg = '#FAECE9';
      stampBorder = '#E8A79B';
    } else if (numScore < 60) {
      stampColor = '#D97706';
      stampBg = '#FEF3C7';
      stampBorder = '#FCD34D';
    } else if (numScore < 80) {
      stampColor = '#B7791F';
      stampBg = '#FEF7E8';
      stampBorder = '#E4C68B';
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FAF8F3',
            fontFamily: 'serif',
            padding: '48px 64px',
            justifyContent: 'space-between',
            border: '12px solid #1B1710',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #E2DACB',
              paddingBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: '#1B1710',
                  letterSpacing: '-0.02em',
                }}
              >
                whatsforyou
              </div>
              <div
                style={{
                  backgroundColor: '#1B1710',
                  color: '#FAF8F3',
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Offer Scorecard
              </div>
            </div>

            <div
              style={{
                fontSize: 16,
                color: '#6B655A',
                fontFamily: 'sans-serif',
              }}
            >
              Independent Indian Fresher Offer Audit
            </div>
          </div>

          {/* Main Card Body */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '20px 0',
            }}
          >
            {/* Left: Score Box */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '55%' }}>
              <div
                style={{
                  fontSize: 18,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: '#6B655A',
                  fontFamily: 'sans-serif',
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Overall Offer Health Score
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                <div
                  style={{
                    fontSize: 96,
                    fontWeight: 900,
                    color: '#1B1710',
                    lineHeight: 1,
                  }}
                >
                  {score}
                </div>
                <div style={{ fontSize: 36, color: '#6B655A', fontWeight: 400 }}>/ 100</div>
              </div>

              {/* Rubber Stamp Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: 16,
                  alignSelf: 'flex-start',
                  border: `3px solid ${stampColor}`,
                  borderRadius: 6,
                  padding: '8px 20px',
                  backgroundColor: stampBg,
                  color: stampColor,
                  fontWeight: 800,
                  fontSize: 22,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  transform: 'rotate(-2deg)',
                }}
              >
                {grade}
              </div>

              <div
                style={{
                  marginTop: 20,
                  fontSize: 18,
                  color: '#1B1710',
                  fontStyle: 'italic',
                }}
              >
                "{verdict}"
              </div>
            </div>

            {/* Right: Key Figures Box */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                backgroundColor: '#F4EFE6',
                border: '2px solid #E2DACB',
                borderRadius: 12,
                padding: '24px 32px',
                width: '38%',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    fontSize: 13,
                    fontFamily: 'sans-serif',
                    color: '#6B655A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                  }}
                >
                  Real Monthly In-Hand
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: '#1B1710',
                    marginTop: 4,
                  }}
                >
                  {inhand}
                  <span style={{ fontSize: 16, fontWeight: 400, color: '#6B655A' }}>/mo</span>
                </div>
              </div>

              <div style={{ height: 1, backgroundColor: '#E2DACB' }} />

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    fontSize: 13,
                    fontFamily: 'sans-serif',
                    color: '#6B655A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                  }}
                >
                  Hidden Traps Flagged
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: traps === '0' ? '#1E6B4A' : '#C2402A',
                    marginTop: 4,
                  }}
                >
                  {traps} {parseInt(traps, 10) === 1 ? 'Trap' : 'Traps'} Detected
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '2px solid #E2DACB',
              paddingTop: '16px',
              fontFamily: 'sans-serif',
              fontSize: 14,
              color: '#6B655A',
            }}
          >
            <div>whatsforyou.app • Zero-storage private offer letter analyzer</div>
            <div>Free • Built for Indian Freshers</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
