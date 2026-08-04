import { useTheme } from '@/context/ThemeContext';

type LogoProps = {
  size?: number;
  className?: string;
  showText?: boolean;
};

export default function Logo({ size = 36, className = '', showText = true }: LogoProps) {
  const { theme } = useTheme();
  const src = theme === 'dark' ? '/images/logo/logo-dark.png' : '/images/logo/logo-light.png';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={src}
        alt="EzeeCAD Logo"
        style={{ width: size, height: size }}
        className="rounded-lg object-cover"
      />
      {showText && (
        <span className="font-display font-bold text-lg tracking-tight">
          Ezee<span className="text-gradient">CAD</span>
        </span>
      )}
    </div>
  );
}
