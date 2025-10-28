import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { createElement } from '../js-runtime';
import { mount, renderToDOM } from '../jsx-runtime';

const iterations = 10000;

function setupDom() {
  const { window } = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>');
  const { document } = window;
  (globalThis as any).window = window;
  (globalThis as any).document = document;
  (globalThis as any).HTMLElement = window.HTMLElement;
  (globalThis as any).HTMLInputElement = window.HTMLInputElement;
  (globalThis as any).Node = window.Node;
  return { document };
}

function measure(label: string, fn: () => void) {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  console.log(`${label}: ${duration.toFixed(2)}ms`);
}

export function runPerformanceSuite() {
  const { document } = setupDom();

  measure(`createElement x${iterations}`, () => {
    for (let i = 0; i < iterations; i++) {
      createElement('div', { className: 'bench', id: `id-${i}` }, String(i));
    }
  });

  const vnode = createElement(
    'section',
    { className: 'list' },
    ...Array.from({ length: 100 }, (_, index) =>
      createElement('p', { className: 'row' }, `Row ${index}`),
    ),
  );

  measure('renderToDOM x200', () => {
    for (let i = 0; i < 200; i++) {
      renderToDOM(vnode);
    }
  });

  const container = document.getElementById('root') as HTMLElement;
  measure('mount + rerender x200', () => {
    for (let i = 0; i < 200; i++) {
      mount(vnode, container);
    }
  });
}

const invokedDirectly = Boolean(process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href);
if (invokedDirectly) {
  runPerformanceSuite();
}
