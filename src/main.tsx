/** @jsxRuntime classic */
/** @jsx createElement */
import { createElement, mount, useState } from './jsx-runtime';
import { TodoApp } from './todo-app';
import { Chart } from './chart';
import {
	DataPoint,
	getInitialData,
	subscribe,
	startSimulation,
	stopSimulation,
} from './data-service';

type Setter = (value: DataPoint[] | ((prev: DataPoint[]) => DataPoint[])) => void;

let teardownFeed: (() => void) | null = null;

function ensureDataFeed(setSeries: Setter) {
	if (typeof document === 'undefined') return;
	if (teardownFeed) return;
	const unsubscribe = subscribe(next => setSeries(() => next));
	startSimulation(2000);
	teardownFeed = () => {
		unsubscribe();
		stopSimulation();
		teardownFeed = null;
	};

	if (!(window as any).__jsxWithoutReactFeedCleanup) {
		window.addEventListener('beforeunload', () => teardownFeed?.());
		(window as any).__jsxWithoutReactFeedCleanup = true;
	}
}

const SummaryCard = ({ series }: { series: DataPoint[] }) => {
	const total = series.reduce((sum, item) => sum + item.value, 0);
	const average = series.length ? Math.round(total / series.length) : 0;
	const max = series.reduce((peak, item) => Math.max(peak, item.value), 0);
	return (
		<div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
			<div style={summaryCardStyle}>
				<h4 style={summaryTitleStyle}>Total Value</h4>
				<strong style={summaryValueStyle}>{total}</strong>
			</div>
			<div style={summaryCardStyle}>
				<h4 style={summaryTitleStyle}>Average</h4>
				<strong style={summaryValueStyle}>{average}</strong>
			</div>
			<div style={summaryCardStyle}>
				<h4 style={summaryTitleStyle}>Peak</h4>
				<strong style={summaryValueStyle}>{max}</strong>
			</div>
		</div>
	);
};

const summaryCardStyle = {
	padding: '16px 20px',
	borderRadius: 12,
	background: '#0ea5e9',
	color: '#f8fafc',
	minWidth: 140,
	boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
};

const summaryTitleStyle = {
	margin: 0,
	fontSize: 14,
	fontWeight: 500,
	opacity: 0.9,
};

const summaryValueStyle = {
	fontSize: 24,
	marginTop: 8,
	fontWeight: 700,
};

const App = () => {
	const [getSeries, setSeries] = useState<DataPoint[]>(getInitialData);
	ensureDataFeed(setSeries);
	const series = getSeries();

	return (
		<div
			style={{
				display: 'flex',
				gap: 32,
				minHeight: '100vh',
				padding: 32,
				background: 'linear-gradient(135deg, #1e293b, #334155)',
				color: '#f1f5f9',
			}}
		>
			{/* LEFT: Dashboard */}
			<section
				style={{
					flex: '2 1 600px',
					display: 'flex',
					flexDirection: 'column',
					gap: 20,
					background: '#1e293b',
					padding: 28,
					borderRadius: 16,
					boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
				}}
			>
				<header
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<div>
						<h1 style={{ margin: 0, color: '#38bdf8' }}>Live Operations</h1>
						<p style={{ margin: 0, color: '#cbd5e1' }}>
							Data updates automatically every few seconds.
						</p>
					</div>
					<button
						onClick={() => setSeries(getInitialData())}
						style={{
							padding: '8px 16px',
							borderRadius: 999,
							border: 'none',
							background: '#06b6d4',
							color: '#fff',
							fontWeight: 600,
							cursor: 'pointer',
						}}
					>
						Reset Data
					</button>
				</header>

				<SummaryCard series={series} />

				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
					{([
						{ title: 'Bar Chart', type: 'bar' as const },
						{ title: 'Line Chart', type: 'line' as const },
						{ title: 'Pie Chart', type: 'pie' as const },
					] as const).map(config => (
						<div
							key={config.type}
							style={{
								flex: '1 1 280px',
								minWidth: 260,
								background: '#f8fafc',
								borderRadius: 16,
								padding: 18,
								color: '#0f172a',
							}}
						>
							<h3 style={{ marginTop: 0, marginBottom: 12 }}>{config.title}</h3>
							<Chart type={config.type} data={series} width={320} height={220} />
						</div>
					))}
				</div>
			</section>

			{/* RIGHT: Tasks */}
			<section
				style={{
					flex: '1 1 360px',
					background: '#f8fafc',
					borderRadius: 16,
					padding: 24,
					boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
					color: '#0f172a',
				}}
			>
				<h2 style={{ marginTop: 0, color: '#0ea5e9' }}>Task Manager</h2>
				<p style={{ marginTop: 0, marginBottom: 16, color: '#475569' }}>
					Add, edit or mark tasks while monitoring real-time charts.
				</p>
				<TodoApp />
			</section>
		</div>
	);
};

mount(<App />, document.getElementById('root'));
