import { useCallback, useRef, useState } from 'react';
import { Menu, Portal } from '@chakra-ui/react';
import { TbCheck, TbCopy, TbChevronDown } from 'react-icons/tb';
import { SiOpenai, SiClaude } from 'react-icons/si';
import { toast } from 'sonner';
import { sectionToMarkdown, copyText, openInAI } from '../utils/aiExport';

const RESET_MS = 2000;

const AI_ITEMS = [
  { key: 'chatgpt', label: 'Open in ChatGPT', icon: SiOpenai },
  { key: 'claude', label: 'Open in Claude', icon: SiClaude }
];

const CopyPageButton = () => {
  const rootRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const getMarkdown = useCallback(() => {
    const section = rootRef.current?.closest('.docs-section');
    return sectionToMarkdown(section);
  }, []);

  const handleCopy = useCallback(async () => {
    const md = getMarkdown();
    if (!md) return;

    if (await copyText(md)) {
      setCopied(true);
      toast.success('Page copied as Markdown');
      setTimeout(() => setCopied(false), RESET_MS);
    } else {
      toast.error('Could not copy to clipboard');
    }
  }, [getMarkdown]);

  const handleOpen = useCallback(
    providerKey => {
      const md = getMarkdown();
      if (!md) return;
      openInAI(providerKey, `Read the React Bits documentation below, then help me apply it.\n\n${md}`);
    },
    [getMarkdown]
  );

  return (
    <div className="docs-page-actions" ref={rootRef}>
      <button
        type="button"
        className="docs-page-action docs-page-action-primary"
        onClick={handleCopy}
        aria-label="Copy this page as Markdown"
      >
        {copied ? <TbCheck aria-hidden="true" /> : <TbCopy aria-hidden="true" />}
        <span>{copied ? 'Copied' : 'Copy as Markdown'}</span>
      </button>

      <Menu.Root positioning={{ placement: 'bottom-end', gutter: 6 }}>
        <Menu.Trigger asChild>
          <button type="button" className="docs-page-action docs-page-action-more" aria-label="More AI actions">
            <TbChevronDown aria-hidden="true" />
          </button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content className="docs-ai-menu">
              {AI_ITEMS.map(({ key, label, icon: ItemIcon }) => (
                <Menu.Item key={key} value={key} className="docs-ai-menu-item" onSelect={() => handleOpen(key)}>
                  <ItemIcon aria-hidden="true" />
                  {label}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </div>
  );
};

export default CopyPageButton;
