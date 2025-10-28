/** @jsx createElement */
import { createElement, mount, useState } from './jsx-runtime';
import { Chart } from './chart';
import { Card, Form, Input } from './components';
import { getInitialData, oneShotUpdate, startSimulation, stopSimulation, subscribe } from './data-service';

type DataPoint = { label: string; value: number };

let unsubscribe: (() => void) | null = null;
let setSeriesExternal: ((next: DataPoint[]) => void) | null = null;

const Dashboard = () => {
  const [getSeries, setSeries] = useState<DataPoint[]>(() => getInitialData());
  const [getLive, setLive] = useState(false);
  const [getFilter, setFilter] = useState('');

  setSeriesExternal = next => setSeries(() => next);

  const live = getLive();
  const filterValue = getFilter().toLowerCase();
  const series = getSeries();

  const filteredSeries = filterValue
    ? series.filter(point => point.label.toLowerCase().includes(filterValue))
    : series;

  const toggleLive = () => {
    const next = !getLive();
    setLive(next);
    if (next) startSimulation(1000);
    else stopSimulation();
  };

  return (
    <div className="dashboard" style={{ padding: 16, maxWidth: 1100 }}>
      <h1>Realtime Dashboard</h1>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Card title="Bar Chart" className="dashboard-card">
          <Chart type="bar" data={filteredSeries} width={480} height={260} />
        </Card>
        <Card title="Line Chart" className="dashboard-card">
          <Chart type="line" data={filteredSeries} width={480} height={260} />
        </Card>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 16, alignItems: 'center' }}>
        <button onClick={() => oneShotUpdate()}>Refresh Now</button>
        <button onClick={toggleLive}>{live ? 'Stop Live' : 'Start Live'}</button>
        <Form
          onSubmit={formData => {
            const value = String(formData.get('filter') ?? '');
            setFilter(value);
          }}
          className="dashboard-filter"
        >
          <Input
            name="filter"
            placeholder="Filter label"
            value={filterValue}
            onChange={value => setFilter(value)}
          />
        </Form>
      </div>

      <div style={{ marginTop: 24 }}>
        <Card title="Pie Chart">
          <Chart type="pie" data={filteredSeries} width={600} height={300} />
        </Card>
      </div>
    </div>
  );
};

export function startDashboard(container: HTMLElement | null) {
  mount(<Dashboard />, container);

  unsubscribe?.();
  unsubscribe = subscribe(next => setSeriesExternal?.(next));

  return () => {
    unsubscribe?.();
    unsubscribe = null;
    stopSimulation();
  };
}

export { Dashboard };