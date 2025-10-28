/** @jsx createElement */
import { createElement } from './jsx-runtime';

export type ChartPoint = { label: string; value: number };

interface ChartProps {
  type: 'bar' | 'line' | 'pie';
  data: ChartPoint[];
  width?: number;
  height?: number;
  className?: string;
}

function drawBar(ctx: CanvasRenderingContext2D, w: number, h: number, data: ChartPoint[]) {
  ctx.clearRect(0, 0, w, h);
  const padding = 20;
  const barWidth = (w - padding * 2) / data.length - 10;
  const max = Math.max(...data.map(d => d.value), 1);
  data.forEach((d, i) => {
    const x = padding + i * (barWidth + 10);
    const barH = (d.value / max) * (h - padding * 2);
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(x, h - padding - barH, barWidth, barH);
    ctx.fillStyle = '#000';
    ctx.fillText(d.label, x, h - 4);
  });
}

function drawLine(ctx: CanvasRenderingContext2D, w: number, h: number, data: ChartPoint[]) {
  ctx.clearRect(0, 0, w, h);
  const padding = 30;
  const max = Math.max(...data.map(d => d.value), 1);
  const step = (w - padding * 2) / (data.length - 1 || 1);
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = padding + i * step;
    const y = h - padding - (d.value / max) * (h - padding * 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#0ea5a4';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawPie(ctx: CanvasRenderingContext2D, w: number, h: number, data: ChartPoint[]) {
  ctx.clearRect(0, 0, w, h);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) / 2 - 10;
  let start = -Math.PI / 2;
  data.forEach((d, i) => {
    const slice = (d.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, start + slice);
    ctx.closePath();
    ctx.fillStyle = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#7c3aed'][i % 5];
    ctx.fill();
    start += slice;
  });
}

export const Chart = (props: ChartProps) => {
  const { type, data, width = 400, height = 240, className } = props;

  // Use ref callback to draw on canvas when created
  const ref = (node: Element | null) => {
    if (!node) return;
    const canvas = node as HTMLCanvasElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.font = '12px system-ui';
    if (type === 'bar') drawBar(ctx, width, height, data);
    else if (type === 'line') drawLine(ctx, width, height, data);
    else drawPie(ctx, width, height, data);
  };

  return <canvas ref={ref} className={className} />;
};

export default Chart;
