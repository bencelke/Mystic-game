import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRuneFull } from '@/lib/content/runes';
import { formatDateUTC, parseDateFromUrl } from '@/lib/share/text';
import { runeOgUrl } from '@/lib/share/links';
import { RuneId } from '@/content/runes-ids';
import Link from 'next/link';

interface RuneSharePageProps {
  params: {
    runeId: string;
  };
  searchParams: {
    rev?: string;
    d?: string;
  };
}

export async function generateMetadata({ params, searchParams }: RuneSharePageProps): Promise<Metadata> {
  const rune = getRuneFull(params.runeId as RuneId);
  if (!rune) {
    return {
      title: 'Rune Not Found | Mystic',
    };
  }

  const reversed = searchParams.rev === '1';
  const date = searchParams.d ? parseDateFromUrl(searchParams.d) : new Date();
  const ogImageUrl = runeOgUrl({
    runeId: params.runeId,
    reversed,
    dateUTC: date,
  });

  return {
    title: `${rune.name} - Daily Rune | Mystic`,
    description: `Today's rune: ${rune.name} - ${reversed && rune.reversed ? rune.reversed : rune.upright}`,
    openGraph: {
      title: `${rune.name} - Daily Rune | Mystic`,
      description: `Today's rune: ${rune.name} - ${reversed && rune.reversed ? rune.reversed : rune.upright}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${rune.name} rune`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${rune.name} - Daily Rune | Mystic`,
      description: `Today's rune: ${rune.name} - ${reversed && rune.reversed ? rune.reversed : rune.upright}`,
      images: [ogImageUrl],
    },
  };
}

export default function RuneSharePage({ params, searchParams }: RuneSharePageProps) {
  const rune = getRuneFull(params.runeId as RuneId);
  if (!rune) {
    notFound();
  }

  const reversed = searchParams.rev === '1';
  const date = searchParams.d ? parseDateFromUrl(searchParams.d) : new Date();
  const formattedDate = formatDateUTC(date);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <span className="text-yellow-400">Mystic</span> Rune
          </h1>
          <p className="text-muted-foreground">Shared result from {formattedDate}</p>
        </div>

        {/* Rune Card */}
        <Card className="border-border bg-card mb-8">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span 
                className="text-6xl font-cinzel"
                style={{ fontFamily: 'var(--font-cinzel)' }}
              >
                {rune.symbol}
              </span>
              <div>
                <CardTitle className="text-3xl text-foreground">{rune.name}</CardTitle>
                {rune.phoneme && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Phoneme: <span className="text-yellow-400">{rune.phoneme}</span>
                  </p>
                )}
              </div>
            </div>
            
            {reversed && (
              <Badge 
                variant="destructive" 
                className="text-sm px-3 py-1"
              >
                Reversed
              </Badge>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Meaning */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {reversed ? 'Reversed Meaning' : 'Upright Meaning'}
              </h3>
              <p className="text-muted-foreground">
                {reversed && rune.reversed ? rune.reversed : rune.upright}
              </p>
            </div>

            {/* Keywords */}
            {rune.keywords && rune.keywords.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {rune.keywords.map((keyword, index) => (
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
            {rune.element && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Element</h3>
                <Badge variant="outline" className="capitalize">
                  {rune.element}
                </Badge>
              </div>
            )}

            {/* Additional Info */}
            {rune.info && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Details</h3>
                <p className="text-muted-foreground">{rune.info}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            Want to discover your own daily guidance?
          </p>
          <Link href="/runes">
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
