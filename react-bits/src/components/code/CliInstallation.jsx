import {
  Code,
  HStack,
  Flex,
  Tooltip,
  Menu,
  Portal,
} from '@chakra-ui/react';
import { TbCheck, TbChevronDown } from 'react-icons/tb';
import { useActiveRoute } from '../../hooks/useActiveRoute';
import { useOptions } from '../context/OptionsContext/useOptions';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { generateCliCommands } from '../../utils/cli';
import { useInstallation } from '../../hooks/useInstallation';
import { colors } from '../../constants/colors';
import CodeSection from './CodeSection';
import { CodeCopyButton } from './CodeHighlighter';

const PKG_MANAGERS = ['pnpm', 'npm', 'yarn', 'bun'];
const CLI_TOOLS = ['shadcn', 'jsrepo'];

const CliCodeSection = ({
  command,
  codeRef,
  scrollMeta,
  dragging,
  trackRef,
  onScroll,
  onScrollbarMouseDown,
}) => (
  <div className="code-wrapper" style={{ position: 'relative' }}>
    <Code ref={codeRef} whiteSpace="pre" w="100%" onScroll={onScroll}>
      {command}
    </Code>
    {scrollMeta.show && (
      <div
        className={`cli-custom-scrollbar${dragging ? ' dragging' : ''}`}
        aria-hidden
        ref={trackRef}
        onMouseDown={onScrollbarMouseDown}
      >
        <div
          className="cli-custom-scrollbar-thumb"
          style={{ width: scrollMeta.w, transform: `translateX(${scrollMeta.l}px)` }}
        />
      </div>
    )}
  </div>
);

const CliModeSwitch = ({ mode, hasManual, setMode }) => (
  <Flex className="mode-switch" data-mode-switch align="center">
    <HStack gap={1}>
      <button data-active={mode === 'cli'} onClick={() => setMode('cli')} className="cli-toggle-button">
        CLI
      </button>
      {hasManual ? (
        <button
          data-active={mode === 'manual'}
          onClick={() => hasManual && setMode('manual')}
          className={`cli-toggle-button${!hasManual ? ' disabled' : ''}`}
          disabled={!hasManual}
          aria-disabled={!hasManual}
        >
          Manual
        </button>
      ) : (
        <Tooltip.Root openDelay={200} positioning={{ placement: 'right' }}>
          <Tooltip.Trigger asChild>
            <span style={{ display: 'inline-block' }}>
              <button
                data-active={false}
                className="cli-toggle-button disabled"
                disabled
                aria-disabled="true"
                type="button"
              >
                Manual
              </button>
            </span>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content
              bg="var(--shell-panel-solid)"
              border={`1px solid ${colors.borderSecondary}`}
              color="var(--text-muted)"
              boxShadow="var(--shadow-menu)"
              fontSize="12px"
              px={2}
              whiteSpace="nowrap"
              py={2}
              borderRadius="8px"
              textAlign="center"
            >
              No dependencies, head to the &quot;Code&quot; section
            </Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>
      )}
    </HStack>
  </Flex>
);

const InstallOptionsMenu = ({ pkg, setPkg, cliLib, setCliLib, showRegistry }) => (
  <Menu.Root positioning={{ placement: 'bottom-start', gutter: 8 }}>
    <Menu.Trigger asChild>
      <button type="button" className="install-options-trigger" aria-label="Choose installation options">
        <span>{pkg}</span>
        {showRegistry && (
          <>
            <span className="install-options-dot" aria-hidden="true">
              ·
            </span>
            <span>{cliLib}</span>
          </>
        )}
        <TbChevronDown aria-hidden="true" />
      </button>
    </Menu.Trigger>
    <Portal>
      <Menu.Positioner>
        <Menu.Content className="install-options-menu">
          <div className="install-options-label">Package manager</div>
          {PKG_MANAGERS.map(manager => (
            <Menu.Item
              key={manager}
              value={`package-${manager}`}
              className="install-options-item"
              onSelect={() => setPkg(manager)}
            >
              <span>{manager}</span>
              {pkg === manager && <TbCheck aria-hidden="true" />}
            </Menu.Item>
          ))}
          {showRegistry && (
            <>
              <Menu.Separator className="install-options-separator" />
              <div className="install-options-label">Registry</div>
              {CLI_TOOLS.map(tool => (
                <Menu.Item
                  key={tool}
                  value={`registry-${tool}`}
                  className="install-options-item"
                  onSelect={() => setCliLib(tool)}
                >
                  <span>{tool}</span>
                  {cliLib === tool && <TbCheck aria-hidden="true" />}
                </Menu.Item>
              ))}
            </>
          )}
        </Menu.Content>
      </Menu.Positioner>
    </Portal>
  </Menu.Root>
);

const CliInstallation = ({ deps }) => {
  const { category, subcategory } = useActiveRoute();
  const { languagePreset, stylePreset } = useOptions() || {};

  const {
    installMode: mode,
    setInstallMode: setMode,
    cliTool: cliLib,
    setCliTool: setCliLib,
    packageManager: pkg,
    setPackageManager: setPkg
  } = useInstallation();

  const commands = useMemo(
    () => generateCliCommands(languagePreset, stylePreset, category, subcategory, deps),
    [languagePreset, stylePreset, category, subcategory, deps]
  );

  const hasManual = !!commands?.manual;

  useEffect(() => {
    if (!hasManual && mode === 'manual') {
      setMode('cli');
    }
  }, [hasManual, mode, setMode]);



  const codeRef = useRef(null);
  const [scrollMeta, setScrollMeta] = useState({ w: 0, l: 0, show: false });
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef(null);
  const dragOffsetRef = useRef(0);
  const trackWidthRef = useRef(0);
  const thumbWidthRef = useRef(0);

  const currentCommand = useMemo(() => {
    if (!commands) return '';
    if (mode === 'manual') return commands.manual?.[pkg] || '';
    const key = pkg === 'npm' ? 'npx' : pkg;
    return cliLib === 'jsrepo' ? commands.jsrepo[key] : commands.shadcn[key];
  }, [commands, mode, pkg, cliLib]);

  const updateScrollMeta = useCallback(() => {
    const el = codeRef.current;
    if (!el) return;
    const { scrollWidth, clientWidth, scrollLeft } = el;
    if (scrollWidth <= clientWidth) {
      if (scrollMeta.show) setScrollMeta({ w: 0, l: 0, show: false });
      return;
    }
    const ratio = clientWidth / scrollWidth;
    const thumbWidth = Math.max(24, clientWidth * ratio);
    const maxTrack = clientWidth - thumbWidth;
    const thumbLeft = (scrollLeft / (scrollWidth - clientWidth)) * maxTrack;
    setScrollMeta({ w: thumbWidth, l: thumbLeft, show: true });
    trackWidthRef.current = clientWidth;
    thumbWidthRef.current = thumbWidth;
  }, [scrollMeta.show]);

  useEffect(() => {
    updateScrollMeta();
  }, [currentCommand, updateScrollMeta]);

  useEffect(() => {
    const el = codeRef.current;
    if (!el) return;
    const onScroll = () => updateScrollMeta();
    window.addEventListener('resize', updateScrollMeta);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', updateScrollMeta);
      el.removeEventListener('scroll', onScroll);
    };
  }, [updateScrollMeta]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = e => {
      const el = codeRef.current;
      const trackEl = trackRef.current;
      if (!el || !trackEl) return;
      const rect = trackEl.getBoundingClientRect();
      const maxThumbLeft = trackWidthRef.current - thumbWidthRef.current;
      let newLeft = e.clientX - rect.left - dragOffsetRef.current;
      newLeft = Math.max(0, Math.min(maxThumbLeft, newLeft));
      const scrollable = el.scrollWidth - el.clientWidth;
      const scrollLeft = (newLeft / maxThumbLeft) * scrollable;
      el.scrollLeft = scrollLeft;
      setScrollMeta(m => ({ ...m, l: newLeft }));
    };
    const handleUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp, { once: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging]);

  const handleScrollbarMouseDown = e => {
    const el = codeRef.current;
    const trackEl = trackRef.current;
    if (!el || !trackEl) return;
    const rect = trackEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const { l: thumbLeft, w: thumbWidth } = scrollMeta;
    const withinThumb = clickX >= thumbLeft && clickX <= thumbLeft + thumbWidth;
    if (withinThumb) {
      dragOffsetRef.current = clickX - thumbLeft;
    } else {
      const maxLeft = trackWidthRef.current - thumbWidth;
      let newLeft = clickX - thumbWidth / 2;
      newLeft = Math.max(0, Math.min(maxLeft, newLeft));
      const scrollable = el.scrollWidth - el.clientWidth;
      const scrollLeft = (newLeft / maxLeft) * scrollable;
      el.scrollLeft = scrollLeft;
      dragOffsetRef.current = clickX - newLeft;
      setScrollMeta(m => ({ ...m, l: newLeft }));
    }
    setDragging(true);
  };

  if (!commands) return null;

  return (
    <CodeSection
      title="Install"
      className="cli-install"
      actions={
        <div className="cli-install-actions">
          <CliModeSwitch mode={mode} hasManual={hasManual} setMode={setMode} />
          <InstallOptionsMenu
            pkg={pkg}
            setPkg={setPkg}
            cliLib={cliLib}
            setCliLib={setCliLib}
            showRegistry={mode === 'cli'}
          />
          <CodeCopyButton codeString={currentCommand} />
        </div>
      }
    >
      <CliCodeSection
        command={currentCommand}
        codeRef={codeRef}
        scrollMeta={scrollMeta}
        dragging={dragging}
        trackRef={trackRef}
        onScroll={updateScrollMeta}
        onScrollbarMouseDown={handleScrollbarMouseDown}
      />
    </CodeSection>
  );
};

export default CliInstallation;
