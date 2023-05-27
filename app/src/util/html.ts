
const htmlEscapes: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#39;',
  '\n': '<br/>'
}

export const escapeHTML = (str: string) => str
  .replace(/[<>\n&"']/g, (m) => htmlEscapes[m]) // escape special characters
  .replace(/<br\/>$/, "<br/><br/>")             // add extra line break at end of string
  .replace(/  /g, " &nbsp;")                    // replace double spaces with non-breaking space