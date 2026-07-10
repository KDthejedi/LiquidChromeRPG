/* global React, htm */
export const html = htm.bind(React.createElement);
export const { useReducer, useState, useEffect, useRef, useMemo } = React;

// Render prose (array of paragraphs, or a string with \n\n breaks).
export function Prose({ text }) {
  if (!text) return null;
  const paras = Array.isArray(text) ? text : String(text).split(/\n\n+/);
  return html`<div class="prose">${paras.map((p, i) => html`<p key=${i}>${p}</p>`)}</div>`;
}

// Inject trusted raw SVG (motifs from world.js) so it inherits theme colours.
export function Svg({ markup, className, tag = 'span' }) {
  return React.createElement(tag, { className, dangerouslySetInnerHTML: { __html: markup } });
}
