// A markup accent in a file that imports a stylesheet. The stylesheet could
// round the class the tag carries, and the detector does not follow the
// import, so the accent keeps its finding unless the tag squares itself off.
import './side-accent-import-card.css';

export function FlagImportedClass() {
  return <div className="card border-l-4 border-teal-700 p-4">Card styled by an imported stylesheet</div>;
}
