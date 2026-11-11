import code from '@content/Components/CurvedInput/CurvedInput.jsx?raw';
import css from '@content/Components/CurvedInput/CurvedInput.css?raw';
import tailwind from '@tailwind/Components/CurvedInput/CurvedInput.jsx?raw';
import tsCode from '@ts-default/Components/CurvedInput/CurvedInput.tsx?raw';
import tsTailwind from '@ts-tailwind/Components/CurvedInput/CurvedInput.tsx?raw';

export const curvedInput = {
  usage: `import CurvedInput from './CurvedInput'

<CurvedInput
  placeholder="david@reactbits.dev"
  buttonText="Get Started"
  theme="dark"
  bend={28}
  height={64}
  width={450}
  onSubmit={value => console.log(value)}
/>

// Light preset, flat, no button
<CurvedInput
  theme="light"
  bend={0}
  showButton={false}
  showIcon={false}
  placeholder="Search components..."
  type="text"
/>`,
  code,
  css,
  tailwind,
  tsCode,
  tsTailwind
};
