'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, Info, AlertCircle } from 'lucide-react';
import { extractYouTubeId } from '@/lib/utils';

interface YouTubePlayerProps {
  url: string;
}

export function YouTubePlayer({ url }: YouTubePlayerProps) {
  const [copied, setCopied] = useState(false);
  const videoId = extractYouTubeId(url);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — clipboard may be unavailable
    }
  }

  function openInYouTube() {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="space-y-4">
      {/* Video Embed or Error */}
      {videoId ? (
        <div
          className="relative w-full overflow-hidden"
          style={{ paddingBottom: '56.25%', borderRadius: '6px' }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
            style={{ borderRadius: '6px' }}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          <span>Video unavailable — unable to extract video ID from URL.</span>
        </div>
      )}

      {/* URL Box + Buttons */}
      <div className="space-y-3">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-ink"
          aria-label="YouTube URL"
        />
        <div className="flex gap-3">
          <button
            onClick={copyLink}
            className="inline-flex h-10 items-center gap-2 rounded-md border-2 px-4 text-sm font-medium transition-colors"
            style={{
              borderColor: '#2C5F8A',
              color: '#2C5F8A',
              backgroundColor: '#FFFFFF',
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied! \u2713' : 'Copy link'}
          </button>
          <button
            onClick={openInYouTube}
            className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#2C5F8A' }}
          >
            <ExternalLink size={16} />
            Open in YouTube
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 rounded-md p-4" style={{ backgroundColor: '#EBF3FA' }}>
        <Info size={18} className="mt-0.5 flex-shrink-0" style={{ color: '#2C5F8A' }} />
        <p className="text-sm" style={{ color: '#2C5F8A' }}>
          YouTube Premium subscribers can download this video directly from YouTube for offline
          viewing.
        </p>
      </div>
    </div>
  );
}
