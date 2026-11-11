import { useMemo } from 'react';
import { Box } from '@chakra-ui/react';
import { CodeTab, PreviewTab, TabsLayout } from '../../components/common/TabsLayout';
import useComponentProps from '../../hooks/useComponentProps';
import { ComponentPropsProvider } from '../../components/context/ComponentPropsContext';

import CodeExample from '../../components/code/CodeExample';
import Dependencies from '../../components/code/Dependencies';
import PropTable from '../../components/common/Preview/PropTable';
import Customize from '../../components/common/Preview/Customize';
import PreviewSlider from '../../components/common/Preview/PreviewSlider';
import PreviewSwitch from '../../components/common/Preview/PreviewSwitch';
import PreviewSelect from '../../components/common/Preview/PreviewSelect';
import PreviewColorPickerCustom from '../../components/common/Preview/PreviewColorPickerCustom';

import MorphSlider from '../../content/Components/MorphSlider/MorphSlider';
import { morphSlider } from '../../constants/code/Components/morphSliderCode';

const DEMO_ITEMS = [
  {
    image: 'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=1600&auto=format&fit=crop',
    caption: 'One'
  },
  {
    image: 'https://images.unsplash.com/photo-1781499455083-6ccc3beb20cd?q=80&w=1600&auto=format&fit=crop',
    caption: 'Two'
  },
  {
    image: 'https://images.unsplash.com/photo-1776394254711-4a0d7345269a?q=80&w=1600&auto=format&fit=crop',
    caption: 'Three'
  },
  {
    image: 'https://images.unsplash.com/photo-1781242629922-6f39cc3671cd?q=80&w=1600&auto=format&fit=crop',
    caption: 'Four'
  }
];

const TRANSITION_OPTIONS = [
  { value: 'melt', label: 'Melt' },
  { value: 'ripple', label: 'Ripple' },
  { value: 'shear', label: 'Shear' },
  { value: 'swirl', label: 'Swirl' }
];

const EASE_OPTIONS = [
  { value: 'power2.inOut', label: 'Smooth (power2.inOut)' },
  { value: 'power3.out', label: 'Expo Out (power3.out)' },
  { value: 'expo.inOut', label: 'Expo InOut' },
  { value: 'none', label: 'Linear' }
];

const DEFAULT_PROPS = {
  transition: 'melt',
  overlayColor: '#05060a',
  duration: 1.1,
  ease: 'power2.inOut',
  intensity: 0.55,
  scale: 2.4,
  aberration: 0.35,
  drift: 0.4,
  autoplay: false,
  autoplayDelay: 4,
  loop: true,
  radius: 16,
  showCaptions: true,
  showControls: true,
  showIndicators: true
};

const MorphSliderDemo = () => {
  const { props, updateProp, resetProps, hasChanges } = useComponentProps(DEFAULT_PROPS);
  const {
    transition,
    overlayColor,
    duration,
    ease,
    intensity,
    scale,
    aberration,
    drift,
    autoplay,
    autoplayDelay,
    loop,
    radius,
    showCaptions,
    showControls,
    showIndicators
  } = props;

  const propData = useMemo(
    () => [
      {
        name: 'items',
        type: 'Array<{ image: string; caption?: string }>',
        default: '[...]',
        description: 'Slides to morph between. Each item is an image URL with an optional caption.'
      },
      { name: 'startIndex', type: 'number', default: '0', description: 'Index of the slide shown on mount.' },
      {
        name: 'transition',
        type: '"melt" | "ripple" | "shear" | "swirl"',
        default: '"melt"',
        description: 'Character of the GPU displacement morph between slides.'
      },
      { name: 'duration', type: 'number', default: '1.1', description: 'Length of a full transition in seconds.' },
      {
        name: 'ease',
        type: 'string',
        default: '"power2.inOut"',
        description: 'GSAP easing curve used to drive the transition progress.'
      },
      {
        name: 'intensity',
        type: 'number',
        default: '0.55',
        description: 'Strength of the displacement — how far the images warp during the morph.'
      },
      {
        name: 'scale',
        type: 'number',
        default: '2.4',
        description: 'Frequency of the procedural noise field (affects the Melt transition most).'
      },
      {
        name: 'aberration',
        type: 'number',
        default: '0.35',
        description: 'Amount of RGB split that peaks mid-transition and resolves to zero.'
      },
      {
        name: 'drift',
        type: 'number',
        default: '0.4',
        description: 'Idle drift / breathing applied to the current image so it is never fully static.'
      },
      {
        name: 'autoplay',
        type: 'boolean',
        default: 'false',
        description: 'Advance slides automatically; pauses on hover.'
      },
      {
        name: 'autoplayDelay',
        type: 'number',
        default: '4',
        description: 'Seconds each slide holds before autoplay advances.'
      },
      {
        name: 'loop',
        type: 'boolean',
        default: 'true',
        description: 'Wrap around from the last slide back to the first.'
      },
      { name: 'radius', type: 'number', default: '16', description: 'Corner radius of the slider in pixels.' },
      {
        name: 'overlayColor',
        type: 'string',
        default: '"#000000"',
        description: 'Tint used for the subtle edge vignette over the images.'
      },
      {
        name: 'showCaptions',
        type: 'boolean',
        default: 'true',
        description: 'Show slide captions that animate in with each transition.'
      },
      {
        name: 'showControls',
        type: 'boolean',
        default: 'true',
        description: 'Show the previous / next arrow buttons.'
      },
      { name: 'showIndicators', type: 'boolean', default: 'true', description: 'Show the slide indicator dots.' },
      { name: 'className', type: 'string', default: '""', description: 'Additional CSS classes for the outer wrapper.' }
    ],
    []
  );

  return (
    <ComponentPropsProvider props={props} defaultProps={DEFAULT_PROPS} resetProps={resetProps} hasChanges={hasChanges}>
      <TabsLayout>
        <PreviewTab>
          <Box position="relative" className="demo-container" h={500} p={0} overflow="hidden">
            <MorphSlider {...props} items={DEMO_ITEMS} />
          </Box>

          <Customize>
            <PreviewSelect
              title="Transition"
              options={TRANSITION_OPTIONS}
              value={transition}
              onChange={val => updateProp('transition', val)}
              width={140}
            />
            <PreviewColorPickerCustom
              title="Overlay"
              color={overlayColor}
              onChange={val => updateProp('overlayColor', val)}
            />
            <PreviewSelect
              title="Ease"
              options={EASE_OPTIONS}
              value={ease}
              onChange={val => updateProp('ease', val)}
              width={200}
            />
            <PreviewSlider
              title="Duration"
              min={0.4}
              max={2.5}
              step={0.1}
              value={duration}
              valueUnit="s"
              onChange={val => updateProp('duration', val)}
            />
            <PreviewSlider
              title="Intensity"
              min={0}
              max={1.2}
              step={0.05}
              value={intensity}
              onChange={val => updateProp('intensity', val)}
            />
            <PreviewSlider
              title="Noise Scale"
              min={0.5}
              max={6}
              step={0.1}
              value={scale}
              onChange={val => updateProp('scale', val)}
            />
            <PreviewSlider
              title="Aberration"
              min={0}
              max={1}
              step={0.05}
              value={aberration}
              onChange={val => updateProp('aberration', val)}
            />
            <PreviewSlider
              title="Drift"
              min={0}
              max={1.5}
              step={0.05}
              value={drift}
              onChange={val => updateProp('drift', val)}
            />
            <PreviewSlider
              title="Autoplay Delay"
              min={1.5}
              max={8}
              step={0.5}
              value={autoplayDelay}
              valueUnit="s"
              onChange={val => updateProp('autoplayDelay', val)}
            />
            <PreviewSlider
              title="Radius"
              min={0}
              max={40}
              step={1}
              value={radius}
              valueUnit="px"
              onChange={val => updateProp('radius', val)}
            />
            <PreviewSwitch title="Autoplay" isChecked={autoplay} onChange={val => updateProp('autoplay', val)} />
            <PreviewSwitch title="Loop" isChecked={loop} onChange={val => updateProp('loop', val)} />
            <PreviewSwitch
              title="Captions"
              isChecked={showCaptions}
              onChange={val => updateProp('showCaptions', val)}
            />
            <PreviewSwitch
              title="Controls"
              isChecked={showControls}
              onChange={val => updateProp('showControls', val)}
            />
            <PreviewSwitch
              title="Indicators"
              isChecked={showIndicators}
              onChange={val => updateProp('showIndicators', val)}
            />
          </Customize>

          <PropTable data={propData} />
          <Dependencies dependencyList={['ogl', 'gsap']} />
        </PreviewTab>

        <CodeTab>
          <CodeExample codeObject={morphSlider} componentName="MorphSlider" />
        </CodeTab>
      </TabsLayout>
    </ComponentPropsProvider>
  );
};

export default MorphSliderDemo;
