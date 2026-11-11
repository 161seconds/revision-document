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
import PreviewInput from '../../components/common/Preview/PreviewInput';
import PreviewColorPickerCustom from '../../components/common/Preview/PreviewColorPickerCustom';

import CurvedInput from '../../content/Components/CurvedInput/CurvedInput';
import { curvedInput } from '../../constants/code/Components/curvedInputCode';

const DEFAULT_PROPS = {
  theme: 'dark',
  width: 450,
  bend: 28,
  height: 64,
  cornerRadius: 18,
  borderWidth: 1.5,
  fontSize: 16,
  backgroundColor: '#1B1722',
  textColor: '#f5f5f5',
  borderColor: '#392e4e',
  buttonColor: '#A855F7',
  buttonTextColor: '#ffffff',
  buttonText: 'Get Started',
  shadowSize: 'md',
  showButton: true,
  showIcon: true
};

const THEME_COLORS = {
  dark: {
    backgroundColor: '#1B1722',
    textColor: '#f5f5f5',
    borderColor: '#392e4e',
    buttonColor: '#A855F7',
    buttonTextColor: '#ffffff'
  },
  light: {
    backgroundColor: '#ffffff',
    textColor: '#1d2050',
    borderColor: '#262a56',
    buttonColor: '#4763eb',
    buttonTextColor: '#ffffff'
  }
};

const SHADOW_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Soft' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Heavy' }
];

const CurvedInputDemo = () => {
  const { props, updateProp, updateProps, resetProps, hasChanges } = useComponentProps(DEFAULT_PROPS);
  const {
    theme,
    width,
    bend,
    height,
    cornerRadius,
    borderWidth,
    fontSize,
    backgroundColor,
    textColor,
    borderColor,
    buttonColor,
    buttonTextColor,
    buttonText,
    shadowSize,
    showButton,
    showIcon
  } = props;
  const siteTheme = useColorModeValue('light', 'dark');
  const usesDefaultPalette =
    theme === DEFAULT_PROPS.theme &&
    backgroundColor === DEFAULT_PROPS.backgroundColor &&
    textColor === DEFAULT_PROPS.textColor &&
    borderColor === DEFAULT_PROPS.borderColor &&
    buttonColor === DEFAULT_PROPS.buttonColor &&
    buttonTextColor === DEFAULT_PROPS.buttonTextColor;
  const renderedTheme = usesDefaultPalette ? siteTheme : theme;
  const renderedColors = usesDefaultPalette ? THEME_COLORS[renderedTheme] : { backgroundColor, textColor, borderColor, buttonColor, buttonTextColor };

  const handleThemeChange = nextTheme => {
    updateProps({ theme: nextTheme, ...THEME_COLORS[nextTheme] });
  };

  const propData = useMemo(
    () => [
      { name: 'value', type: 'string', default: 'undefined', description: 'Controlled value; leave undefined for uncontrolled usage.' },
      { name: 'defaultValue', type: 'string', default: '""', description: 'Initial value when the input is uncontrolled.' },
      { name: 'onChange', type: '(value) => void', default: '-', description: 'Called with the new value on every keystroke.' },
      { name: 'onSubmit', type: '(value) => void', default: '-', description: 'Called when the button is pressed or Enter is hit.' },
      { name: 'placeholder', type: 'string', default: '"Enter your email"', description: 'Placeholder text rendered along the curve when empty.' },
      { name: 'buttonText', type: 'string', default: '"Get Started"', description: 'Label of the curved submit button.' },
      { name: 'type', type: 'string', default: '"email"', description: 'Semantic input type; email/number map to the matching mobile keyboard.' },
      { name: 'name', type: 'string', default: 'undefined', description: 'Name attribute forwarded to the underlying input.' },
      { name: 'ariaLabel', type: 'string', default: 'undefined', description: 'Accessible label; falls back to the placeholder.' },
      { name: 'theme', type: '"dark" | "light"', default: '"dark"', description: 'Color preset; any explicit color prop overrides its theme value.' },
      { name: 'width', type: 'number | string', default: '450', description: 'Width of the input bar (pixels or any CSS width value, e.g. "100%").' },
      { name: 'bend', type: 'number', default: '28', description: 'How many pixels the center of the bar arches above its ends; negative bends downward, 0 is flat.' },
      { name: 'height', type: 'number', default: '64', description: 'Thickness of the input bar in pixels.' },
      { name: 'cornerRadius', type: 'number', default: '18', description: 'Corner rounding of the bar; the button rounds proportionally.' },
      { name: 'borderWidth', type: 'number', default: '1.5', description: 'Outline stroke width in pixels.' },
      { name: 'fontSize', type: 'number', default: '16', description: 'Font size of the curved text and button label.' },
      { name: 'backgroundColor', type: 'string', default: 'undefined', description: 'Fill color of the input bar; overrides the theme.' },
      { name: 'textColor', type: 'string', default: 'undefined', description: 'Color of the typed text and caret; overrides the theme.' },
      { name: 'placeholderColor', type: 'string', default: 'undefined', description: 'Color of the placeholder text; overrides the theme.' },
      { name: 'borderColor', type: 'string', default: 'undefined', description: 'Color of the outline stroke; overrides the theme.' },
      { name: 'buttonColor', type: 'string', default: 'undefined', description: 'Fill of the submit button, the focus ring and the default icon chip; overrides the theme.' },
      { name: 'buttonTextColor', type: 'string', default: 'undefined', description: 'Color of the button label; overrides the theme.' },
      { name: 'iconColor', type: 'string', default: 'undefined', description: 'Fill of the icon chip; defaults to the button color.' },
      { name: 'shadowSize', type: '"none" | "sm" | "md" | "lg"', default: '"md"', description: 'Size of the soft drop shadow under the bar.' },
      { name: 'shadowColor', type: 'string', default: 'undefined', description: 'Tint of the drop shadow; overrides the theme.' },
      { name: 'showButton', type: 'boolean', default: 'true', description: 'Render the curved submit button.' },
      { name: 'showIcon', type: 'boolean', default: 'true', description: 'Render the leading icon chip.' },
      { name: 'icon', type: 'React.ReactNode', default: 'undefined', description: 'Custom SVG content for the icon, centered at the origin; replaces the default envelope chip.' },
      { name: 'className', type: 'string', default: '""', description: 'Additional CSS classes for the wrapper form.' },
      { name: 'style', type: 'React.CSSProperties', default: 'undefined', description: 'Inline styles for the wrapper form.' }
    ],
    []
  );

  return (
    <ComponentPropsProvider props={props} defaultProps={DEFAULT_PROPS} resetProps={resetProps} hasChanges={hasChanges}>
      <TabsLayout>
        <PreviewTab>
          <Box position="relative" className="demo-container" h={500} overflow="hidden" display="flex" alignItems="center" justifyContent="center" px={{ base: 4, md: 12 }}>
            <Box w="100%" maxW="720px" display="flex" justifyContent="center">
              <CurvedInput
                {...props}
                theme={renderedTheme}
                {...renderedColors}
                placeholder="david@reactbits.dev"
                onSubmit={value => console.log('Submitted:', value)}
              />
            </Box>
          </Box>

          <Customize>
            <PreviewSelect
              title="Theme"
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' }
              ]}
              value={theme}
              onChange={handleThemeChange}
              width={120}
            />
            <PreviewColorPickerCustom title="Background" color={renderedColors.backgroundColor} onChange={val => updateProp('backgroundColor', val)} />
            <PreviewColorPickerCustom title="Text" color={renderedColors.textColor} onChange={val => updateProp('textColor', val)} />
            <PreviewColorPickerCustom title="Border" color={renderedColors.borderColor} onChange={val => updateProp('borderColor', val)} />
            <PreviewColorPickerCustom title="Button" color={renderedColors.buttonColor} onChange={val => updateProp('buttonColor', val)} />
            <PreviewColorPickerCustom title="Button Text" color={renderedColors.buttonTextColor} onChange={val => updateProp('buttonTextColor', val)} />
            <PreviewInput title="Button Label" value={buttonText} maxLength={24} onChange={val => updateProp('buttonText', val)} />
            <PreviewSelect title="Shadow" options={SHADOW_OPTIONS} value={shadowSize} onChange={val => updateProp('shadowSize', val)} width={140} />
            <PreviewSlider title="Width" min={340} max={720} step={10} value={width} valueUnit="px" onChange={val => updateProp('width', val)} />
            <PreviewSlider title="Bend" min={-60} max={60} step={1} value={bend} valueUnit="px" onChange={val => updateProp('bend', val)} />
            <PreviewSlider title="Height" min={48} max={96} step={1} value={height} valueUnit="px" onChange={val => updateProp('height', val)} />
            <PreviewSlider title="Corner Radius" min={0} max={36} step={1} value={cornerRadius} valueUnit="px" onChange={val => updateProp('cornerRadius', val)} />
            <PreviewSlider title="Border Width" min={0} max={4} step={0.5} value={borderWidth} valueUnit="px" onChange={val => updateProp('borderWidth', val)} />
            <PreviewSlider title="Font Size" min={13} max={22} step={1} value={fontSize} valueUnit="px" onChange={val => updateProp('fontSize', val)} />
            <PreviewSwitch title="Show Button" isChecked={showButton} onChange={val => updateProp('showButton', val)} />
            <PreviewSwitch title="Show Icon" isChecked={showIcon} onChange={val => updateProp('showIcon', val)} />
          </Customize>

          <PropTable data={propData} />
        </PreviewTab>

        <CodeTab>
          <CodeExample codeObject={curvedInput} componentName="CurvedInput" />
        </CodeTab>
      </TabsLayout>
    </ComponentPropsProvider>
  );
};

export default CurvedInputDemo;
