import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Runes - Mystic Arcade',
  description: 'Seek wisdom from the ancient Elder Futhark. Daily runes, spreads, and mystical guidance.',
};

export default function RunesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-foreground">
            Ancient <span className="text-yellow-400">Runes</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Seek wisdom from the Elder Futhark. Daily guidance, spreads, and mystical insights.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
