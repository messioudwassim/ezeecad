import { motion } from 'framer-motion';

type ExplodedAssemblyProps = {
  size?: number;
  className?: string;
};

// Chaque "piece" represente un panneau de l'objet assemble. Au repos elles
// forment un bloc compact ; periodiquement elles se separent le long de
// leur axe (comme une vue eclatee CAO) avant de se rassembler -- une
// reference directe et immediatement reconnaissable pour tout designer qui
// travaille en CAO, tout en restant lisible et agreable pour un visiteur
// qui n'y connait rien.
const pieces = [
  { axis: 'Z', dir: 1, color: 'border-primary-500/70 bg-primary-500/10', label: '01' },
  { axis: 'Z', dir: -1, color: 'border-accent-500/70 bg-accent-500/10', label: '02' },
  { axis: 'X', dir: 1, color: 'border-accent-500/70 bg-accent-500/10', label: '03' },
  { axis: 'X', dir: -1, color: 'border-primary-500/70 bg-primary-500/10', label: '04' },
  { axis: 'Y', dir: 1, color: 'border-primary-400/70 bg-primary-400/10', label: '05' },
  { axis: 'Y', dir: -1, color: 'border-accent-400/70 bg-accent-400/10', label: '06' },
] as const;

function faceTransform(axis: 'X' | 'Y' | 'Z', dir: 1 | -1, distance: number) {
  const d = dir * distance;
  if (axis === 'Z') return `translateZ(${d}px)`;
  if (axis === 'X') return `rotateY(${dir === 1 ? 90 : -90}deg) translateZ(${distance}px)`;
  return `rotateX(${dir === 1 ? -90 : 90}deg) translateZ(${distance}px)`;
}

export default function ExplodedAssembly({ size = 200, className = '' }: ExplodedAssemblyProps) {
  const assembled = size / 2;
  const exploded = size * 0.95;
  const panel = size * 0.62;

  return (
    <div className={`perspective-1000 ${className}`} style={{ width: size, height: size }}>
      <motion.div
        className="preserve-3d relative"
        style={{ width: size, height: size }}
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
      >
        {pieces.map((p, i) => (
          <motion.div
            key={i}
            className="absolute preserve-3d"
            style={{
              width: panel,
              height: panel,
              left: (size - panel) / 2,
              top: (size - panel) / 2,
            }}
            animate={{
              // va-et-vient assemble -> eclate -> assemble, decale par piece
              // pour que la vue eclatee se "deplie" progressivement au lieu
              // de sauter d'un coup.
              transform: [
                faceTransform(p.axis, p.dir, assembled),
                faceTransform(p.axis, p.dir, exploded),
                faceTransform(p.axis, p.dir, exploded),
                faceTransform(p.axis, p.dir, assembled),
              ],
            }}
            transition={{
              duration: 7,
              times: [0, 0.35, 0.75, 1],
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.15,
            }}
          >
            <div
              className={`w-full h-full rounded-xl border-2 backdrop-blur-sm flex items-start justify-start p-2 ${p.color}`}
              style={{ boxShadow: '0 0 24px rgba(51,162,255,0.12)' }}
            >
              <span className="font-display text-[10px] font-bold text-primary-600 dark:text-primary-300 opacity-70">
                {p.label}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Noyau central : repere fixe autour duquel les pieces s'organisent,
            comme le point d'ancrage dans un plan d'assemblage. */}
        <div
          className="absolute rounded-full border border-primary-400/40 bg-white/5 backdrop-blur-sm"
          style={{
            width: size * 0.14,
            height: size * 0.14,
            left: (size - size * 0.14) / 2,
            top: (size - size * 0.14) / 2,
            transform: 'translateZ(0px)',
          }}
        />
      </motion.div>
    </div>
  );
}