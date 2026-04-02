import { useState } from 'react';

const ShareModal = ({ event, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/events/${event.id}`;
  const shareText = `Join me at ${event.name} on ${new Date(event.event_date).toLocaleDateString()}!`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      email: `mailto:?subject=${encodeURIComponent(`Invitation: ${event.name}`)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Share Event</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <p className="font-medium text-gray-900">{event.name}</p>
          <p className="text-sm text-gray-500">{event.event_date ? new Date(event.event_date).toLocaleDateString() : ''} • {event.venue || ''}</p>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-4">
          {[
            { platform: 'facebook', icon: '📘', color: 'hover:bg-blue-50' },
            { platform: 'twitter', icon: '🐦', color: 'hover:bg-sky-50' },
            { platform: 'linkedin', icon: '💼', color: 'hover:bg-blue-50' },
            { platform: 'whatsapp', icon: '💬', color: 'hover:bg-green-50' },
            { platform: 'email', icon: '📧', color: 'hover:bg-gray-50' }
          ].map(s => (
            <button key={s.platform} onClick={() => shareToSocial(s.platform)} className={`flex flex-col items-center p-3 rounded-lg transition-colors ${s.color}`}>
              <span className="text-2xl mb-1">{s.icon}</span>
              <span className="text-xs text-gray-600 capitalize">{s.platform}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <input type="text" value={shareUrl} readOnly className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50" />
          <button onClick={copyLink} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
