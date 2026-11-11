import { useMemo } from 'react';
import { getLanguage } from '../../utils/utils';
import { useComponentPropsContext } from '../../hooks/useComponentPropsContext';
import { formatPropValue } from '../../utils/codeGeneration';
import CliInstallation from './CliInstallation';
import CodeHighlighter, { CodeCopyButton } from './CodeHighlighter';
import CodeOptions, { CSS, Tailwind, TSCSS, TSTailwind } from './CodeOptions';
import CodeSection from './CodeSection';

const SKIP_KEYS = new Set(['tailwind', 'css', 'tsTailwind', 'tsCode', 'dependencies']);

/**
 * Injects current prop values into a usage code string.
 * Updates changed props in place, and adds new props that don't exist yet.
 */
export function injectPropsIntoCode(usageCode, props, defaultProps, componentName, demoOnlyProps = []) {
  if (!usageCode || !props || !componentName) return usageCode;

  const demoOnlySet = new Set(demoOnlyProps);
  const changedProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (demoOnlySet.has(key)) continue;

    if (JSON.stringify(value) !== JSON.stringify(defaultProps[key])) {
      changedProps[key] = value;
    }
  }

  if (Object.keys(changedProps).length === 0) return usageCode;

  let result = usageCode;
  const propsToAdd = [];

  for (const [propName, propValue] of Object.entries(changedProps)) {
    const formattedValue = formatPropValue(propValue, propName);
    const newPropLine =
      typeof propValue === 'boolean' && propValue === true ? propName : `${propName}=${formattedValue}`;

    const simplePropRegex = new RegExp(
      `(^[ \\t]*)(${propName})(?:=(?:"[^"\\n]*"|'[^'\\n]*'|\\{[^{}\\n]*\\}|[^\\s/>]+))?[ \\t]*(\\r?\\n|$)`,
      'gm'
    );

    const hasSimpleMatch = simplePropRegex.test(result);
    simplePropRegex.lastIndex = 0;

    if (hasSimpleMatch) {
      let seen = false;
      result = result.replace(simplePropRegex, (_, indent, __, lineEnding) => {
        if (seen) return '';
        seen = true;
        return `${indent}${newPropLine}${lineEnding}`;
      });
      continue;
    }

    const multiLineStart = new RegExp(`^([ \\t]*)(${propName})=\\{`, 'gm');
    let match;
    let updated = false;

    while ((match = multiLineStart.exec(result)) !== null) {
      const indent = match[1];
      const startIndex = match.index;
      const openBraceIndex = match.index + match[0].length - 1;

      let braceCount = 1;
      let i = openBraceIndex + 1;
      while (i < result.length && braceCount > 0) {
        if (result[i] === '{') braceCount++;
        else if (result[i] === '}') braceCount--;
        i++;
      }

      if (braceCount === 0) {
        const before = result.slice(0, startIndex);
        const after = result.slice(i);
        result = before + indent + newPropLine + after;
        updated = true;
        break;
      }
    }

    if (!updated) {
      propsToAdd.push(newPropLine);
    }
  }

  if (propsToAdd.length > 0) {
    const indentMatch = result.match(/\n([ \t]+)\w/);
    const indent = indentMatch ? indentMatch[1] : '  ';

    const newPropsStr = propsToAdd.map(p => `${indent}${p}`).join('\n');

    const closingIndex = result.lastIndexOf('/>');
    if (closingIndex !== -1) {
      const before = result.slice(0, closingIndex);
      const after = result.slice(closingIndex);
      result = before.trimEnd() + '\n' + newPropsStr + '\n' + after.trim();
    }
  }

  return result;
}

const CodeExample = ({ codeObject, componentName }) => {
  const { tailwind, css, tsTailwind, tsCode, code, usage, dependencies } = codeObject;
  const { props, hasChanges, demoOnlyProps, computedProps } = useComponentPropsContext();

  const dynamicUsage = useMemo(() => {
    if (!usage || !componentName || !props || Object.keys(props).length === 0) return usage;

    const mergedProps = { ...props, ...computedProps };
    return injectPropsIntoCode(usage, mergedProps, {}, componentName, demoOnlyProps);
  }, [usage, props, computedProps, componentName, demoOnlyProps]);

  const renderCssSection = () =>
    css && (
      <CodeSection title="CSS" actions={<CodeCopyButton codeString={css} />}>
        <CodeHighlighter snippetId="css" language="css" codeString={css} showCopyButton={false} />
      </CodeSection>
    );

  return (
    <>
      <CliInstallation deps={dependencies} />

      {dynamicUsage && (
        <CodeSection
          title="Usage"
          note={hasChanges ? 'With your settings' : null}
          actions={<CodeCopyButton codeString={dynamicUsage} />}
        >
          <CodeHighlighter
            snippetId="usage"
            language="jsx"
            codeString={dynamicUsage}
            showCopyButton={false}
          />
        </CodeSection>
      )}

      {Object.entries(codeObject).map(([name, snippet]) => {
        if (SKIP_KEYS.has(name)) return null;
        if (name === 'usage') return null;

        if (name === 'code' || name === 'tsCode') {
          return (
            <div key={name}>
              <CodeOptions>
                {tailwind && (
                  <Tailwind>
                    <CodeHighlighter
                      snippetId="code"
                      language="jsx"
                      codeString={tailwind}
                      showCopyButton={false}
                    />
                  </Tailwind>
                )}
                {code && (
                  <CSS>
                    <CodeHighlighter snippetId="code" language="jsx" codeString={code} showCopyButton={false} />
                    {css && renderCssSection()}
                  </CSS>
                )}
                {tsTailwind && (
                  <TSTailwind>
                    <CodeHighlighter
                      snippetId="code"
                      language="tsx"
                      codeString={tsTailwind}
                      showCopyButton={false}
                    />
                  </TSTailwind>
                )}
                {tsCode && (
                  <TSCSS>
                    <CodeHighlighter snippetId="code" language="tsx" codeString={tsCode} showCopyButton={false} />
                    {renderCssSection()}
                  </TSCSS>
                )}
              </CodeOptions>
            </div>
          );
        }

        return (
          <CodeSection key={name} title={name} actions={<CodeCopyButton codeString={snippet} />}>
            <CodeHighlighter
              snippetId={name}
              language={getLanguage(name)}
              codeString={snippet}
              showCopyButton={false}
            />
          </CodeSection>
        );
      })}
    </>
  );
};

export default CodeExample;
