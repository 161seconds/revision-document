import { useMemo } from 'react';
import { Box } from '@chakra-ui/react';
import { CodeTab, PreviewTab, TabsLayout } from '../../components/common/TabsLayout';
import useComponentProps from '../../hooks/useComponentProps';
import { ComponentPropsProvider } from '../../components/context/ComponentPropsContext';

import CodeExample from '../../components/code/CodeExample';
import PropTable from '../../components/common/Preview/PropTable';
import Customize from '../../components/common/Preview/Customize';
import PreviewSlider from '../../components/common/Preview/PreviewSlider';
import PreviewSwitch from '../../components/common/Preview/PreviewSwitch';
import PreviewSelect from '../../components/common/Preview/PreviewSelect';

import InfiniteSpiral from '../../tailwind/Components/InfiniteSpiral/InfiniteSpiral';
import { infiniteSpiral } from '../../constants/code/Components/infiniteSpiralCode';

const DEMO_ITEMS = [
  {
    src: 'https://images.unsplash.com/photo-1781764177519-9c9c88733c3e?auto=format&fit=crop&w=900&q=80',
    alt: 'Photograph 1 by Eugene Golovesov'
  },
  {
    src: 'https://images.unsplash.com/photo-1774009485852-13a515d32e36?auto=format&fit=crop&w=900&q=80',
    alt: 'Photograph 2 by Eugene Golovesov'
  },
  {
    src: 'https://images.unsplash.com/photo-1705032033999-efa3082e1a4e?auto=format&fit=crop&w=900&q=80',
    alt: 'Photograph 3 by Eugene Golovesov'
  },
  {
    src: 'https://images.unsplash.com/photo-1709699714159-29bc3ac99486?auto=format&fit=crop&w=900&q=80',
    alt: 'Photograph 4 by Eugene Golovesov'
  },
  {
    src: 'https://images.unsplash.com/photo-1763440519433-5467759054fc?auto=format&fit=crop&w=900&q=80',
    alt: 'Photograph 5 by Eugene Golovesov'
  },
  {
    src: 'https://images.unsplash.com/photo-1724152312974-d4d48b8b36fd?auto=format&fit=crop&w=900&q=80',
    alt: 'Photograph 6 by Eugene Golovesov'
  },
  {
    src: 'https://images.unsplash.com/photo-1656651356997-71fcb0f04d3b?auto=format&fit=crop&w=900&q=80',
    alt: 'Photograph 7 by Eugene Golovesov'
  },
  {
    src: 'https://images.unsplash.com/photo-1636269603887-702d9a201bb4?auto=format&fit=crop&w=900&q=80',
    alt: 'Photograph 8 by Eugene Golovesov'
  },
  {
    src: 'https://images.unsplash.com/photo-1772440337285-8b5674e1ee8a?auto=format&fit=crop&w=900&q=80',
    alt: 'Photograph 9 by Eugene Golovesov'
  },
  {
    src: 'https://images.unsplash.com/photo-1762846818262-33c197852fa8?auto=format&fit=crop&w=900&q=80',
    alt: 'Photograph 10 by Eugene Golovesov'
  }
];

const DEFAULT_PROPS = {
  speed: 0.55,
  direction: 'up',
  animationMode: 'auto',
  radius: 170,
  cardWidth: 100,
  cardHeight: 100,
  verticalSpacing: 60,
  perspective: 1000,
  cardsPerTurn: 7,
  rotation: 0,
  cardTilt: 0,
  cardRadius: 10,
  centerScale: 1.2,
  edgeFade: 0.3,
  edgeBlur: 6,
  pauseOnHover: true,
  imageFit: 'cover',
  grayscale: 1
};

const DIRECTION_OPTIONS = [
  { value: 'up', label: 'Up' },
  { value: 'down', label: 'Down' }
];

const ANIMATION_MODE_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'drag', label: 'Drag' },
  { value: 'scroll', label: 'Scroll' },
  { value: 'all', label: 'All' }
];

const IMAGE_FIT_OPTIONS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' }
];

const InfiniteSpiralDemo = () => {
  const { props, updateProp, resetProps, hasChanges } = useComponentProps(DEFAULT_PROPS);

  const propData = useMemo(
    () => [
      {
        name: 'items',
        type: '(string | SpiralItem)[]',
        default: '[]',
        description: 'Images shown in the spiral. Objects may also include alt, href, target, label and id.'
      },
      {
        name: 'speed',
        type: 'number',
        default: '0.55',
        description: 'Automatic travel speed in cards per second and the sensitivity of scroll-controlled motion.'
      },
      { name: 'direction', type: '"up" | "down"', default: '"up"', description: 'Vertical travel direction.' },
      {
        name: 'animationMode',
        type: '"auto" | "drag" | "scroll" | "all"',
        default: '"auto"',
        description: 'Selects automatic motion, pointer dragging, page-scroll control or all interactions.'
      },
      { name: 'radius', type: 'number', default: '170', description: 'Depth radius of the helix in pixels.' },
      { name: 'cardWidth', type: 'number', default: '100', description: 'Card width in pixels.' },
      { name: 'cardHeight', type: 'number', default: '100', description: 'Card height in pixels.' },
      {
        name: 'verticalSpacing',
        type: 'number',
        default: '60',
        description: 'Vertical distance between neighboring cards.'
      },
      { name: 'perspective', type: 'number', default: '1000', description: 'CSS perspective applied to the 3D stage.' },
      {
        name: 'cardsPerTurn',
        type: 'number',
        default: '7',
        description: 'Number of cards used for one complete revolution.'
      },
      { name: 'rotation', type: 'number', default: '0', description: 'Global angular offset in degrees.' },
      { name: 'cardTilt', type: 'number', default: '0', description: 'Additional clockwise card tilt in degrees.' },
      { name: 'cardRadius', type: 'number', default: '10', description: 'Card corner radius in pixels.' },
      {
        name: 'centerScale',
        type: 'number',
        default: '1.2',
        description: 'Scale multiplier for cards nearest the center.'
      },
      {
        name: 'edgeFade',
        type: 'number',
        default: '0.3',
        description: 'Fraction of the outer travel range used for fading.'
      },
      { name: 'edgeBlur', type: 'number', default: '6', description: 'Maximum blur applied near the edges.' },
      {
        name: 'pauseOnHover',
        type: 'boolean',
        default: 'true',
        description: 'Smoothly eases automatic motion to a stop while the gallery is hovered.'
      },
      {
        name: 'imageFit',
        type: '"cover" | "contain"',
        default: '"cover"',
        description: 'Object fit used by every image.'
      },
      {
        name: 'grayscale',
        type: 'number',
        default: '0',
        description: 'Grayscale amount applied to every image, from 0 to 1.'
      },
      { name: 'className', type: 'string', default: '""', description: 'Additional class names for the root element.' }
    ],
    []
  );

  return (
    <ComponentPropsProvider props={props} defaultProps={DEFAULT_PROPS} resetProps={resetProps} hasChanges={hasChanges}>
      <TabsLayout>
        <PreviewTab>
          <Box position="relative" className="demo-container" h={620} p={0} overflow="hidden">
            <InfiniteSpiral items={DEMO_ITEMS} {...props} />
          </Box>

          <Customize>
            <PreviewSelect
              title="Animation Mode"
              options={ANIMATION_MODE_OPTIONS}
              value={props.animationMode}
              onChange={val => updateProp('animationMode', val)}
            />
            <PreviewSelect
              title="Direction"
              options={DIRECTION_OPTIONS}
              value={props.direction}
              onChange={val => updateProp('direction', val)}
            />
            <PreviewSelect
              title="Image Fit"
              options={IMAGE_FIT_OPTIONS}
              value={props.imageFit}
              onChange={val => updateProp('imageFit', val)}
            />
            <PreviewSlider
              title="Grayscale"
              min={0}
              max={1}
              step={0.05}
              value={props.grayscale}
              onChange={val => updateProp('grayscale', val)}
            />
            <PreviewSlider
              title="Speed"
              min={0}
              max={2}
              step={0.05}
              value={props.speed}
              onChange={val => updateProp('speed', val)}
            />
            <PreviewSlider
              title="Radius"
              min={100}
              max={420}
              step={5}
              value={props.radius}
              valueUnit="px"
              onChange={val => updateProp('radius', val)}
            />
            <PreviewSlider
              title="Card Width"
              min={80}
              max={260}
              step={4}
              value={props.cardWidth}
              valueUnit="px"
              onChange={val => updateProp('cardWidth', val)}
            />
            <PreviewSlider
              title="Card Height"
              min={60}
              max={200}
              step={4}
              value={props.cardHeight}
              valueUnit="px"
              onChange={val => updateProp('cardHeight', val)}
            />
            <PreviewSlider
              title="Spacing"
              min={24}
              max={120}
              step={2}
              value={props.verticalSpacing}
              valueUnit="px"
              onChange={val => updateProp('verticalSpacing', val)}
            />
            <PreviewSlider
              title="Perspective"
              min={500}
              max={1800}
              step={25}
              value={props.perspective}
              valueUnit="px"
              onChange={val => updateProp('perspective', val)}
            />
            <PreviewSlider
              title="Cards Per Turn"
              min={3}
              max={14}
              step={1}
              value={props.cardsPerTurn}
              onChange={val => updateProp('cardsPerTurn', val)}
            />
            <PreviewSlider
              title="Rotation"
              min={-180}
              max={180}
              step={2}
              value={props.rotation}
              valueUnit="deg"
              onChange={val => updateProp('rotation', val)}
            />
            <PreviewSlider
              title="Card Tilt"
              min={-30}
              max={30}
              step={1}
              value={props.cardTilt}
              valueUnit="deg"
              onChange={val => updateProp('cardTilt', val)}
            />
            <PreviewSlider
              title="Corner Radius"
              min={0}
              max={40}
              step={1}
              value={props.cardRadius}
              valueUnit="px"
              onChange={val => updateProp('cardRadius', val)}
            />
            <PreviewSlider
              title="Center Scale"
              min={0.8}
              max={1.6}
              step={0.02}
              value={props.centerScale}
              onChange={val => updateProp('centerScale', val)}
            />
            <PreviewSlider
              title="Edge Fade"
              min={0}
              max={0.8}
              step={0.02}
              value={props.edgeFade}
              onChange={val => updateProp('edgeFade', val)}
            />
            <PreviewSlider
              title="Edge Blur"
              min={0}
              max={10}
              step={0.25}
              value={props.edgeBlur}
              valueUnit="px"
              onChange={val => updateProp('edgeBlur', val)}
            />
            <PreviewSwitch
              title="Pause On Hover"
              isChecked={props.pauseOnHover}
              onChange={val => updateProp('pauseOnHover', val)}
            />
          </Customize>

          <PropTable data={propData} />
        </PreviewTab>

        <CodeTab>
          <CodeExample codeObject={infiniteSpiral} componentName="InfiniteSpiral" />
        </CodeTab>
      </TabsLayout>
    </ComponentPropsProvider>
  );
};

export default InfiniteSpiralDemo;
