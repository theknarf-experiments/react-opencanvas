import { useState, useEffect, useMemo } from 'react';

interface Vector {
	x: number,
	y: number,
};

interface DraggableInterface {
	dragging: boolean;
	initial: Vector;
	current: Vector;
}

const initialState : DraggableInterface = {
	dragging: false,
	initial: { x: 0, y: 0 },
	current: { x: 0, y: 0 },
};

const useDraggable = (ref: { current: any }, onDragDone : Function) => {
	const [dragging, setDragging] = useState(initialState);
	const dragged = useMemo<Vector>(() => ({
		x: dragging.current.x - dragging.initial.x,
		y: dragging.current.y - dragging.initial.y,
	}), [dragging]);

	const onMouseDown = (e : React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		// Only drag on left click
		if(e.button === 0) {
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
		}
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
			onDragDone(dragged);
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

	return { dragged, onMouseDown };
};

export default useDraggable;
