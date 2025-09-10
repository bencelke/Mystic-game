import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getRuneFull } from '@/lib/content/runes';
import { truncateMeaning, formatDateUTC } from '@/lib/share/text';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const runeId = searchParams.get('runeId');
    const reversed = searchParams.get('rev') === '1';
    const dateStr = searchParams.get('d');

    if (!runeId) {
      return new Response('Missing runeId parameter', { status: 400 });
    }

    const rune = getRuneFull(runeId as any);
    if (!rune) {
      return new Response('Rune not found', { status: 404 });
    }

    const date = dateStr ? new Date(dateStr) : new Date();
    const formattedDate = formatDateUTC(date);
    const meaning = reversed && rune.reversed ? rune.reversed : rune.upright;
    const truncatedMeaning = truncateMeaning(meaning, 120);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)',
            }}
          />

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              maxWidth: '1000px',
              padding: '40px',
            }}
          >
            {/* Rune Symbol */}
            <div
              style={{
                fontSize: '120px',
                fontFamily: 'Cinzel, serif',
                color: '#fbbf24',
                marginBottom: '20px',
                textShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
              }}
            >
              {rune.symbol}
            </div>

            {/* Rune Name */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '10px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              {rune.name}
            </div>

            {/* Reversed Badge */}
            {reversed && (
              <div
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Reversed
              </div>
            )}

            {/* Meaning */}
            <div
              style={{
                fontSize: '24px',
                color: '#d1d5db',
                lineHeight: '1.4',
                marginBottom: '30px',
                maxWidth: '800px',
              }}
            >
              {truncatedMeaning}
            </div>

            {/* Date */}
            <div
              style={{
                fontSize: '18px',
                color: '#9ca3af',
                marginBottom: '20px',
              }}
            >
              {formattedDate}
            </div>
          </div>

          {/* Watermark */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              right: '30px',
              fontSize: '20px',
              color: '#6b7280',
              fontWeight: '600',
            }}
          >
            mystic.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating rune OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
