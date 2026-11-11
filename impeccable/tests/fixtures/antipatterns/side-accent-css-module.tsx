// A markup accent next to a CSS module class. The module could round the
// card, and the detector does not follow the import, so the accent keeps its
// finding.
import styles from './side-accent-css-module-card.module.css';

export function FlagModuleClass() {
  return <div className={`${styles.card} border-l-4 border-teal-700 p-4`}>Card styled by a CSS module</div>;
}
