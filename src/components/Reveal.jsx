import { m } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1];

export const revealItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

// Fades and lifts content in once when it scrolls into view.
// With `stagger`, direct children using `revealItem` animate in sequence.
export default function Reveal({ as = 'div', stagger = 0, delay = 0, className, children, ...rest }) {
  const Component = m[as];
  const variants = stagger
    ? { hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }
    : {
        hidden: revealItem.hidden,
        visible: { ...revealItem.visible, transition: { ...revealItem.visible.transition, delay } },
      };

  return (
    <Component
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      {...rest}
    >
      {children}
    </Component>
  );
}
