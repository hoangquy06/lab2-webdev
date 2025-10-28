/** @jsxRuntime classic */
/** @jsx createElement */
import { createElement, mount } from './jsx-runtime';
import { Chart } from './chart';
import { getInitialData } from './data-service';
import { TodoApp } from './todo-app';

const data = getInitialData();

const vnode = (
	<div style={{ padding: 16, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
		<div style={{ flex: '1 1 320px', minWidth: '320px' }}>
			<TodoApp />
		</div>
		<div style={{ flex: '2 1 520px', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: 16 }}>
			<section style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
				<h2 style={{ marginBottom: 12 }}>Mock Data</h2>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr>
							<th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e5e7eb' }}>Label</th>
							<th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid #e5e7eb' }}>Value</th>
						</tr>
					</thead>
					<tbody>
						{data.map(point => (
							<tr key={point.label}>
								<td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>{point.label}</td>
								<td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>{point.value}</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>
			<section style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
				<div style={{ flex: '1 1 260px', minWidth: '260px', background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
					<h3 style={{ marginBottom: 12 }}>Bar Chart</h3>
					<Chart type="bar" data={data} width={320} height={220} />
				</div>
				<div style={{ flex: '1 1 260px', minWidth: '260px', background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
					<h3 style={{ marginBottom: 12 }}>Line Chart</h3>
					<Chart type="line" data={data} width={320} height={220} />
				</div>
				<div style={{ flex: '1 1 260px', minWidth: '260px', background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
					<h3 style={{ marginBottom: 12 }}>Pie Chart</h3>
					<Chart type="pie" data={data} width={320} height={220} />
				</div>
			</section>
		</div>
	</div>
);

mount(vnode, document.getElementById('root'));
