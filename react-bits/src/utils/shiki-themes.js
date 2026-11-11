const sharedScopes = {
  comments: ['comment', 'punctuation.definition.comment'],
  purple: [
    'keyword',
    'storage',
    'entity.name.tag',
    'entity.name.function',
    'support.function',
    'support.type',
    'constant.language'
  ],
  lilac: [
    'entity.other.attribute-name',
    'variable.other.property',
    'meta.object-literal.key',
    'support.variable.property'
  ],
  strings: ['string', 'string.quoted', 'string.template', 'constant.character.escape'],
  numbers: ['constant.numeric', 'constant.character', 'constant.other'],
  punctuation: ['punctuation', 'meta.brace', 'meta.delimiter']
};

const createTheme = ({ name, type, background, foreground, muted, purple, lilac, string, number }) => ({
  name,
  type,
  colors: {
    'editor.background': background,
    'editor.foreground': foreground
  },
  settings: [
    {
      settings: {
        background,
        foreground
      }
    },
    {
      scope: sharedScopes.comments,
      settings: {
        foreground: muted,
        fontStyle: 'italic'
      }
    },
    {
      scope: sharedScopes.purple,
      settings: {
        foreground: purple
      }
    },
    {
      scope: sharedScopes.lilac,
      settings: {
        foreground: lilac,
        fontStyle: 'italic'
      }
    },
    {
      scope: sharedScopes.strings,
      settings: {
        foreground: string
      }
    },
    {
      scope: sharedScopes.numbers,
      settings: {
        foreground: number
      }
    },
    {
      scope: sharedScopes.punctuation,
      settings: {
        foreground: muted
      }
    }
  ]
});

export const reactBitsDarkTheme = createTheme({
  name: 'react-bits-dark',
  type: 'dark',
  background: '#120f17',
  foreground: '#d8d0e2',
  muted: '#786d88',
  purple: '#c084fc',
  lilac: '#d8b4fe',
  string: '#bcaed5',
  number: '#d6bcfa'
});

export const reactBitsLightTheme = createTheme({
  name: 'react-bits-light',
  type: 'light',
  background: '#ffffff',
  foreground: '#3f3847',
  muted: '#83798d',
  purple: '#7c3aed',
  lilac: '#8b5bb5',
  string: '#655274',
  number: '#8454b3'
});
