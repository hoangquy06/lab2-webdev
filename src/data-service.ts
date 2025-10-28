// Mock data service - simulates real-time data and allows subscribers
export type DataPoint = { label: string; value: number };

type Subscriber = (series: DataPoint[]) => void;

let subscribers: Subscriber[] = [];

// initial categories
const categories = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];

function randomValue() {
  return Math.round(Math.random() * 100);
}

// create initial dataset
export function getInitialData(): DataPoint[] {
  return categories.map(c => ({ label: c, value: randomValue() }));
}

// start periodic updates and notify subscribers
let timer: number | null = null;
export function startSimulation(interval = 1000) {
  if (timer != null) return;
  timer = setInterval(() => {
    const next = categories.map(c => ({ label: c, value: randomValue() }));
    subscribers.forEach(s => s(next));
  }, interval) as unknown as number;
}

export function stopSimulation() {
  if (timer != null) {
    clearInterval(timer);
    timer = null;
  }
}

export function subscribe(cb: Subscriber) {
  subscribers.push(cb);
  return () => {
    subscribers = subscribers.filter(s => s !== cb);
  };
}

export function oneShotUpdate() {
  const next = categories.map(c => ({ label: c, value: randomValue() }));
  subscribers.forEach(s => s(next));
}
