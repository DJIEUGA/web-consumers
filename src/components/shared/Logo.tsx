import React from 'react';
import logo from '@/assets/logo.png';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
}

const Logo: React.FC<LogoProps> = ({
  alt = 'Jobty',
  src = logo,
  ...props
}) => {
  return (
    <img
      src={src}
      alt={alt}
      {...props}
    />
  );
};

export default Logo;
