import React, { useState, useEffect } from 'react';
import { buildAvatarFallbackUrl } from '../../utils/avatar';

interface Props {
  src?: string;
  alt?: string;
  size?: number;
}

const Avatar: React.FC<Props> = ({ src, alt = 'avatar', size = 48 }) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const handleError = () => {
    // Prevent infinite loop if fallback also fails
    const fallback = buildAvatarFallbackUrl(alt);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  return (
    <img 
      src={imgSrc || buildAvatarFallbackUrl(alt)} 
      alt={alt} 
      className="avatar" 
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} 
      onError={handleError}
    />
  );
};

export default Avatar;
