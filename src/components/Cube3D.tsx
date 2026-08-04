import { motion } from 'framer-motion';

type Cube3DProps = {
  size?: number;
  className?: string;
};

const faceGradients = [
  'linear-gradient(135deg, #1b82f5 0%, #06b3d4 100%)',
  'linear-gradient(135deg, #06b3d4 0%, #1b82f5 100%)',
  'linear-gradient(135deg, #33a2ff 0%, #0792b8 100%)',
  'linear-gradient(135deg, #59c0ff 0%, #06b3d4 100%)',
  'linear-gradient(135deg, #1468e0 0%, #22c9ee 100%)',
  'linear-gradient(135deg, #0792b8 0%, #59c0ff 100%)',
];

export default function Cube3D({ size = 200, className = '' }: Cube3DProps) {
  const half = size / 2;
  const edgeColor = 'rgba(255,255,255,0.25)';

  const transforms: React.CSSProperties[] = [
    { transform: `translateZ(${half}px)` },
    { transform: `rotateY(180deg) translateZ(${half}px)` },
    { transform: `rotateY(90deg) translateZ(${half}px)` },
    { transform: `rotateY(-90deg) translateZ(${half}px)` },
    { transform: `rotateX(90deg) translateZ(${half}px)` },
    { transform: `rotateX(-90deg) translateZ(${half}px)` },
  ];

  return (
    <div
      className={`perspective-1000 ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.div
        className="preserve-3d relative"
        style={{ width: size, height: size }}
        animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {transforms.map((t, i) => (
          <div
            key={i}
            style={{
              ...t,
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              background: faceGradients[i],
              borderRadius: '16px',
              border: `1px solid ${edgeColor}`,
              boxShadow: 'inset 0 0 40px rgba(255,255,255,0.08), 0 0 30px rgba(27,130,245,0.15)',
              backfaceVisibility: 'hidden',
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="w-full h-full flex items-center justify-center rounded-2xl">
              <div
                className="rounded-lg border border-white/20"
                style={{
                  width: '50%',
                  height: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <div
                  className="w-full h-full rounded-lg"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
