import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Numerology - Mystic Arcade',
  description: 'Discover your cosmic numbers and divine guidance through numerology. Daily numbers, deep readings, and compatibility insights.',
};

export default function NumerologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-foreground">
            Cosmic <span className="text-yellow-400">Numerology</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Discover your cosmic numbers and divine guidance. Daily numbers, deep readings, and compatibility insights.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
