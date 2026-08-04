type LogoProps = {
  size?: number;
  className?: string;
  showText?: boolean;
};

export default function Logo({ size = 36, className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/images/logo/image.png"
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
