// ADR-0026: the OMP entry. It runs the Pi extension with the agent id omp; pi/index.js holds the code.
import { hostExtension } from "../pi/index.js";
export default function ompExtension(pi) {
  hostExtension(pi, "omp");
}
