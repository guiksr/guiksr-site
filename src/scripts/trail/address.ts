// The URL keeps the trail: /blog/gatinho/?w=index,blog is home, then blog, then the post.

export const slugOf = (path: string) => path.replace(/^\/+|\/+$/g, '') || 'index';
export const pathOf = (slug: string) => (slug === 'index' ? '/' : `/${slug}/`);

export function readUrl() {
  const w = new URLSearchParams(location.search).get('w');
  return [...(w ? w.split(',').filter(Boolean) : []), slugOf(location.pathname)];
}

export function writeUrl(stack: string[]) {
  const before = stack.slice(0, -1);
  const url = pathOf(stack.at(-1)!) + (before.length ? `?w=${before.join(',')}` : '');
  if (location.pathname + location.search !== url) history.pushState(null, '', url);
}
