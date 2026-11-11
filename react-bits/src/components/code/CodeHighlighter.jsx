import { TbCopy, TbCheck, TbMoodSad } from 'react-icons/tb';
import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { colors } from '../../constants/colors';
import ShikiCode from './ShikiCode';

const routeExpansionState = {};

const hashSnippet = str => {
  if (!str) return 'empty';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    if (i > 500) break;
  }
  return hash.toString(36);
};

const COPY_RESET_MS = 2000;

export const CodeCopyButton = ({ codeString }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  };

  if (!codeString) return null;

  return (
    <button
      className={`docs-copy-button${copied ? ' docs-copy-button--done' : ''}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
    >
      {copied ? <TbCheck /> : <TbCopy />}
    </button>
  );
};

const CodeHighlighter = ({
  language,
  codeString,
  showLineNumbers = true,
  maxLines = 25,
  snippetId,
  showCopyButton = true
}) => {
  const { pathname } = useLocation();
  const key = snippetId || hashSnippet(codeString + '|' + language);
  const [expanded, setExpanded] = useState(() => routeExpansionState[pathname]?.[key] ?? false);

  useEffect(() => {
    if (!routeExpansionState[pathname]) routeExpansionState[pathname] = {};
    routeExpansionState[pathname][key] = expanded;
  }, [expanded, pathname, key]);

  const codeLines = codeString?.split('\n').length;
  const shouldCollapse = codeLines > maxLines;

  return (
    <Box position="relative">
      <Box
        position="relative"
        overflow="hidden"
        maxHeight={shouldCollapse && !expanded ? `calc(1.55em * ${maxLines} + 2.5rem)` : 'none'}
      >
        {codeString ? (
          <ShikiCode code={codeString} language={language} showLineNumbers={showLineNumbers} />
        ) : (
          <Flex className="code-unsupported" alignItems="center" gap={2} color={colors.textMuted}>
            <Text>Sorry, this combination is not supported</Text>
            <Icon as={TbMoodSad} />
          </Flex>
        )}

        {shouldCollapse && !expanded && (
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            height="60%"
            background="linear-gradient(to bottom, transparent, var(--code-bg))"
          />
        )}

        {shouldCollapse && (
          <button className="docs-expand-button" onClick={() => setExpanded(prev => !prev)}>
            {expanded ? 'Collapse Snippet' : 'Expand Snippet'}
          </button>
        )}
      </Box>

      {codeString && showCopyButton && (
        <div className="docs-code-header">
          <CodeCopyButton codeString={codeString} />
        </div>
      )}
    </Box>
  );
};

export default CodeHighlighter;
