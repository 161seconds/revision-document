// The two URL shapes the sections need, in one place.
//
// `mediaUrl` turns the root-relative paths the data script emits (`media/examples/heart.jpg`) into
// absolute site paths, so a card renders the same wherever it is mounted.
export const mediaUrl = (path: string): string => `/${path}`;

// The blob base every file link below is built from; change it here if the repository moves.
export const REPO_FILE_BASE = 'https://github.com/viettranx/3dviz-pro-max/blob/main/';
export const repoFile = (path: string): string => `${REPO_FILE_BASE}${path}`;

/** The repository itself: the header pill, the hero button, the install card and the footer. */
export const GITHUB_REPO = 'https://github.com/viettranx/3dviz-pro-max';

export const INSTALL_DOC = repoFile('docs/installation.md');
export const EXAMPLES_README = repoFile('examples/README.md');
/** The MIT licence file: the footer's own "License" link. */
export const LICENSE_SECTION = repoFile('LICENSE');

/** The record store itself: the "+N more" link at the foot of each catalog tab. */
export const RECIPES_DIR = repoFile('skills/3dviz-pro-max/data/recipes');
export const KNOWLEDGE_DIR = repoFile('skills/3dviz-pro-max/data/knowledge');
export const BLUEPRINTS_DIR = repoFile('skills/3dviz-pro-max/data/knowledge/blueprint');

/** The published origin, for absolute URLs (share cards, canonical, JSON-LD in `index.html`). */
export const SITE_URL = 'https://3dviz.dev';
