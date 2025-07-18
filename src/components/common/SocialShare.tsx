"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Mail, 
  Copy, 
  Check,
  ExternalLink
} from "lucide-react";
import { AnalyticsService } from "@/lib/analytics-service";

interface SocialShareProps {
  contentId: string;
  contentType: 'article' | 'video' | 'research' | 'legal';
  title: string;
  description: string;
  url: string;
  image?: string;
}

const sharePlatforms = [
  {
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-blue-500 hover:bg-blue-600',
    url: (data: { url: string; title: string }) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(data.url)}`,
  },
  {
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    url: (data: { url: string }) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`,
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700 hover:bg-blue-800',
    url: (data: { url: string; title: string; description: string }) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}&summary=${encodeURIComponent(data.description)}`,
  },
  {
    name: 'Email',
    icon: Mail,
    color: 'bg-gray-600 hover:bg-gray-700',
    url: (data: { url: string; title: string; description: string }) => 
      `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(`${data.description}\n\nRead more: ${data.url}`)}`,
  },
];

export function SocialShare({ contentId, contentType, title, description, url, image }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async (platform: string) => {
    try {
      // Track share event
      await AnalyticsService.trackShare(
        contentId,
        contentType,
        platform as 'twitter' | 'facebook' | 'linkedin' | 'email' | 'copy'
      );

      // Find platform data
      const platformData = sharePlatforms.find(p => p.name.toLowerCase() === platform.toLowerCase());
      
      if (platformData) {
        const shareUrl = platformData.url({ url, title, description });
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    } catch (error) {
      console.error('Error sharing content:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      
      // Track copy event
      await AnalyticsService.trackShare(contentId, contentType, 'copy');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleLike = async () => {
    try {
      // This would integrate with a like system
      await AnalyticsService.trackLike(contentId, contentType, 'user-id', 'like');
    } catch (error) {
      console.error('Error liking content:', error);
    }
  };

  if (!isOpen) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button
          onClick={handleLike}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          Like
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share This Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content Preview */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <h4 className="font-medium text-sm mb-2">{title}</h4>
          <p className="text-xs text-gray-400 line-clamp-2">{description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </Badge>
            <span className="text-xs text-gray-500">Triton Tory Media</span>
          </div>
        </div>

        {/* Share Platforms */}
        <div className="grid grid-cols-2 gap-3">
          {sharePlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <Button
                key={platform.name}
                onClick={() => handleShare(platform.name)}
                className={`${platform.color} text-white`}
                size="sm"
              >
                <Icon className="h-4 w-4 mr-2" />
                {platform.name}
              </Button>
            );
          })}
        </div>

        {/* Copy Link */}
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={url}
              readOnly
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300"
            />
          </div>
          <Button
            onClick={handleCopyLink}
            variant={copied ? "default" : "outline"}
            size="sm"
            className={copied ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Close Button */}
        <Button
          onClick={() => setIsOpen(false)}
          variant="ghost"
          size="sm"
          className="w-full"
        >
          Close
        </Button>
      </CardContent>
    </Card>
  );
}

// Quick share button for inline use
export function QuickShare({ contentId, contentType, title, url }: {
  contentId: string;
  contentType: 'article' | 'video' | 'research' | 'legal';
  title: string;
  url: string;
}) {
  const handleQuickShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url,
        });
        
        // Track native share
        await AnalyticsService.trackShare(contentId, contentType, 'copy');
      } else {
        // Fallback to copying link
        await navigator.clipboard.writeText(url);
        await AnalyticsService.trackShare(contentId, contentType, 'copy');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Button
      onClick={handleQuickShare}
      variant="ghost"
      size="sm"
      className="text-gray-400 hover:text-white"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
} 