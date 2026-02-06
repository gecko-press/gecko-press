import sanitizeHtmlLib from "sanitize-html";

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

const ALLOWED_ATTR: Record<string, string[]> = {
  a: ["href", "target", "rel", "class", "id"],
  img: ["src", "alt", "title", "width", "height", "class", "id", "style"],
  iframe: ["src", "width", "height", "frameborder", "allowfullscreen", "allow", "class", "id", "style"],
  video: ["src", "width", "height", "controls", "autoplay", "loop", "muted", "preload", "class", "id", "style"],
  audio: ["src", "controls", "autoplay", "loop", "muted", "preload", "class", "id", "style"],
  source: ["src", "type"],
  div: ["class", "id", "style"],
  span: ["class", "id", "style"],
  pre: ["class", "id", "style", "data-language"],
  code: ["class", "id", "style", "data-language"],
  table: ["class", "id", "style"],
  td: ["colspan", "rowspan", "class", "id", "style"],
  th: ["colspan", "rowspan", "class", "id", "style"],
  "*": ["class", "id", "style"],
};

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return "";

  return sanitizeHtmlLib(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.vimeo.com", "vimeo.com", "player.vimeo.com"],
  });
}

export function sanitizeAdCode(dirty: string | null | undefined): string {
  if (!dirty) return "";

  return sanitizeHtmlLib(dirty, {
    allowedTags: ["ins", "script", "div", "span"],
    allowedAttributes: {
      ins: ["class", "style", "data-ad-client", "data-ad-slot", "data-ad-format", "data-full-width-responsive"],
      script: ["async", "src", "crossorigin"],
      div: ["class", "style"],
      span: ["class", "style"],
    },
  });
}
