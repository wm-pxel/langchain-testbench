
const htmlEscapes: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#39;',
  '\n': '<br/>',
}

export const escapeHTML = (str: string) => str
  .replace(/[<>\n&"']/g, (m) => htmlEscapes[m]) // escape special characters
  .replace(/(^|\<br\/\>| )( +)/g, (_, p, s) => p + s.replace(/./g, '&nbsp;')) // extra spaces become non-breaking spaces
  .replace(/<br\/>$/, "<br/><br/>")             // add extra line break at end of string
