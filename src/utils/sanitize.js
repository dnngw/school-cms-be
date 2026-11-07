import sanitizeHtml from 'sanitize-html';

/**
 * Clean HTML coming from the rich text editor to prevent XSS.
 * Only allow a safe subset of tags/attributes that the editor can produce.
 */
export function sanitizeRichText(html = '') {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'iframe', 'u', 's']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height'],
      iframe: ['src', 'width', 'height', 'allowfullscreen', 'frameborder'],
      '*': ['style', 'class'],
    },
    allowedStyles: {
      '*': { 'text-align': [/^(left|right|center|justify)$/] },
    },
    // Only allow embedded videos from trusted providers.
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
  });
}
