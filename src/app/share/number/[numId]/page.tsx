import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getNumberContent } from '@/lib/content/numbers';
import { formatDateUTC, parseDateFromUrl } from '@/lib/share/text';
import { numberOgUrl } from '@/lib/share/links';
import Link from 'next/link';

interface NumberSharePageProps {
  params: {
    numId: string;
  };
  searchParams: {
    d?: string;
    mode?: string;
  };
}

export async function generateMetadata({ params, searchParams }: NumberSharePageProps): Promise<Metadata> {
  const numId = parseInt(params.numId);
  if (isNaN(numId)) {
    return {
      title: 'Number Not Found | Mystic',
    };
  }

  const numberContent = getNumberContent(numId);
  if (!numberContent) {
    return {
      title: 'Number Not Found | Mystic',
    };
  }

  const mode = searchParams.mode || 'daily';
  const date = searchParams.d ? parseDateFromUrl(searchParams.d) : new Date();
  const meaning = mode === 'deep' ? numberContent.deepMeaning : numberContent.meaning;
  const ogImageUrl = numberOgUrl({
    numId,
    dateUTC: date,
    mode: mode as 'daily' | 'deep',
  });

  return {
    title: `Number ${numId} - Daily Numerology | Mystic`,
    description: `Today's numerology: ${numId} - ${meaning}`,
    openGraph: {
      title: `Number ${numId} - Daily Numerology | Mystic`,
      description: `Today's numerology: ${numId} - ${meaning}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Number ${numId}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Number ${numId} - Daily Numerology | Mystic`,
      description: `Today's numerology: ${numId} - ${meaning}`,
      images: [ogImageUrl],
    },
  };
}

export default function NumberSharePage({ params, searchParams }: NumberSharePageProps) {
  const numId = parseInt(params.numId);
  if (isNaN(numId)) {
    notFound();
  }

  const numberContent = getNumberContent(numId);
  if (!numberContent) {
    notFound();
  }

  const mode = searchParams.mode || 'daily';
  const date = searchParams.d ? parseDateFromUrl(searchParams.d) : new Date();
  const formattedDate = formatDateUTC(date);
  const meaning = mode === 'deep' ? numberContent.deepMeaning : numberContent.meaning;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <span className="text-yellow-400">Mystic</span> Numerology
          </h1>
          <p className="text-muted-foreground">Shared result from {formattedDate}</p>
        </div>

        {/* Number Card */}
        <Card className="border-border bg-card mb-8">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div 
                className="text-6xl font-bold text-yellow-400"
                style={{ fontFamily: 'var(--font-cinzel)' }}
              >
                {numId}
              </div>
              <div>
                <CardTitle className="text-3xl text-foreground">
                  {numberContent.name}
                </CardTitle>
                <Badge 
                  variant={mode === 'deep' ? 'default' : 'secondary'}
                  className="mt-2"
                >
                  {mode === 'deep' ? 'Deep Reading' : 'Daily Number'}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Meaning */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {mode === 'deep' ? 'Deep Meaning' : 'Daily Meaning'}
              </h3>
              <p className="text-muted-foreground">{meaning}</p>
            </div>

            {/* Keywords */}
            {numberContent.keywords && numberContent.keywords.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {numberContent.keywords.map((keyword, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Element */}
            {numberContent.element && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Element</h3>
                <Badge variant="outline" className="capitalize">
                  {numberContent.element}
                </Badge>
              </div>
            )}

            {/* Additional Info */}
            {numberContent.info && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Details</h3>
                <p className="text-muted-foreground">{numberContent.info}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            Want to discover your own daily numerology?
          </p>
          <Link href={mode === 'deep' ? '/numerology?tab=deep' : '/numerology'}>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Open in Mystic
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>No personal data is shared. This is a public result card.</p>
        </div>
      </div>
    </div>
  );
}
