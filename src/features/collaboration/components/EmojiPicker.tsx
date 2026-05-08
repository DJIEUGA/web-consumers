import React from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const COMMON_EMOJIS = [
  '😊', '😂', '🤣', '❤️', '👍', '🙏', '🔥', '✨', 
  '🤔', '👋', '🎉', '💪', '🙌', '👀', '🤝', '✅',
  '🚀', '💡', '💯', '📍', '📞', '📧', '💻', '🎨'
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  return (
    <div 
      className="emoji-picker-popover"
      style={{
        position: 'absolute',
        bottom: '100%',
        right: '0',
        backgroundColor: 'white',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        borderRadius: '12px',
        padding: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '8px',
        marginBottom: '10px',
        zIndex: 1000,
        width: 'max-content'
      }}
    >
      {COMMON_EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
          style={{
            border: 'none',
            background: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f3f5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
