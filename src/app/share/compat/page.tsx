import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateUTC, parseDateFromUrl } from '@/lib/share/text';
import { compatOgUrl } from '@/lib/share/links';
import Link from 'next/link';

interface CompatSharePageProps {
  searchParams: {
    score?: string;
    d?: string;
  };
}

export async function generateMetadata({ searchParams }: CompatSharePageProps): Promise<Metadata> {
  const score = searchParams.score ? parseInt(searchParams.score) : 0;
  const date = searchParams.d ? parseDateFromUrl(searchParams.d) : new Date();
  const ogImageUrl = compatOgUrl({
    score,
    dateUTC: date,
  });

  return {
    title: `Compatibility Score: ${score}% | Mystic`,
    description: `Numerology compatibility analysis: ${score}% match`,
    openGraph: {
      title: `Compatibility Score: ${score}% | Mystic`,
      description: `Numerology compatibility analysis: ${score}% match`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Compatibility Score: ${score}%`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Compatibility Score: ${score}% | Mystic`,
      description: `Numerology compatibility analysis: ${score}% match`,
      images: [ogImageUrl],
    },
  };
}

export default function CompatSharePage({ searchParams }: CompatSharePageProps) {
  const score = searchParams.score ? parseInt(searchParams.score) : 0;
  const date = searchParams.d ? parseDateFromUrl(searchParams.d) : new Date();
  const formattedDate = formatDateUTC(date);

  // Determine score color and message
  let scoreColor = 'bg-gray-500';
  let scoreMessage = 'Neutral compatibility';
  
  if (score >= 80) {
    scoreColor = 'bg-green-500';
    scoreMessage = 'Excellent compatibility';
  } else if (score >= 60) {
    scoreColor = 'bg-yellow-500';
    scoreMessage = 'Good compatibility';
  } else if (score >= 40) {
    scoreColor = 'bg-orange-500';
    scoreMessage = 'Moderate compatibility';
  } else {
    scoreColor = 'bg-red-500';
    scoreMessage = 'Challenging compatibility';
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <span className="text-yellow-400">Mystic</span> Compatibility
          </h1>
          <p className="text-muted-foreground">Shared result from {formattedDate}</p>
        </div>

        {/* Compatibility Card */}
        <Card className="border-border bg-card mb-8">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div 
                className={`w-24 h-24 rounded-full ${scoreColor} flex items-center justify-center text-white text-3xl font-bold`}
              >
                {score}%
              </div>
              <div>
                <CardTitle className="text-3xl text-foreground">
                  Compatibility Score
                </CardTitle>
                <Badge variant="outline" className="mt-2">
                  Numerology Analysis
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Message */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {scoreMessage}
              </h3>
              <p className="text-muted-foreground">
                Based on life path and name number analysis
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">About This Score</h3>
              <p className="text-muted-foreground">
                This compatibility score is calculated using numerology principles, 
                analyzing the vibrational harmony between life path numbers and name numbers. 
                Higher scores indicate greater potential for harmony and understanding.
              </p>
            </div>

            {/* Score Range Info */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Score Ranges</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-400">80-100%</span>
                  <span className="text-muted-foreground">Excellent compatibility</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-400">60-79%</span>
                  <span className="text-muted-foreground">Good compatibility</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-400">40-59%</span>
                  <span className="text-muted-foreground">Moderate compatibility</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">0-39%</span>
                  <span className="text-muted-foreground">Challenging compatibility</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            Want to analyze your own compatibility?
          </p>
          <Link href="/numerology?tab=compat">
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
