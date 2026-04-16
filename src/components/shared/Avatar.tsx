import React from 'react';

interface Props {
  src?: string;
  alt?: string;
  size?: number;
}

const Avatar: React.FC<Props> = ({ src, alt = 'avatar', size = 48 }) => (
  <img src={src} alt={alt} className="avatar" style={{ width: size, height: size, borderRadius: '50%' }} />
);

export default Avatar;
