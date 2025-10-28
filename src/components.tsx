/** @jsx createElement */
import { createElement } from './jsx-runtime';

// Reusable Card component
interface CardProps {
	title?: string;
	children?: any;
	className?: string;
	onClick?: (e?: Event) => void;
}
const Card = (props: CardProps) => {
	const { title, children, className, onClick } = props;
	return (
		<div className={`card ${className ?? ''}`} onClick={onClick}>
			{title && <div className="card-header"><h3>{title}</h3></div>}
			<div className="card-body">{children}</div>
		</div>
	);
};

// Modal component
interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children?: any;
	className?: string;
}
const Modal = (props: ModalProps) => {
	const { isOpen, onClose, title, children, className } = props;
		if (!isOpen) return createElement('fragment', null);

	return (
		<div className={`modal-overlay ${className ?? ''}`} onClick={onClose}>
			<div className="modal-content" onClick={(e: Event) => { (e as any).stopPropagation(); }}>
				{title && <div className="modal-header"><h2>{title}</h2></div>}
				<div className="modal-body">{children}</div>
				<div className="modal-actions">
					<button onClick={onClose}>Close</button>
				</div>
			</div>
		</div>
	);
};

// Form component
interface FormProps {
	onSubmit?: (formData: FormData, e?: Event) => void;
	children?: any;
	className?: string;
}
const Form = (props: FormProps) => {
	const { onSubmit, children, className } = props;
	return (
		<form className={className} onSubmit={(e: Event) => {
			e.preventDefault();
			const form = (e.target as HTMLFormElement);
			const data = new FormData(form);
			if (onSubmit) onSubmit(data, e);
		}}>
			{children}
		</form>
	);
};

// Input component
interface InputProps {
	type?: string;
	value?: string | number;
	onChange?: (value: string, e?: Event) => void;
	placeholder?: string;
	className?: string;
	name?: string;
	id?: string;
}
const Input = (props: InputProps) => {
	const { type = 'text', value, onChange, placeholder, className, name, id } = props;
	// map onChange to onInput so we get immediate updates
	const handleInput = (e: Event) => {
		const el = e.target as HTMLInputElement;
		if (onChange) onChange(el.value, e);
	};

	return (
		<input id={id} name={name} className={className} type={type} value={value as any} placeholder={placeholder} onInput={handleInput} />
	);
};

export { Card, Modal, Form, Input };
