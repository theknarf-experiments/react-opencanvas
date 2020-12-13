import React, { createContext, useContext, useReducer, useState } from 'react';
import { useUID } from 'react-uid';

interface Graph {
	nodes: any[];
	edges: any[];
}

const initialState : Graph = {
	nodes: [],
	edges: [],
}

const GraphContext = createContext<{
	state?: Graph;
	dispatch?: Function;
	getPosition?: Function;
}>({});

enum ActionType {
	UpdatePosition,
	UpdateAttribute,
	AddEdge,
	RemoveEdge,
};

type Uid = string;

type Actions =
 | { type: ActionType.UpdatePosition, uid: Uid, x: Number, y: Number }
 | { type: ActionType.UpdateAttribute, uid: Uid, key: String, value: any }
 | { type: ActionType.AddEdge, fromNode: Uid, toNode: Uid };

const graphReducer = (state : Graph, action: Actions) => {
	switch(action.type) {
		case ActionType.UpdatePosition:
			const newState = { ...state };
			const index = state.nodes.findIndex((node) => node.uid === action.uid);
			if(index === -1) {
				newState.nodes.push({uid: action.uid, x: action.x, y: action.y});
			} else {
				newState.nodes[index].x = action.x;
				newState.nodes[index].y = action.y;
			}
			return newState;
		case ActionType.UpdateAttribute:
		case ActionType.AddEdge:
		default:
			break;
	}

	return state;
};

const updatePosition = (uid: Uid, x: Number, y: Number) => ({ type: ActionType.UpdatePosition, uid, x, y });

interface GraphComponentProps {
	width: Number,
	height: Number,
}

const GraphComponent : React.FC<GraphComponentProps> = ({ children, width, height }) => {
	const [state, dispatch] = useReducer(graphReducer, initialState);
	const getPosition = (uid: Uid) => {
		const node = state.nodes.find((node) => node.uid === uid);
		const defaultValues = { x: 0, y: 0 };
		return { ...defaultValues, ...node };
	}

	return <GraphContext.Provider value={{
		state,
		dispatch,
		getPosition,
	}}>
		<div style={{
			width: `${width}px`,
			height: `${height}px`,
			backgroundColor: 'darkblue',
			color: '#eaeaea',
			position: 'relative',
			overflow: 'hidden',
		}}>
		{children}
		</div>
	</GraphContext.Provider>
};

interface NodeProps {
	uid: Uid
}

const useDraggable = (onDragDone : Function) => {
	const [dragging, setDragging ] = useState({
		dragging: false,
		initial: { x: 0, y: 0 },
		current: { x: 0, y: 0 },
	});
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
	const onMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
	const onMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if(dragging.dragging) {
			onDragDone();
			setDragging({
				dragging: false,
				initial: {
					x: 0,
					y: 0,
				},
				current: {
					x: 0,
					y: 0,
				}
			});
		}
	};

	const dragged = {
		x: dragging.current.x - dragging.initial.x,
		y: dragging.current.y - dragging.initial.y,
	}

	return { dragged, onMouseDown, onMouseMove, onMouseUp, };
};

const Node : React.FC<NodeProps> = ({ children, uid }) => {
	const { getPosition, dispatch } = useContext(GraphContext);
	const { x, y } = getPosition!(uid);
	const { dragged, onMouseDown, onMouseMove, onMouseUp } = useDraggable(() => {
		dispatch!(updatePosition(
			uid,
			x + dragged.x,
			y + dragged.y,
		));
	});
	const left = x + dragged.x;
	const top =  y + dragged.y;

	return <div style={{
		position: 'absolute',
		background: 'black',
		userSelect: 'none',
		left: `${left}px`,
		top: `${top}px`,
	}}
	onMouseDown={onMouseDown}
	onMouseMove={onMouseMove}
	onMouseUp={onMouseUp}
	>
		<span>Uuid: {uid}</span>
		<div>{children}</div>
	</div>
};

export const useNode = () => {
	const uid = useUID();
	//const context = useContext(GraphContext);

	return {
		Node: ({ ...args }) => <Node uid={uid} {...args} />,
		//setData: (key, value) => 
	};
}

export default GraphComponent;
