import { useMemo } from 'react';
import { CodeTab, PreviewTab, TabsLayout } from '../../components/common/TabsLayout';
import { Box } from '@chakra-ui/react';

import useComponentProps from '../../hooks/useComponentProps';
import { ComponentPropsProvider } from '../../components/context/ComponentPropsContext';
import Customize from '../../components/common/Preview/Customize';
import CodeExample from '../../components/code/CodeExample';

import PropTable from '../../components/common/Preview/PropTable';
import Dependencies from '../../components/code/Dependencies';
import PreviewSelect from '../../components/common/Preview/PreviewSelect';
import PreviewSlider from '../../components/common/Preview/PreviewSlider';
import PreviewSwitch from '../../components/common/Preview/PreviewSwitch';
import PreviewColorPickerCustom from '../../components/common/Preview/PreviewColorPickerCustom';

import { driftWall } from '../../constants/code/Components/driftWallCode';
import DriftWall from '../../content/Components/DriftWall/DriftWall';

const IMAGE_IDS = [1015, 1025, 1039, 1043, 1044, 1050, 1062, 1069, 1074, 1080, 1084, 106, 110, 133, 164, 177];

const items = IMAGE_IDS.map((id, i) => ({
  image: `https://picsum.photos/id/${id}/600/400`,
  title: `Tile ${i + 1}`,
  href: 'https://reactbits.dev'
}));

const DEFAULT_PROPS = {
  columns: 5,
  tileWidth: 200,
  tileHeight: 132,
  gap: 18,
  radius: 14,
  tilt: 16,
  turn: -14,
  roll: 0,
  perspective: 1200,
  depth: 120,
  speed: 42,
  direction: 'up',
  variance: 0.45,
  parallax: 0.6,
  pauseOnHover: false,
  lift: 64,
  fade: 0.6,
  dim: 0.55,
  grayscale: false,
  overlayColor: '#060010'
};

const DriftWallDemo = () => {
  const { props, updateProp, resetProps, hasChanges } = useComponentProps(DEFAULT_PROPS);
  const {
    columns,
    tileWidth,
    tileHeight,
    gap,
    radius,
    tilt,
    turn,
    roll,
    perspective,
    depth,
    speed,
    direction,
    variance,
    parallax,
    pauseOnHover,
    lift,
    fade,
    dim,
    grayscale,
    overlayColor
  } = props;

  const directionOptions = [
    { value: 'up', label: 'Up' },
    { value: 'down', label: 'Down' }
  ];

  const propData = useMemo(
    () => [
      {
        name: 'items',
        type: 'array',
        default: '15 demo tiles',
        description: 'Tiles to display. Each item has { image, title?, href? }.'
      },
      { name: 'columns', type: 'number', default: '5', description: 'Number of drifting columns.' },
      { name: 'tileWidth', type: 'number', default: '200', description: 'Width of each tile in pixels.' },
      { name: 'tileHeight', type: 'number', default: '132', description: 'Height of each tile in pixels.' },
      { name: 'gap', type: 'number', default: '18', description: 'Spacing between tiles and columns in pixels.' },
      { name: 'radius', type: 'number', default: '14', description: 'Corner radius of each tile in pixels.' },
      { name: 'tilt', type: 'number', default: '16', description: 'Perspective pitch of the wall (rotateX, degrees).' },
      { name: 'turn', type: 'number', default: '-14', description: 'Perspective yaw of the wall (rotateY, degrees).' },
      { name: 'roll', type: 'number', default: '0', description: 'In-plane rotation of the wall (rotateZ, degrees).' },
      {
        name: 'perspective',
        type: 'number',
        default: '1200',
        description: 'Perspective distance in pixels — smaller is more dramatic.'
      },
      {
        name: 'depth',
        type: 'number',
        default: '120',
        description: 'How far the wall sits back from the viewer in pixels.'
      },
      { name: 'speed', type: 'number', default: '42', description: 'Base drift speed in pixels per second.' },
      {
        name: 'direction',
        type: '"up" | "down"',
        default: '"up"',
        description: 'Primary drift direction; columns alternate around it.'
      },
      {
        name: 'variance',
        type: 'number',
        default: '0.45',
        description: 'How much column speeds differ from each other (0–1).'
      },
      {
        name: 'parallax',
        type: 'number',
        default: '0.6',
        description: 'Pointer-follow tilt strength (0 disables it).'
      },
      {
        name: 'pauseOnHover',
        type: 'boolean',
        default: 'false',
        description: 'Pause the whole wall while the pointer is over it.'
      },
      {
        name: 'lift',
        type: 'number',
        default: '64',
        description: 'How far a hovered tile lifts toward the viewer in pixels.'
      },
      { name: 'fade', type: 'number', default: '0.6', description: 'Strength of the edge and depth dissolve (0–1).' },
      { name: 'dim', type: 'number', default: '0.55', description: 'Resting opacity of unhovered tiles (0–1).' },
      {
        name: 'grayscale',
        type: 'boolean',
        default: 'false',
        description: 'Desaturate resting tiles; hover restores colour.'
      },
      {
        name: 'overlayColor',
        type: 'string',
        default: '"#060010"',
        description: 'Tint laid over resting tiles, cleared on hover.'
      }
    ],
    []
  );

  return (
    <ComponentPropsProvider props={props} defaultProps={DEFAULT_PROPS} resetProps={resetProps} hasChanges={hasChanges}>
      <TabsLayout>
        <PreviewTab>
          <Box position="relative" className="demo-container" h={600} overflow="hidden" p={0}>
            <DriftWall
              items={items}
              columns={columns}
              tileWidth={tileWidth}
              tileHeight={tileHeight}
              gap={gap}
              radius={radius}
              tilt={tilt}
              turn={turn}
              roll={roll}
              perspective={perspective}
              depth={depth}
              speed={speed}
              direction={direction}
              variance={variance}
              parallax={parallax}
              pauseOnHover={pauseOnHover}
              lift={lift}
              fade={fade}
              dim={dim}
              grayscale={grayscale}
              overlayColor={overlayColor}
            />
          </Box>

          <Customize>
            <PreviewColorPickerCustom
              title="Overlay"
              color={overlayColor}
              onChange={val => updateProp('overlayColor', val)}
            />

            <PreviewSlider
              title="Columns"
              min={2}
              max={8}
              step={1}
              value={columns}
              width={140}
              onChange={val => updateProp('columns', val)}
            />

            <PreviewSlider
              title="Tile Width"
              min={120}
              max={280}
              step={4}
              value={tileWidth}
              valueUnit="px"
              width={150}
              onChange={val => updateProp('tileWidth', val)}
            />

            <PreviewSlider
              title="Tile Height"
              min={90}
              max={220}
              step={2}
              value={tileHeight}
              valueUnit="px"
              width={150}
              onChange={val => updateProp('tileHeight', val)}
            />

            <PreviewSlider
              title="Gap"
              min={0}
              max={48}
              step={2}
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

            <PreviewSelect
              title="Direction"
              options={directionOptions}
              value={direction}
              width={110}
              onChange={val => updateProp('direction', val)}
            />

            <PreviewSlider
              title="Speed"
              min={0}
              max={120}
              step={2}
              value={speed}
              width={150}
              onChange={val => updateProp('speed', val)}
            />

            <PreviewSlider
              title="Variance"
              min={0}
              max={1}
              step={0.05}
              value={variance}
              width={150}
              onChange={val => updateProp('variance', val)}
            />

            <PreviewSlider
              title="Tilt"
              min={-30}
              max={40}
              step={1}
              value={tilt}
              valueUnit="°"
              width={150}
              onChange={val => updateProp('tilt', val)}
            />

            <PreviewSlider
              title="Turn"
              min={-30}
              max={30}
              step={1}
              value={turn}
              valueUnit="°"
              width={150}
              onChange={val => updateProp('turn', val)}
            />

            <PreviewSlider
              title="Roll"
              min={-20}
              max={20}
              step={1}
              value={roll}
              valueUnit="°"
              width={150}
              onChange={val => updateProp('roll', val)}
            />

            <PreviewSlider
              title="Perspective"
              min={600}
              max={2400}
              step={50}
              value={perspective}
              valueUnit="px"
              width={150}
              onChange={val => updateProp('perspective', val)}
            />

            <PreviewSlider
              title="Depth"
              min={0}
              max={400}
              step={10}
              value={depth}
              valueUnit="px"
              width={150}
              onChange={val => updateProp('depth', val)}
            />

            <PreviewSlider
              title="Parallax"
              min={0}
              max={2}
              step={0.1}
              value={parallax}
              width={150}
              onChange={val => updateProp('parallax', val)}
            />

            <PreviewSlider
              title="Lift"
              min={0}
              max={140}
              step={4}
              value={lift}
              valueUnit="px"
              width={150}
              onChange={val => updateProp('lift', val)}
            />

            <PreviewSlider
              title="Fade"
              min={0}
              max={1}
              step={0.05}
              value={fade}
              width={150}
              onChange={val => updateProp('fade', val)}
            />

            <PreviewSlider
              title="Dim"
              min={0.15}
              max={1}
              step={0.05}
              value={dim}
              width={150}
              onChange={val => updateProp('dim', val)}
            />

            <PreviewSwitch
              title="Pause on Hover"
              isChecked={pauseOnHover}
              onChange={val => updateProp('pauseOnHover', val)}
            />

            <PreviewSwitch title="Grayscale" isChecked={grayscale} onChange={val => updateProp('grayscale', val)} />
          </Customize>

          <PropTable data={propData} />
          <Dependencies dependencyList={[]} />
        </PreviewTab>

        <CodeTab>
          <CodeExample codeObject={driftWall} componentName="DriftWall" />
        </CodeTab>
      </TabsLayout>
    </ComponentPropsProvider>
  );
};

export default DriftWallDemo;
