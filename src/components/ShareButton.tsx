import React from 'react';
import { FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

interface ShareButtonProps {
  data: {
    topArtists: string[];
    topTracks: string[];
    // Add other data you want to share
  };
}

export const ShareButton: React.FC<ShareButtonProps> = ({ data }) => {
  const shareUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const shareTitle = process.env.NEXT_PUBLIC_SHARE_TITLE;
  const shareDescription = process.env.NEXT_PUBLIC_SHARE_DESCRIPTION;

  const handleTwitterShare = () => {
    const text = `${shareTitle}\n\nTop Artists:\n${data.topArtists.slice(0, 3).join(', ')}\n\nTop Tracks:\n${data.topTracks.slice(0, 3).join(', ')}\n`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleInstagramShare = () => {
    // Since Instagram doesn't support direct link sharing,
    // we'll show a modal with instructions to screenshot and share
    alert('Screenshot your Wrapped and share it on Instagram!');
  };

  return (
    <div className="flex gap-4 mt-4">
      <button
        onClick={handleTwitterShare}
        className="p-2 rounded-full bg-[#1DA1F2] text-white hover:opacity-80"
        aria-label="Share on Twitter"
      >
        <FaTwitter size={24} />
      </button>
      
      <button
        onClick={handleLinkedInShare}
        className="p-2 rounded-full bg-[#0077B5] text-white hover:opacity-80"
        aria-label="Share on LinkedIn"
      >
        <FaLinkedin size={24} />
      </button>
      
      <button
        onClick={handleInstagramShare}
        className="p-2 rounded-full bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] text-white hover:opacity-80"
        aria-label="Share on Instagram"
      >
        <FaInstagram size={24} />
      </button>
    </div>
  );
}; 