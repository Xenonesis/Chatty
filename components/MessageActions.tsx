'use client';

import { useState } from 'react';
import { Copy, ThumbsUp, ThumbsDown, Share2, RotateCw, MoreHorizontal, Flag, Check, Bookmark, Heart, Laugh, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MessageActionsProps {
  messageId: number | undefined;
  content: string;
  isUser: boolean;
  onRetry?: () => void;
  onRegenerate?: () => void;
  isBookmarked?: boolean;
  reactions?: Record<string, number>;
  onBookmarkToggle?: () => void;
  onReaction?: (reaction: string) => void;
}

export default function MessageActions({ 
  messageId, 
  content, 
  isUser, 
  onRetry, 
  onRegenerate,
  isBookmarked = false,
  reactions = {},
  onBookmarkToggle,
  onReaction 
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleLike = () => {
    setLiked(liked === true ? null : true);
    // TODO: Send feedback to backend
  };

  const handleDislike = () => {
    setLiked(liked === false ? null : false);
    // TODO: Send feedback to backend
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: content,
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    console.log('Report message:', messageId);
    alert('Message reported. Thank you for your feedback.');
  };

  const availableReactions = [
    { name: 'thumbs_up', icon: ThumbsUp, label: 'Like' },
    { name: 'heart', icon: Heart, label: 'Love' },
    { name: 'laugh', icon: Laugh, label: 'Funny' },
    { name: 'thumbs_down', icon: ThumbsDown, label: 'Dislike' },
  ];

  const handleReactionClick = (reactionName: string) => {
    if (onReaction && messageId) {
      onReaction(reactionName);
    }
  };

  const handleBookmark = () => {
    if (onBookmarkToggle && messageId) {
      onBookmarkToggle();
    }
  };

  return (
    <div className="space-y-2 mt-2">
      {/* Reactions Display */}
      {Object.keys(reactions).length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(reactions).map(([reaction, count]) => {
            const reactionConfig = availableReactions.find(r => r.name === reaction);
            if (!reactionConfig || count === 0) return null;
            const Icon = reactionConfig.icon;
            return (
              <div
                key={reaction}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-xs"
              >
                <Icon className="w-3 h-3" />
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Copy */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? 'Copied!' : 'Copy'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Bookmark Button */}
          {messageId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${isBookmarked ? 'text-yellow-500' : ''}`}
                  onClick={handleBookmark}
                >
                  <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isBookmarked ? 'Remove bookmark' : 'Bookmark'}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Reaction Button */}
          {messageId && (
            <DropdownMenu open={showReactions} onOpenChange={setShowReactions}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                    >
                      <Heart className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>React</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent>
                {availableReactions.map((reaction) => {
                  const Icon = reaction.icon;
                  return (
                    <DropdownMenuItem
                      key={reaction.name}
                      onClick={() => handleReactionClick(reaction.name)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {reaction.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

        {/* Like - Only for AI messages */}
        {!isUser && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleLike}
              >
                <ThumbsUp
                  className={`h-3.5 w-3.5 ${
                    liked === true ? 'fill-green-500 text-green-500' : ''
                  }`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Like</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Dislike - Only for AI messages */}
        {!isUser && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleDislike}
              >
                <ThumbsDown
                  className={`h-3.5 w-3.5 ${
                    liked === false ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dislike</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleShare}
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share</p>
          </TooltipContent>
        </Tooltip>

        {/* Retry - For user messages */}
        {isUser && onRetry && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onRetry}
              >
                <RotateCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Retry</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Regenerate - For AI messages */}
        {!isUser && onRegenerate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onRegenerate}
              >
                <RotateCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Regenerate</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* More dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>More</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleReport} className="text-red-600">
              <Flag className="h-4 w-4 mr-2" />
              Report message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </TooltipProvider>
    </div>
  );
}
