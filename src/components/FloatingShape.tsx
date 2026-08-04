import { motion } from 'framer-motion';

type FloatingShapeProps = {
  className?: string;
  delay?: number;
};

export default function FloatingShape({ className = '', delay = 0 }: FloatingShapeProps) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{
        y: [0, -30, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div className="preserve-3d perspective-1000">
        <div
          className="w-16 h-16 preserve-3d"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400/30 to-accent-400/30 rounded-2xl backdrop-blur-md border border-white/20" />
          <div
            className="absolute inset-0 bg-gradient-to-tr from-accent-500/20 to-primary-500/20 rounded-2xl backdrop-blur-md border border-white/10"
            style={{ transform: 'rotateY(60deg) translateZ(10px)' }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-bl from-primary-500/20 to-accent-500/20 rounded-2xl backdrop-blur-md border border-white/10"
            style={{ transform: 'rotateX(60deg) translateZ(10px)' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
