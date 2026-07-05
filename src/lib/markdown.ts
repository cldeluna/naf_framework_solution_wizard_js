/**
 * Markdown rendering for previews. markdown-it with html:false (the default)
 * so raw HTML in content — including catalog records authored by other
 * users — is never interpreted, only escaped. linkify on for bare URLs.
 */
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

export function renderMarkdown(src: string): string {
  return md.render(src);
}
