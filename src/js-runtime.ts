export interface VNode {
  type: string | ComponentFunction;
  props: Record<string, any>;
  children: (VNode | string | number)[];
}

export interface ComponentProps {
  children?: (VNode | string | number)[];
  [key: string]: any;
}

export type ComponentFunction = (props: ComponentProps) => VNode;

export function createElement(
  type: string | ComponentFunction,
  props: Record<string, any> | null,
  ...children: (VNode | string | number)[]
): VNode {
  props = props || {};
  const flatChildren = children.flat().filter(c => c !== null && c !== undefined);
  return { type, props, children: flatChildren };
}

export function createFragment(
  props: Record<string, any> | null,
  ...children: (VNode | string | number)[]
): VNode {
  return createElement('fragment', props, ...children);
}
