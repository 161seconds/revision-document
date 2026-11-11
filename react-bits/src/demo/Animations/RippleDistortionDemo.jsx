import { useMemo } from 'react';
import { CodeTab, PreviewTab, TabsLayout } from '../../components/common/TabsLayout';
import { Box } from '@chakra-ui/react';

import useComponentProps from '../../hooks/useComponentProps';
import { ComponentPropsProvider } from '../../components/context/ComponentPropsContext';
import Customize from '../../components/common/Preview/Customize';
import PreviewSelect from '../../components/common/Preview/PreviewSelect';
import PreviewSlider from '../../components/common/Preview/PreviewSlider';
import PreviewSwitch from '../../components/common/Preview/PreviewSwitch';
import PreviewColorPickerCustom from '../../components/common/Preview/PreviewColorPickerCustom';
import CodeExample from '../../components/code/CodeExample';
import PropTable from '../../components/common/Preview/PropTable';
import Dependencies from '../../components/code/Dependencies';
import RefreshButton from '@/components/common/Preview/RefreshButton';
import useForceRerender from '@/hooks/useForceRerender';

import RippleDistortion from '@/content/Animations/RippleDistortion/RippleDistortion';
import { rippleDistortion } from '@/constants/code/Animations/rippleDistortionCode';

const DEFAULT_PROPS = {
  brushSize: 150,
  strength: 0.2,
  swirl: 1,
  rings: 4,
  spread: 5,
  fade: 3,
  spacing: 15,
  dispersion: 0,
  glint: 0,
  tint: '#a855f7',
  tintAmount: 0.1,
  grayscale: true,
  highlightColor: '#ffffff',
  trigger: 'hover',
  clickStrength: 2,
  quality: 'low',
  enabled: true
};

const RippleDistortionDemo = () => {
  const [key, forceRerender] = useForceRerender();
  const { props, updateProp, resetProps, hasChanges } = useComponentProps(DEFAULT_PROPS);
  const {
    brushSize,
    strength,
    swirl,
    rings,
    spread,
    fade,
    spacing,
    dispersion,
    glint,
    tint,
    tintAmount,
    grayscale,
    highlightColor,
    trigger,
    clickStrength,
    quality,
    enabled
  } = props;

  const triggerOptions = [
    { label: 'Hover', value: 'hover' },
    { label: 'Click', value: 'click' },
    { label: 'Both', value: 'both' }
  ];

  const qualityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' }
  ];

  const propData = useMemo(
    () => [
      {
        name: 'src',
        type: 'string',
        default: "'https://images.unsplash.com/...'",
        description: 'Image URL the ripples distort. Cover fitted to the container.'
      },
      {
        name: 'brushSize',
        type: 'number',
        default: '150',
        description: 'Diameter of each ripple the pointer lays down, in px.'
      },
      {
        name: 'strength',
        type: 'number',
        default: '0.2',
        description: 'How far the image is pushed, as a fraction of its size.'
      },
      {
        name: 'swirl',
        type: 'number',
        default: '1',
        description:
          'Full turns the push direction sweeps through as a ripple builds. 0 gives a flat push, higher folds the image into caustics.'
      },
      {
        name: 'rings',
        type: 'number',
        default: '4',
        description: 'Concentric swells inside each ripple. 0 is a single plain blob.'
      },
      {
        name: 'spread',
        type: 'number',
        default: '5',
        description: 'How many times its own size a ripple grows to before it dies.'
      },
      { name: 'fade', type: 'number', default: '3', description: 'How long a ripple survives, in seconds.' },
      {
        name: 'spacing',
        type: 'number',
        default: '15',
        description: 'Pointer travel between ripples, in px. Higher leaves a sparser trail.'
      },
      {
        name: 'dispersion',
        type: 'number',
        default: '0',
        description: 'Chromatic split between the red and blue channels as they refract.'
      },
      { name: 'glint', type: 'number', default: '0', description: 'Sheen riding the shoulders of each ripple.' },
      { name: 'tint', type: 'string', default: '#a855f7', description: 'Colour the disturbed water takes on.' },
      {
        name: 'tintAmount',
        type: 'number',
        default: '0.1',
        description: 'How strongly the tint colours the disturbed water.'
      },
      { name: 'highlightColor', type: 'string', default: '#ffffff', description: 'Colour of the sheen.' },
      {
        name: 'grayscale',
        type: 'boolean',
        default: 'true',
        description: 'Drain the colour out of the image so the folds read on tone alone.'
      },
      {
        name: 'trigger',
        type: "'hover' | 'click' | 'both'",
        default: "'hover'",
        description: 'What disturbs the surface: motion, clicks, or both.'
      },
      {
        name: 'clickStrength',
        type: 'number',
        default: '2',
        description: 'How much larger a click ripple starts than a hover one.'
      },
      {
        name: 'quality',
        type: "'low' | 'medium' | 'high'",
        default: "'low'",
        description: 'Resolution of the displacement buffer. Lower trades crispness for fill rate.'
      },
      { name: 'enabled', type: 'boolean', default: 'true', description: 'Toggle the effect on or off.' },
      { name: 'className', type: 'string', default: "''", description: 'Extra classes on the container.' }
    ],
    []
  );

  return (
    <ComponentPropsProvider props={props} defaultProps={DEFAULT_PROPS} resetProps={resetProps} hasChanges={hasChanges}>
      <TabsLayout>
        <PreviewTab>
          <Box className="demo-container" h={500} p={0} overflow="hidden" position="relative">
            <Box position="relative" w="100%" h="100%">
              <RippleDistortion
                key={`${key}-${quality}`}
                brushSize={brushSize}
                strength={strength}
                swirl={swirl}
                rings={rings}
                spread={spread}
                fade={fade}
                spacing={spacing}
                dispersion={dispersion}
                glint={glint}
                tint={tint}
                tintAmount={tintAmount}
                grayscale={grayscale}
                highlightColor={highlightColor}
                trigger={trigger}
                clickStrength={clickStrength}
                quality={quality}
                enabled={enabled}
              />
            </Box>
            <RefreshButton onClick={forceRerender} />
          </Box>

          <Customize>
            <PreviewSlider
              title="Brush Size"
              min={40}
              max={260}
              step={5}
              value={brushSize}
              valueUnit="px"
              onChange={v => updateProp('brushSize', v)}
            />
            <PreviewSlider
              title="Strength"
              min={0.01}
              max={0.3}
              step={0.005}
              value={strength}
              onChange={v => updateProp('strength', v)}
            />
            <PreviewSlider
              title="Swirl"
              min={0}
              max={3}
              step={0.05}
              value={swirl}
              onChange={v => updateProp('swirl', v)}
            />
            <PreviewSlider
              title="Rings"
              min={0}
              max={5}
              step={0.25}
              value={rings}
              onChange={v => updateProp('rings', v)}
            />
            <PreviewSlider
              title="Spread"
              min={1}
              max={10}
              step={0.25}
              value={spread}
              onChange={v => updateProp('spread', v)}
            />
            <PreviewSlider
              title="Fade"
              min={0.5}
              max={5}
              step={0.1}
              value={fade}
              valueUnit="s"
              onChange={v => updateProp('fade', v)}
            />
            <PreviewSlider
              title="Spacing"
              min={1}
              max={40}
              step={1}
              value={spacing}
              valueUnit="px"
              onChange={v => updateProp('spacing', v)}
            />
            <PreviewSlider
              title="Click Strength"
              min={1}
              max={4}
              step={0.1}
              value={clickStrength}
              onChange={v => updateProp('clickStrength', v)}
            />

            <PreviewSlider
              title="Dispersion"
              min={0}
              max={1}
              step={0.05}
              value={dispersion}
              onChange={v => updateProp('dispersion', v)}
            />
            <PreviewSlider
              title="Glint"
              min={0}
              max={1.5}
              step={0.05}
              value={glint}
              onChange={v => updateProp('glint', v)}
            />
            <PreviewSlider
              title="Tint Amount"
              min={0}
              max={0.6}
              step={0.02}
              value={tintAmount}
              onChange={v => updateProp('tintAmount', v)}
            />
            <PreviewColorPickerCustom title="Tint" color={tint} onChange={val => updateProp('tint', val)} />
            <PreviewColorPickerCustom
              title="Highlight"
              color={highlightColor}
              onChange={val => updateProp('highlightColor', val)}
            />

            <PreviewSelect
              title="Trigger"
              options={triggerOptions}
              value={trigger}
              onChange={v => updateProp('trigger', v)}
              width={110}
            />
            <PreviewSelect
              title="Quality"
              options={qualityOptions}
              value={quality}
              onChange={v => updateProp('quality', v)}
              width={110}
            />
            <PreviewSwitch title="Grayscale" isChecked={grayscale} onChange={v => updateProp('grayscale', v)} />
            <PreviewSwitch title="Enabled" isChecked={enabled} onChange={v => updateProp('enabled', v)} />
          </Customize>

          <PropTable data={propData} />
          <Dependencies dependencyList={['ogl']} />
        </PreviewTab>

        <CodeTab>
          <CodeExample codeObject={rippleDistortion} componentName="RippleDistortion" />
        </CodeTab>
      </TabsLayout>
    </ComponentPropsProvider>
  );
};

export default RippleDistortionDemo;
