'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  runeShareUrlWithUtm, 
  numberShareUrlWithUtm, 
  compatShareUrlWithUtm,
  runeOgUrl,
  numberOgUrl,
  compatOgUrl
} from '@/lib/share/links';
import { getShareTitle, getShareDescription } from '@/lib/share/text';
import { trackShareOpen, trackShareDownload, trackShareLink } from '@/lib/analytics/share';

interface RuneShareParams {
  runeId: string;
  reversed: boolean;
  dateUTC: Date;
}

interface NumberShareParams {
  numId: number;
  dateUTC: Date;
  mode: 'daily' | 'deep';
}

interface CompatShareParams {
  score: number;
  dateUTC: Date;
}

type ShareParams = RuneShareParams | NumberShareParams | CompatShareParams;

interface ShareRowProps {
  kind: 'rune' | 'number' | 'compat';
  params: ShareParams;
  className?: string;
}

export function ShareRow({ kind, params, className }: ShareRowProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate URLs based on kind
  const getUrls = () => {
    switch (kind) {
      case 'rune':
        const runeParams = params as RuneShareParams;
        return {
          shareUrl: runeShareUrlWithUtm(runeParams),
          ogUrl: runeOgUrl(runeParams),
          title: getShareTitle('rune', runeParams),
          description: getShareDescription('rune', runeParams),
        };
      case 'number':
        const numberParams = params as NumberShareParams;
        return {
          shareUrl: numberShareUrlWithUtm(numberParams),
          ogUrl: numberOgUrl(numberParams),
          title: getShareTitle('number', numberParams),
          description: getShareDescription('number', numberParams),
        };
      case 'compat':
        const compatParams = params as CompatShareParams;
        return {
          shareUrl: compatShareUrlWithUtm(compatParams),
          ogUrl: compatOgUrl(compatParams),
          title: getShareTitle('compat', compatParams),
          description: getShareDescription('compat', compatParams),
        };
      default:
        throw new Error(`Unknown share kind: ${kind}`);
    }
  };

  const { shareUrl, ogUrl, title, description } = getUrls();

  const handleDownloadImage = async () => {
    setIsDownloading(true);
    try {
      // Fetch the OG image
      const response = await fetch(ogUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `mystic-${kind}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);

      // Track analytics
      trackShareDownload(kind, 'ritual_result');
    } catch (error) {
      console.error('Error downloading image:', error);
      // You could add a toast notification here
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareLink = async () => {
    setIsSharing(true);
    try {
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });

        // Track analytics
        trackShareLink(kind, 'webshare', 'ritual_result');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        // Track analytics
        trackShareLink(kind, 'copy', 'ritual_result');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // You could add a toast notification here
    } finally {
      setIsSharing(false);
    }
  };

  // Track share_open event when component mounts
  useState(() => {
    trackShareOpen(kind, 'ritual_result');
  });

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Share Your Result
            </h3>
            <p className="text-sm text-muted-foreground">
              Save an image or share a link to your mystical guidance
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              variant="outline"
              className="flex items-center gap-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Save Image
            </Button>

            <Button
              onClick={handleShareLink}
              disabled={isSharing}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isSharing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              {copied ? 'Copied!' : 'Share Link'}
            </Button>
          </div>

          {/* Privacy Notice */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              No personal data is shared
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
