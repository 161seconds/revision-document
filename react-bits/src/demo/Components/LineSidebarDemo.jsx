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

import LineSidebar from '../../content/Components/LineSidebar/LineSidebar';
import { lineSidebar } from '../../constants/code/Components/lineSidebarCode';

const DEFAULT_PROPS = {
  accentColor: '#A855F7',
  textColor: '#c4c4c4',
  markerColor: '#6c6c6c',
  showIndex: true,
  showMarker: true,
  proximityRadius: 100,
  maxShift: 30,
  falloff: 'smooth',
  markerLength: 60,
  markerGap: 0,
  tickScale: 0.5,
  scaleTick: true,
  itemGap: 20,
  fontSize: 1.1,
  smoothing: 100
};

const DEMO_ITEMS = ['Overview', 'Components', 'Animations', 'Backgrounds', 'Showcase', 'Playground', 'Templates', 'Changelog'];

const FALLOFF_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'smooth', label: 'Smooth' },
  { value: 'sharp', label: 'Sharp' }
];

const LineSidebarDemo = () => {
  const { props, updateProp, resetProps, hasChanges } = useComponentProps(DEFAULT_PROPS);
  const {
    accentColor,
    textColor,
    markerColor,
    showIndex,
    showMarker,
    proximityRadius,
    maxShift,
    falloff,
    markerLength,
    markerGap,
    tickScale,
    scaleTick,
    itemGap,
    fontSize,
    smoothing
  } = props;
  const renderedTextColor = useColorModeValue(textColor === DEFAULT_PROPS.textColor ? '#52525b' : textColor, textColor);
  const renderedMarkerColor = useColorModeValue(markerColor === DEFAULT_PROPS.markerColor ? '#a1a1aa' : markerColor, markerColor);
  const propData = useMemo(
    () => [
      { name: 'items', type: 'string[]', default: '[...]', description: 'Labels rendered as the list of sidebar entries.' },
      { name: 'accentColor', type: 'string', default: '"#A855F7"', description: 'Color items and markers shift toward as the cursor gets close.' },
      { name: 'textColor', type: 'string', default: '"#c4c4c4"', description: 'Resting color of the item labels.' },
      { name: 'markerColor', type: 'string', default: '"#6c6c6c"', description: 'Resting color of the leading marker lines.' },
      { name: 'showIndex', type: 'boolean', default: 'true', description: 'Show the zero-padded index before each label.' },
      { name: 'showMarker', type: 'boolean', default: 'true', description: 'Show the marker lines (and short ticks) beside each item.' },
      { name: 'proximityRadius', type: 'number', default: '100', description: 'Vertical distance in pixels within which the cursor influences an item.' },
      { name: 'maxShift', type: 'number', default: '30', description: 'Maximum horizontal shift in pixels the label slides at full proximity.' },
      { name: 'falloff', type: '"linear" | "smooth" | "sharp"', default: '"smooth"', description: 'Curve mapping cursor distance to the proximity effect.' },
      { name: 'markerLength', type: 'number', default: '60', description: 'Length in pixels of the marker line; the in-between ticks scale from this too.' },
      { name: 'markerGap', type: 'number', default: '0', description: 'Gap in pixels between the labels and the markers.' },
      { name: 'tickScale', type: 'number', default: '0.5', description: 'Length of the in-between ticks as a fraction of markerLength.' },
      { name: 'scaleTick', type: 'boolean', default: 'true', description: 'When true, the in-between ticks also grow with cursor proximity.' },
      { name: 'itemGap', type: 'number', default: '20', description: 'Vertical gap between items in pixels.' },
      { name: 'fontSize', type: 'number', default: '1.1', description: 'Font size of the labels in rem.' },
      { name: 'smoothing', type: 'number', default: '100', description: 'Transition duration in milliseconds for the proximity response.' },
      { name: 'defaultActive', type: 'number | null', default: 'null', description: 'Index of the item selected on mount.' },
      { name: 'onItemClick', type: '(index, label) => void', default: '-', description: 'Called when an item is clicked; the clicked item also becomes active.' },
      { name: 'className', type: 'string', default: '""', description: 'Additional CSS classes for the outer wrapper.' }
    ],
    []
  );

  return (
    <ComponentPropsProvider props={props} defaultProps={DEFAULT_PROPS} resetProps={resetProps} hasChanges={hasChanges}>
      <TabsLayout>
        <PreviewTab>
          <Box position="relative" className="demo-container" h={500} overflow="hidden" display="flex" alignItems="center" justifyContent="flex-start" pl={{ base: 6, md: 12 }} py={12}>
            <LineSidebar {...props} items={DEMO_ITEMS} textColor={renderedTextColor} markerColor={renderedMarkerColor} />
          </Box>

          <Customize>
            <PreviewColorPickerCustom title="Accent" color={accentColor} onChange={val => updateProp('accentColor', val)} />
            <PreviewColorPickerCustom title="Text" color={renderedTextColor} onChange={val => updateProp('textColor', val)} />
            <PreviewColorPickerCustom title="Marker" color={renderedMarkerColor} onChange={val => updateProp('markerColor', val)} />
            <PreviewSelect title="Falloff" options={FALLOFF_OPTIONS} value={falloff} onChange={val => updateProp('falloff', val)} width={140} />
            <PreviewSlider title="Proximity Radius" min={40} max={280} step={5} value={proximityRadius} valueUnit="px" onChange={val => updateProp('proximityRadius', val)} />
            <PreviewSlider title="Max Shift" min={0} max={60} step={1} value={maxShift} valueUnit="px" onChange={val => updateProp('maxShift', val)} />
            <PreviewSlider title="Marker Length" min={20} max={200} step={5} value={markerLength} valueUnit="px" onChange={val => updateProp('markerLength', val)} />
            <PreviewSlider title="Marker Gap" min={0} max={60} step={1} value={markerGap} valueUnit="px" onChange={val => updateProp('markerGap', val)} />
            <PreviewSlider title="Tick Scale" min={0} max={1} step={0.02} value={tickScale} onChange={val => updateProp('tickScale', val)} />
            <PreviewSlider title="Item Gap" min={4} max={48} step={1} value={itemGap} valueUnit="px" onChange={val => updateProp('itemGap', val)} />
            <PreviewSlider title="Font Size" min={0.8} max={2} step={0.05} value={fontSize} valueUnit="rem" onChange={val => updateProp('fontSize', val)} />
            <PreviewSlider title="Smoothing" min={0} max={800} step={20} value={smoothing} valueUnit="ms" onChange={val => updateProp('smoothing', val)} />
            <PreviewSwitch title="Show Index" isChecked={showIndex} onChange={val => updateProp('showIndex', val)} />
            <PreviewSwitch title="Show Marker" isChecked={showMarker} onChange={val => updateProp('showMarker', val)} />
            <PreviewSwitch title="Scale Ticks" isChecked={scaleTick} onChange={val => updateProp('scaleTick', val)} />
          </Customize>

          <PropTable data={propData} />
        </PreviewTab>

        <CodeTab>
          <CodeExample codeObject={lineSidebar} componentName="LineSidebar" />
        </CodeTab>
      </TabsLayout>
    </ComponentPropsProvider>
  );
};

export default LineSidebarDemo;
