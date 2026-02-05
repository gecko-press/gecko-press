import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "strong", "em", "u", "s", "mark", "sub", "sup",
  "table", "thead", "tbody", "tr", "th", "td",
  "img", "figure", "figcaption",
  "div", "span",
  "iframe",
  "video", "audio", "source",
];

const ALLOWED_ATTR = [
  "href", "target", "rel",
  "src", "alt", "title", "width", "height",
  "class", "id", "style",
  "colspan", "rowspan",
  "frameborder", "allowfullscreen", "allow",
  "controls", "autoplay", "loop", "muted", "preload", "type",
  "data-language",
];

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return "";

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true,
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allowfullscreen", "frameborder", "allow"],
  });
}

export function sanitizeAdCode(dirty: string | null | undefined): string {
  if (!dirty) return "";

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["ins", "script", "div", "span"],
    ALLOWED_ATTR: [
      "class", "style", "data-ad-client", "data-ad-slot",
      "data-ad-format", "data-full-width-responsive",
      "async", "src", "crossorigin",
    ],
    ALLOW_DATA_ATTR: true,
  });
}
