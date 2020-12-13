import { useState, useEffect } from 'react';

const initialState = {
	dragging: false,
	initial: { x: 0, y: 0 },
	current: { x: 0, y: 0 },
};

const useDraggable = (ref: { current: any }, onDragDone : Function) => {
	const [dragging, setDragging] = useState(initialState);
	const onMouseDown = (e : React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		setDragging({
			dragging: true,
			initial: {
				x: e.clientX,
				y: e.clientY,
			},
			current: {
				x: e.clientX,
				y: e.clientY,
			}
		})
	};
	const onMouseMove = (e: MouseEvent) => {
		if(dragging.dragging) {
			setDragging({
				...dragging,
				current: {
					x: e.clientX,
					y: e.clientY,
				}
			});
		}
	};
	const onMouseUp = (e: MouseEvent) => {
		if(dragging.dragging) {
			onDragDone();
			setDragging(initialState);
		}
	};

	useEffect(() => {
		var currentRef : any = null;
		if(ref.current) {
			currentRef = ref.current;
			currentRef.addEventListener('mousemove', onMouseMove);
			currentRef.addEventListener('mouseup', onMouseUp);
		}

		return () => {
			if(currentRef) {
				currentRef.removeEventListener('mousemove', onMouseMove);
				currentRef.removeEventListener('mouseup', onMouseUp);
			}
		}
	});

	const dragged = {
		x: dragging.current.x - dragging.initial.x,
		y: dragging.current.y - dragging.initial.y,
	}

	return { dragged, onMouseDown };
};

export default useDraggable;
