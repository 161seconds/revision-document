import { useMemo } from 'react';
import { Box } from '@chakra-ui/react';
import { CodeTab, PreviewTab, TabsLayout } from '../../components/common/TabsLayout';
import useComponentProps from '../../hooks/useComponentProps';
import { ComponentPropsProvider } from '../../components/context/ComponentPropsContext';
import { useColorModeValue } from '../../components/setup/color-mode';

import CodeExample from '../../components/code/CodeExample';
import PropTable from '../../components/common/Preview/PropTable';
import Customize from '../../components/common/Preview/Customize';
import PreviewSlider from '../../components/common/Preview/PreviewSlider';
import PreviewSwitch from '../../components/common/Preview/PreviewSwitch';
import PreviewSelect from '../../components/common/Preview/PreviewSelect';
import PreviewColorPickerCustom from '../../components/common/Preview/PreviewColorPickerCustom';

import OptionWheel from '../../content/Components/OptionWheel/OptionWheel';
import { optionWheel } from '../../constants/code/Components/optionWheelCode';

const DEFAULT_PROPS = {
  textColor: '#a6a6a6',
  activeColor: '#ffffff',
  side: 'left',
  fontSize: 3,
  spacing: 1.4,
  curve: 1,
  tilt: 6,
  blur: 2,
  fade: 0.25,
  smoothing: 200,
  inset: 80,
  loop: false,
  draggable: true,
  soundUrl: '/assets/sounds/click-soft.mp3',
  soundVolume: 0.5
};

const DEMO_ITEMS = ['Ambient', 'House', 'Techno', 'Jazz', 'Lo-Fi', 'Synthwave', 'Trance', 'Funk', 'Disco', 'Hip-Hop', 'Chillwave', 'Drum & Bass'];

const SIDE_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' }
];

const OptionWheelDemo = () => {
  const { props, updateProp, resetProps, hasChanges } = useComponentProps(DEFAULT_PROPS);
  const { textColor, activeColor, side, fontSize, spacing, curve, tilt, blur, fade, smoothing, inset, loop, draggable, soundUrl, soundVolume } =
    props;
  const renderedTextColor = useColorModeValue(textColor === DEFAULT_PROPS.textColor ? '#71717a' : textColor, textColor);
  const renderedActiveColor = useColorModeValue(activeColor === DEFAULT_PROPS.activeColor ? '#18181b' : activeColor, activeColor);

  const propData = useMemo(
    () => [
      { name: 'items', type: 'string[]', default: '[...]', description: 'Labels rendered as the wheel options.' },
      { name: 'defaultSelected', type: 'number', default: '3', description: 'Index of the option selected on mount.' },
      { name: 'onChange', type: '(index, item) => void', default: '-', description: 'Called whenever the wheel settles on a new option.' },
      { name: 'textColor', type: 'string', default: '"#a6a6a6"', description: 'Resting color of the option labels.' },
      { name: 'activeColor', type: 'string', default: '"#ffffff"', description: 'Color an option blends toward as it reaches the middle of the wheel.' },
      { name: 'side', type: '"left" | "right"', default: '"left"', description: 'Edge of the container the wheel curves around.' },
      { name: 'fontSize', type: 'number', default: '3', description: 'Font size of the option labels in rem.' },
      { name: 'spacing', type: 'number', default: '1.4', description: 'Vertical distance between options as a multiple of the font size.' },
      { name: 'curve', type: 'number', default: '1', description: 'Depth of the circular curve; 0 flattens the wheel into a straight list.' },
      { name: 'tilt', type: 'number', default: '6', description: 'Angle in degrees between neighboring options; higher values curl the wheel tighter.' },
      { name: 'blur', type: 'number', default: '2', description: 'Blur in pixels added per step away from the middle.' },
      { name: 'fade', type: 'number', default: '0.25', description: 'Opacity lost per step away from the middle.' },
      { name: 'minOpacity', type: 'number', default: '0.05', description: 'Opacity floor for the furthest options.' },
      { name: 'smoothing', type: 'number', default: '200', description: 'Easing time constant in milliseconds; higher values feel heavier.' },
      { name: 'inset', type: 'number', default: '80', description: 'Padding in pixels between the anchored edge and the centered option.' },
      { name: 'loop', type: 'boolean', default: 'false', description: 'Wrap around infinitely instead of stopping at the first and last option.' },
      { name: 'draggable', type: 'boolean', default: 'true', description: 'Allow dragging the wheel with a pointer, in addition to scroll and arrow keys.' },
      { name: 'soundUrl', type: 'string', default: '""', description: 'URL of a short tick sound played when the selection changes; empty disables it.' },
      { name: 'soundVolume', type: 'number', default: '0.5', description: 'Playback volume of the tick sound.' },
      { name: 'className', type: 'string', default: '""', description: 'Additional CSS classes for the outer wrapper.' }
    ],
    []
  );

  return (
    <ComponentPropsProvider props={props} defaultProps={DEFAULT_PROPS} resetProps={resetProps} hasChanges={hasChanges}>
      <TabsLayout>
        <PreviewTab>
          <Box position="relative" className="demo-container" h={500} p={0} overflow="hidden">
            <OptionWheel {...props} items={DEMO_ITEMS} textColor={renderedTextColor} activeColor={renderedActiveColor} />
          </Box>

          <Customize>
            <PreviewColorPickerCustom title="Text" color={renderedTextColor} onChange={val => updateProp('textColor', val)} />
            <PreviewColorPickerCustom title="Active" color={renderedActiveColor} onChange={val => updateProp('activeColor', val)} />
            <PreviewSelect title="Side" options={SIDE_OPTIONS} value={side} onChange={val => updateProp('side', val)} width={120} />
            <PreviewSlider title="Font Size" min={1.5} max={5} step={0.1} value={fontSize} valueUnit="rem" onChange={val => updateProp('fontSize', val)} />
            <PreviewSlider title="Spacing" min={1} max={2.5} step={0.05} value={spacing} onChange={val => updateProp('spacing', val)} />
            <PreviewSlider title="Curve" min={0} max={2} step={0.05} value={curve} onChange={val => updateProp('curve', val)} />
            <PreviewSlider title="Tilt" min={0} max={15} step={0.5} value={tilt} valueUnit="deg" onChange={val => updateProp('tilt', val)} />
            <PreviewSlider title="Blur" min={0} max={6} step={0.25} value={blur} valueUnit="px" onChange={val => updateProp('blur', val)} />
            <PreviewSlider title="Fade" min={0} max={0.5} step={0.01} value={fade} onChange={val => updateProp('fade', val)} />
            <PreviewSlider title="Smoothing" min={50} max={800} step={10} value={smoothing} valueUnit="ms" onChange={val => updateProp('smoothing', val)} />
            <PreviewSlider title="Inset" min={0} max={240} step={4} value={inset} valueUnit="px" onChange={val => updateProp('inset', val)} />
            <PreviewSlider title="Sound Volume" min={0} max={1} step={0.05} value={soundVolume} onChange={val => updateProp('soundVolume', val)} />
            <PreviewSwitch title="Loop" isChecked={loop} onChange={val => updateProp('loop', val)} />
            <PreviewSwitch title="Draggable" isChecked={draggable} onChange={val => updateProp('draggable', val)} />
            <PreviewSwitch
              title="Sound"
              isChecked={!!soundUrl}
              onChange={val => updateProp('soundUrl', val ? '/assets/sounds/click-soft.mp3' : '')}
            />
          </Customize>

          <PropTable data={propData} />
        </PreviewTab>

        <CodeTab>
          <CodeExample codeObject={optionWheel} componentName="OptionWheel" />
        </CodeTab>
      </TabsLayout>
    </ComponentPropsProvider>
  );
};

export default OptionWheelDemo;
