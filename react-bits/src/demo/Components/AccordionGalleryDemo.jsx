import { Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { CodeTab, PreviewTab, TabsLayout } from '../../components/common/TabsLayout';

import CodeExample from '../../components/code/CodeExample';
import Dependencies from '../../components/code/Dependencies';
import Customize from '../../components/common/Preview/Customize';
import PreviewSlider from '../../components/common/Preview/PreviewSlider';
import PreviewSelect from '../../components/common/Preview/PreviewSelect';
import PreviewSwitch from '../../components/common/Preview/PreviewSwitch';
import PreviewColorPickerCustom from '../../components/common/Preview/PreviewColorPickerCustom';
import PropTable from '../../components/common/Preview/PropTable';
import useComponentProps from '../../hooks/useComponentProps';
import { ComponentPropsProvider } from '../../components/context/ComponentPropsContext';

import { accordionGallery } from '../../constants/code/Components/accordionGalleryCode';
import AccordionGallery from '../../content/Components/AccordionGallery/AccordionGallery';

const ITEMS = [
  { image: 'https://picsum.photos/id/1015/900/1200', label: 'Canyon', link: '#' },
  { image: 'https://picsum.photos/id/1018/900/1200', label: 'Ridgeline', link: '#' },
  { image: 'https://picsum.photos/id/1039/900/1200', label: 'Falls', link: '#' },
  { image: 'https://picsum.photos/id/1043/900/1200', label: 'Harbour', link: '#' },
  { image: 'https://picsum.photos/id/1044/900/1200', label: 'Skyline', link: '#' }
];

const DEFAULT_PROPS = {
  defaultIndex: 2,
  accentColor: '#ffffff',
  overlayColor: '#060010',
  textColor: '#ffffff',
  grayscale: true,
  showLabels: true,
  duration: 0.6,
  ease: 'power3.out',
  parallax: 0.5,
  tilt: 8,
  stagger: 0.06,
  trigger: 'hover',
  height: 460,
  gap: 10,
  radius: 16,
  expandRatio: 0.52,
  orientation: 'horizontal'
};

const easeOptions = [
  { value: 'power2.inOut', label: 'power2.inOut' },
  { value: 'power3.out', label: 'power3.out' },
  { value: 'power4.out', label: 'power4.out' },
  { value: 'expo.out', label: 'expo.out' },
  { value: 'back.out', label: 'back.out' },
  { value: 'sine.inOut', label: 'sine.inOut' }
];

const triggerOptions = [
  { value: 'hover', label: 'Hover' },
  { value: 'click', label: 'Click' }
];

const orientationOptions = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' }
];

const AccordionGalleryDemo = () => {
  const { props, updateProp, resetProps, hasChanges } = useComponentProps(DEFAULT_PROPS);
  const {
    defaultIndex,
    accentColor,
    overlayColor,
    textColor,
    grayscale,
    showLabels,
    duration,
    ease,
    parallax,
    tilt,
    stagger,
    trigger,
    height,
    gap,
    radius,
    expandRatio,
    orientation
  } = props;

  const propData = useMemo(
    () => [
      {
        name: 'items',
        type: 'Array<{ image: string; label?: string; link?: string; alt?: string }>',
        default: '5 sample panels',
        description: 'The panels to render. Each needs an image, and optionally a label, link and alt text.'
      },
      {
        name: 'defaultIndex',
        type: 'number',
        default: '2',
        description: 'Index of the panel that is expanded on load, so the gallery never looks dead.'
      },
      {
        name: 'accentColor',
        type: 'string',
        default: '"#ffffff"',
        description: 'Colour of the caption accent bar and the focus ring.'
      },
      {
        name: 'overlayColor',
        type: 'string',
        default: '"#060010"',
        description: 'Colour used for the bottom legibility gradient and the dimming of collapsed panels.'
      },
      {
        name: 'textColor',
        type: 'string',
        default: '"#ffffff"',
        description: 'Colour of the caption text.'
      },
      {
        name: 'grayscale',
        type: 'boolean',
        default: 'true',
        description: 'Desaturate collapsed panels and restore full colour on the expanded one.'
      },
      {
        name: 'showLabels',
        type: 'boolean',
        default: 'true',
        description: 'Whether captions reveal on the expanded panel.'
      },
      {
        name: 'duration',
        type: 'number',
        default: '0.6',
        description: 'Duration of the expand / collapse transition in seconds.'
      },
      {
        name: 'ease',
        type: 'string',
        default: '"power3.out"',
        description: 'GSAP easing used for every transition.'
      },
      {
        name: 'parallax',
        type: 'number',
        default: '0.5',
        description: 'Strength of the internal image drift as panels resize (0 disables it).'
      },
      {
        name: 'tilt',
        type: 'number',
        default: '8',
        description: 'Degrees of 3D rotation applied to collapsed panels, easing to flat on the open one.'
      },
      {
        name: 'stagger',
        type: 'number',
        default: '0.06',
        description: 'Delay between the caption bar and text reveal, in seconds.'
      },
      {
        name: 'trigger',
        type: '"hover" | "click"',
        default: '"hover"',
        description: 'How a panel expands on pointer devices. Focus and tap always expand too.'
      },
      {
        name: 'height',
        type: 'number',
        default: '460',
        description: 'Height of the row in pixels (width of the column when vertical).'
      },
      {
        name: 'gap',
        type: 'number',
        default: '10',
        description: 'Gap between panels in pixels.'
      },
      {
        name: 'radius',
        type: 'number',
        default: '16',
        description: 'Corner radius of each panel in pixels.'
      },
      {
        name: 'expandRatio',
        type: 'number',
        default: '0.52',
        description: 'Fraction of the row the expanded panel occupies (0.2 – 0.9).'
      },
      {
        name: 'orientation',
        type: '"horizontal" | "vertical"',
        default: '"horizontal"',
        description: 'Lay the accordion out as a row or a column.'
      }
    ],
    []
  );

  return (
    <ComponentPropsProvider props={props} defaultProps={DEFAULT_PROPS} resetProps={resetProps} hasChanges={hasChanges}>
      <TabsLayout>
        <PreviewTab>
          <Box position="relative" className="demo-container" h={560} p={6} overflow="hidden">
            <AccordionGallery
              items={ITEMS}
              defaultIndex={defaultIndex}
              accentColor={accentColor}
              overlayColor={overlayColor}
              textColor={textColor}
              grayscale={grayscale}
              showLabels={showLabels}
              duration={duration}
              ease={ease}
              parallax={parallax}
              tilt={tilt}
              stagger={stagger}
              trigger={trigger}
              height={height}
              gap={gap}
              radius={radius}
              expandRatio={expandRatio}
              orientation={orientation}
            />
          </Box>

          <Customize>
            <PreviewColorPickerCustom
              title="Accent Color"
              color={accentColor}
              onChange={v => updateProp('accentColor', v)}
            />
            <PreviewColorPickerCustom
              title="Overlay Color"
              color={overlayColor}
              onChange={v => updateProp('overlayColor', v)}
            />
            <PreviewColorPickerCustom title="Text Color" color={textColor} onChange={v => updateProp('textColor', v)} />

            <PreviewSlider
              title="Default Index"
              min={0}
              max={ITEMS.length - 1}
              step={1}
              value={defaultIndex}
              onChange={val => updateProp('defaultIndex', val)}
            />

            <PreviewSwitch title="Grayscale" isChecked={grayscale} onChange={val => updateProp('grayscale', val)} />
            <PreviewSwitch title="Show Labels" isChecked={showLabels} onChange={val => updateProp('showLabels', val)} />

            <PreviewSelect
              title="Trigger"
              options={triggerOptions}
              value={trigger}
              width={120}
              onChange={val => updateProp('trigger', val)}
            />

            <PreviewSelect
              title="Ease"
              options={easeOptions}
              value={ease}
              width={140}
              onChange={val => updateProp('ease', val)}
            />

            <PreviewSlider
              title="Duration"
              min={0.2}
              max={1.2}
              step={0.05}
              value={duration}
              valueUnit="s"
              width={150}
              onChange={val => updateProp('duration', val)}
            />

            <PreviewSlider
              title="Parallax"
              min={0}
              max={1.5}
              step={0.05}
              value={parallax}
              width={150}
              onChange={val => updateProp('parallax', val)}
            />

            <PreviewSlider
              title="Tilt"
              min={0}
              max={20}
              step={1}
              value={tilt}
              valueUnit="°"
              width={150}
              onChange={val => updateProp('tilt', val)}
            />

            <PreviewSlider
              title="Stagger"
              min={0}
              max={0.15}
              step={0.01}
              value={stagger}
              valueUnit="s"
              width={150}
              onChange={val => updateProp('stagger', val)}
            />

            <PreviewSelect
              title="Orientation"
              options={orientationOptions}
              value={orientation}
              width={130}
              onChange={val => updateProp('orientation', val)}
            />

            <PreviewSlider
              title="Height"
              min={320}
              max={560}
              step={10}
              value={height}
              valueUnit="px"
              width={150}
              onChange={val => updateProp('height', val)}
            />

            <PreviewSlider
              title="Expand Ratio"
              min={0.3}
              max={0.8}
              step={0.02}
              value={expandRatio}
              width={150}
              onChange={val => updateProp('expandRatio', val)}
            />

            <PreviewSlider
              title="Gap"
              min={0}
              max={30}
              step={1}
              value={gap}
              valueUnit="px"
              width={150}
              onChange={val => updateProp('gap', val)}
            />

            <PreviewSlider
              title="Radius"
              min={0}
              max={40}
              step={1}
              value={radius}
              valueUnit="px"
              width={150}
              onChange={val => updateProp('radius', val)}
            />
          </Customize>

          <PropTable data={propData} />
          <Dependencies dependencyList={['gsap']} />
        </PreviewTab>

        <CodeTab>
          <CodeExample codeObject={accordionGallery} componentName="AccordionGallery" />
        </CodeTab>
      </TabsLayout>
    </ComponentPropsProvider>
  );
};

export default AccordionGalleryDemo;
