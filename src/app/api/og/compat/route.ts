import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { formatDateUTC } from '@/lib/share/text';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const score = searchParams.get('score');
    const dateStr = searchParams.get('d');

    if (!score) {
      return new Response('Missing score parameter', { status: 400 });
    }

    const scoreNum = parseInt(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      return new Response('Invalid score', { status: 400 });
    }

    const date = dateStr ? new Date(dateStr) : new Date();
    const formattedDate = formatDateUTC(date);

    // Determine score color and message
    let scoreColor = '#6b7280'; // gray
    let scoreMessage = 'Neutral compatibility';
    
    if (scoreNum >= 80) {
      scoreColor = '#10b981'; // green
      scoreMessage = 'Excellent compatibility';
    } else if (scoreNum >= 60) {
      scoreColor = '#f59e0b'; // yellow
      scoreMessage = 'Good compatibility';
    } else if (scoreNum >= 40) {
      scoreColor = '#f97316'; // orange
      scoreMessage = 'Moderate compatibility';
    } else {
      scoreColor = '#ef4444'; // red
      scoreMessage = 'Challenging compatibility';
    }

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
            {/* Score Circle */}
            <div
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                border: `8px solid ${scoreColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '30px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: scoreColor,
                  textShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
                }}
              >
                {scoreNum}%
              </div>
            </div>

            {/* Compatibility Message */}
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '20px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              {scoreMessage}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: '24px',
                color: '#d1d5db',
                lineHeight: '1.4',
                marginBottom: '30px',
                maxWidth: '800px',
              }}
            >
              Numerology compatibility analysis based on life path and name numbers
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
    console.error('Error generating compatibility OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
