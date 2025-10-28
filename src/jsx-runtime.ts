import {
  ComponentFunction,
  ComponentProps,
  VNode,
  createElement,
  createFragment,
} from './js-runtime';

export { createElement, createFragment };

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

const elementHandlerMap: WeakMap<Element, Map<string, EventListener>> = new WeakMap();
const delegatedEvents = new Set<string>();

function ensureDelegated(eventType: string) {
  if (delegatedEvents.has(eventType)) return;
  delegatedEvents.add(eventType);

  document.addEventListener(eventType, ev => {
    let target = ev.target as Element | null;
    while (target && target !== document.documentElement) {
      const handler = elementHandlerMap.get(target)?.get(eventType);
      if (handler) {
        try {
          handler.call(target, ev);
        } catch (error) {
          console.error(error);
        }
        if ((ev as any).cancelBubble) return;
      }
      target = target.parentElement;
    }
  });
}

const unitlessCSS = new Set([
  'animation-iteration-count',
  'box-flex',
  'box-flex-group',
  'box-ordinal-group',
  'column-count',
  'flex',
  'flex-grow',
  'flex-positive',
  'flex-shrink',
  'flex-negative',
  'font-weight',
  'line-height',
  'opacity',
  'order',
  'orphans',
  'widows',
  'z-index',
  'zoom',
]);

function applyProps(el: HTMLElement, props: Record<string, any>) {
  for (const [key, value] of Object.entries(props)) {
    if (key === 'className') {
      el.className = value ?? '';
      continue;
    }

    if (key === 'ref' && typeof value === 'function') {
      value(el);
      continue;
    }

    if (key === 'value') {
      (el as HTMLInputElement | HTMLTextAreaElement).value = value;
      continue;
    }

    if (key === 'checked') {
      (el as HTMLInputElement).checked = Boolean(value);
      continue;
    }

    if (key.startsWith('on') && typeof value === 'function') {
      const eventType = key.slice(2).toLowerCase();
      let map = elementHandlerMap.get(el);
      if (!map) {
        map = new Map<string, EventListener>();
        elementHandlerMap.set(el, map);
      }
      map.set(eventType, value as EventListener);
      ensureDelegated(eventType);
      continue;
    }

    if (key === 'style') {
      if (typeof value === 'string') {
        el.setAttribute('style', value);
      } else if (value && typeof value === 'object') {
        const cssText = Object.entries(value)
          .map(([prop, val]) => {
            const kebab = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
            if (typeof val === 'number' && !unitlessCSS.has(kebab)) {
              return `${kebab}: ${val}px;`;
            }
            return `${kebab}: ${String(val)};`;
          })
          .join(' ');
        el.setAttribute('style', cssText);
      }
      continue;
    }

    if (value === true) {
      el.setAttribute(key, '');
      continue;
    }

    if (value === false || value == null) {
      el.removeAttribute(key);
      continue;
    }

    el.setAttribute(key, String(value));
  }
}

export function renderToDOM(vnode: VNode | string | number): Node {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode));
  }

  if (vnode.type === 'fragment') {
    const fragment = document.createDocumentFragment();
    vnode.children.forEach(child => fragment.appendChild(renderToDOM(child)));
    return fragment;
  }

  if (typeof vnode.type === 'function') {
    const rendered = (vnode.type as ComponentFunction)({
      ...(vnode.props as ComponentProps),
      children: vnode.children,
    });
    return renderToDOM(rendered);
  }

  const element = document.createElement(vnode.type as string);
  applyProps(element, vnode.props);
  vnode.children.forEach(child => element.appendChild(renderToDOM(child)));
  return element;
}

let rootVNode: VNode | null = null;
let rootContainer: HTMLElement | null = null;
let hookStates: unknown[] = [];
let currentHookIndex = 0;
let isRenderScheduled = false;

function ensureContainer(container: HTMLElement | null): HTMLElement {
  if (container) return container;
  let root = document.getElementById('root') as HTMLElement | null;
  if (!root) {
    root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
  }
  return root;
}

function renderRoot() {
  if (!rootVNode || !rootContainer) return;
  isRenderScheduled = false;
  currentHookIndex = 0;
  const dom = renderToDOM(rootVNode);
  const usedHooks = currentHookIndex;
  hookStates.length = usedHooks;
  currentHookIndex = 0;
  rootContainer.replaceChildren(dom);
}

function scheduleRender() {
  if (isRenderScheduled) return;
  isRenderScheduled = true;
  const callback = () => {
    renderRoot();
  };
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(callback);
  } else {
    Promise.resolve().then(callback);
  }
}

export function mount(vnode: VNode, container: HTMLElement | null): void {
  rootVNode = vnode;
  rootContainer = ensureContainer(container);
  hookStates = [];
  renderRoot();
}

export function useState<T>(initialValue: T | (() => T)):
  [() => T, (value: T | ((prev: T) => T)) => void] {
  const hookIndex = currentHookIndex;

  if (hookStates.length <= hookIndex) {
    hookStates[hookIndex] = typeof initialValue === 'function'
      ? (initialValue as () => T)()
      : initialValue;
  }

  const getter = () => hookStates[hookIndex] as T;

  const setter = (value: T | ((prev: T) => T)) => {
    const current = getter();
    const next = typeof value === 'function'
      ? (value as (prev: T) => T)(current)
      : (value as T);

    if (!Object.is(current, next)) {
      hookStates[hookIndex] = next;
      scheduleRender();
    }
  };

  currentHookIndex += 1;
  return [getter, setter];
}
