/** @jsx createElement */
import { createElement, useState } from './jsx-runtime';

// Button props: onClick handler, optional className, children and button type
interface ButtonProps {
	onClick?: (e?: Event) => void;
	children?: any;
	className?: string;
	type?: 'button' | 'submit' | 'reset';
}

const Button = (props: ButtonProps) => {
	const { onClick, children, className, type = 'button' } = props;
	// Our JSX runtime attaches event listeners for onX props, so pass `onClick` through
	return (
		<button className={className} onClick={onClick} type={type}>
			{children}
		</button>
	);
};

interface CounterProps {
	initialCount?: number;
}

const Counter = (props: CounterProps) => {
	const initial = props.initialCount ?? 0;
	const [getCount, setCount] = useState<number>(initial);

	const increment = () => setCount(prev => prev + 1);
	const decrement = () => setCount(prev => prev - 1);
	const reset = () => setCount(initial);

	const currentCount = getCount();

	return (
		<div className="counter">
			<h2>Count: {currentCount}</h2>
			<div className="buttons">
				<Button onClick={increment} className="increment">+</Button>
				<Button onClick={decrement} className="decrement">-</Button>
				<Button onClick={reset} className="reset">Reset</Button>
			</div>
		</div>
	);
};

export { Counter };