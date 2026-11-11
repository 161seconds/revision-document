import { useMemo } from 'react';
import { Box, Text } from '@chakra-ui/react';

import { CodeTab, PreviewTab, TabsLayout } from '../../components/common/TabsLayout';

import useComponentProps from '../../hooks/useComponentProps';
import { ComponentPropsProvider } from '../../components/context/ComponentPropsContext';
import Customize from '../../components/common/Preview/Customize';
import PreviewSlider from '../../components/common/Preview/PreviewSlider';
import PreviewSelect from '../../components/common/Preview/PreviewSelect';
import PreviewSwitch from '../../components/common/Preview/PreviewSwitch';
import CodeExample from '../../components/code/CodeExample';
import PropTable from '../../components/common/Preview/PropTable';

import ScrollExpand from '@/content/Animations/ScrollExpand/ScrollExpand';
import { scrollExpand } from '@/constants/code/Animations/scrollExpandCode';

const DEMO_SRC = 'https://picsum.photos/seed/scroll-expand/1600/1000';

const DEFAULT_PROPS = {
  title: 'Built to scale',
  scrollHint: 'Scroll inside the frame',
  startWidth: 42,
  startHeight: 58,
  startRadius: 24,
  endRadius: 0,
  mediaZoom: 1.35,
  scrollDistance: 1.2,
  holdDistance: 0.35,
  smoothing: 0.1,
  overlayScrim: 0.45,
  enabled: true
};

const ScrollExpandDemo = () => {
  const { props, updateProp, resetProps, hasChanges } = useComponentProps(DEFAULT_PROPS);
  const {
    title,
    scrollHint,
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    enabled
  } = props;

  const propData = useMemo(
    () => [
      { name: 'src', type: 'string', default: "''", description: 'Image or video URL shown inside the frame.' },
      {
        name: 'mediaType',
        type: '"image" | "video"',
        default: '"image"',
        description: 'Whether the source is an image or a looping muted video.'
      },
      { name: 'poster', type: 'string', default: "''", description: 'Poster frame used while a video loads.' },
      { name: 'alt', type: 'string', default: "''", description: 'Alt text for the image.' },
      {
        name: 'title',
        type: 'string',
        default: "''",
        description: 'Headline held over the frame that lifts away as the media takes over.'
      },
      {
        name: 'scrollHint',
        type: 'string',
        default: "''",
        description: 'Small cue shown under the resting frame that fades away as soon as the scroll begins.'
      },
      {
        name: 'startWidth',
        type: 'number',
        default: '42',
        description: 'Frame width before expanding, as a percentage of the stage.'
      },
      {
        name: 'startHeight',
        type: 'number',
        default: '58',
        description: 'Frame height before expanding, as a percentage of the stage.'
      },
      { name: 'startRadius', type: 'number', default: '24', description: 'Corner radius of the resting frame, in px.' },
      { name: 'endRadius', type: 'number', default: '0', description: 'Corner radius once fully expanded, in px.' },
      {
        name: 'mediaZoom',
        type: 'number',
        default: '1.35',
        description: 'How far the media is zoomed in at rest. It eases back to 1 as the frame opens up.'
      },
      {
        name: 'scrollDistance',
        type: 'number',
        default: '1.2',
        description: 'Scroll length of the expansion, in multiples of the stage height.'
      },
      {
        name: 'holdDistance',
        type: 'number',
        default: '0.35',
        description: 'Extra scroll the frame stays pinned at full bleed before releasing.'
      },
      {
        name: 'smoothing',
        type: 'number',
        default: '0.1',
        description: 'Follow time in seconds. 0 locks the frame exactly to the scrollbar.'
      },
      {
        name: 'overlayScrim',
        type: 'number',
        default: '0.45',
        description: 'Strength of the gradient scrim that fades in to keep overlay content readable.'
      },
      {
        name: 'useWindowScroll',
        type: 'boolean',
        default: 'false',
        description: 'Drive the expansion from the page scroll instead of the component’s own scroller.'
      },
      { name: 'enabled', type: 'boolean', default: 'true', description: 'Enable or disable the expansion.' },
      {
        name: 'children',
        type: 'React.ReactNode',
        default: '—',
        description: 'Content that fades in over the media once it reaches full bleed.'
      },
      { name: 'className', type: 'string', default: "''", description: 'Additional class names for the container.' },
      { name: 'style', type: 'object', default: '—', description: 'Inline styles for the container.' }
    ],
    []
  );

  return (
    <ComponentPropsProvider props={props} defaultProps={DEFAULT_PROPS} resetProps={resetProps} hasChanges={hasChanges}>
      <TabsLayout>
        <PreviewTab>
          <Box position="relative" className="demo-container" h={520} p={0} overflow="hidden">
            <ScrollExpand
              src={DEMO_SRC}
              alt="Mountain range at sunrise"
              title={title}
              scrollHint={scrollHint}
              startWidth={startWidth}
              startHeight={startHeight}
              startRadius={startRadius}
              endRadius={endRadius}
              mediaZoom={mediaZoom}
              scrollDistance={scrollDistance}
              holdDistance={holdDistance}
              smoothing={smoothing}
              overlayScrim={overlayScrim}
              enabled={enabled}
            >
              <Text fontSize="2rem" fontWeight={700} color="#fff" letterSpacing="-0.02em" lineHeight="1.1">
                Every pixel, everywhere
              </Text>
              <Text mt={3} fontSize="1rem" color="rgba(255,255,255,0.72)" maxW="30rem">
                The frame opens up as you scroll and hands the whole stage to your media.
              </Text>
            </ScrollExpand>
          </Box>

          <Customize>
            <PreviewSelect
              title="Title"
              options={[
                { label: 'Built to scale', value: 'Built to scale' },
                { label: 'See it bigger', value: 'See it bigger' },
                { label: 'None', value: '' }
              ]}
              value={title}
              onChange={val => updateProp('title', val)}
              width={170}
            />
            <PreviewSlider
              title="Start Width"
              min={15}
              max={90}
              step={1}
              value={startWidth}
              valueUnit="%"
              onChange={val => updateProp('startWidth', val)}
            />
            <PreviewSlider
              title="Start Height"
              min={15}
              max={90}
              step={1}
              value={startHeight}
              valueUnit="%"
              onChange={val => updateProp('startHeight', val)}
            />
            <PreviewSlider
              title="Start Radius"
              min={0}
              max={80}
              step={1}
              value={startRadius}
              valueUnit="px"
              onChange={val => updateProp('startRadius', val)}
            />
            <PreviewSlider
              title="End Radius"
              min={0}
              max={80}
              step={1}
              value={endRadius}
              valueUnit="px"
              onChange={val => updateProp('endRadius', val)}
            />
            <PreviewSlider
              title="Media Zoom"
              min={1}
              max={2}
              step={0.01}
              value={mediaZoom}
              onChange={val => updateProp('mediaZoom', val)}
            />
            <PreviewSlider
              title="Scroll Distance"
              min={0.5}
              max={3}
              step={0.1}
              value={scrollDistance}
              onChange={val => updateProp('scrollDistance', val)}
            />
            <PreviewSlider
              title="Hold Distance"
              min={0}
              max={1.5}
              step={0.05}
              value={holdDistance}
              onChange={val => updateProp('holdDistance', val)}
            />
            <PreviewSlider
              title="Smoothing"
              min={0}
              max={0.4}
              step={0.01}
              value={smoothing}
              valueUnit="s"
              onChange={val => updateProp('smoothing', val)}
            />
            <PreviewSlider
              title="Overlay Scrim"
              min={0}
              max={1}
              step={0.01}
              value={overlayScrim}
              onChange={val => updateProp('overlayScrim', val)}
            />
            <PreviewSwitch title="Enabled" isChecked={enabled} onChange={val => updateProp('enabled', val)} />
          </Customize>

          <PropTable data={propData} />
        </PreviewTab>

        <CodeTab>
          <CodeExample codeObject={scrollExpand} componentName="ScrollExpand" />
        </CodeTab>
      </TabsLayout>
    </ComponentPropsProvider>
  );
};

export default ScrollExpandDemo;
