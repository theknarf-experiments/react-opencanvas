import React, { createContext, useContext, useReducer, useRef, useEffect, useState } from 'react';
import { useUID } from 'react-uid';
import useDraggable from './useDraggable';
import BackgroundGraph from './backgroundgraph';

type Uid = string;
type Color = string;
type Vector = { x: number, y: number };
type RefType = { current: any }; // TODO: type this?

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
	ref: RefType;
}>({
	ref: { current: null }
});

enum ActionType {
	UpdateRelativePosition,
	UpdateAttribute,
	AddEdge,
	RemoveEdge,
};

type Actions =
 | { type: ActionType.UpdateRelativePosition, uid: Uid, x: Number, y: Number }
 | { type: ActionType.UpdateAttribute, uid: Uid, key: String, value: any }
 | { type: ActionType.AddEdge, fromNode: Uid, toNode: Uid };

const graphReducer = (state : Graph, action: Actions) => {
	switch(action.type) {
		case ActionType.UpdateRelativePosition:
			const newState = { ...state };
			const index = state.nodes.findIndex((node) => node.uid === action.uid);
			if(index === -1) {
				newState.nodes.push({uid: action.uid, x: action.x, y: action.y});
			} else {
				newState.nodes[index].x += action.x;
				newState.nodes[index].y += action.y;
			}
			return newState;
		case ActionType.UpdateAttribute:
		case ActionType.AddEdge:
		default:
			break;
	}

	return state;
};

const updatePosition = (uid: Uid, x: Number, y: Number) => ({ type: ActionType.UpdateRelativePosition, uid, x, y });

interface GraphComponentProps {
	width: number,
	height: number,
	background?: Color,
}

const GraphComponent : React.FC<GraphComponentProps> = ({
	children,
	width,
	height,
	background = '#1c2e60'
}) => {
	const ref = useRef(null);
	const [ state, dispatch ] = useReducer(graphReducer, initialState);
	const [ _position, setPosition ] = useState({ x: 0, y: 0 });
	const { dragged, onMouseDown } = useDraggable(ref, (dragged : Vector) => {
		setPosition({
			x: _position.x + dragged.x,
			y: _position.y + dragged.y,
		});
	});

	const position = {
		x: _position.x + dragged.x,
		y: _position.y + dragged.y,
	};

	const getPosition = (uid: Uid) => {
		const node = state.nodes.find((node) => node.uid === uid);
		const defaultValues = { x: 0, y: 0 };
		return { ...defaultValues, ...node };
	}

	return <GraphContext.Provider value={{
		state,
		dispatch,
		getPosition,
		ref,
	}}>
		<div style={{
			width: `${width}px`,
			height: `${height}px`,
			backgroundColor: background,
			color: '#eaeaea',
			position: 'relative',
			overflow: 'hidden',
		}}
		ref={ref}
		onMouseDown={onMouseDown}
		>
			<span style={{
				position: 'absolute',
				userSelect: 'none',
			}}>{JSON.stringify(position)}</span>
			<BackgroundGraph
				height={height}
				width={width}
				vertical={[50, 10, 10, 10]}
				horizontal={[50, 10, 10, 10]}
				dragged={position}
				/>
			<div style={{
				position: 'absolute',
				width: '100%',
				height: '100%',
				left: `${position.x}px`,
				top: `${position.y}px`,
			}}>
				<div style={{
					position: 'relative',
					width: '100%',
					height: '100%',
				}}>
				{children}
				</div>
			</div>
		</div>
	</GraphContext.Provider>
};


interface DraggableProps {
	uid: Uid;
	nodeRef: RefType;
}

const Draggable : React.FC<DraggableProps> = ({ uid, children, nodeRef }) => {
	const { getPosition, dispatch, ref } = useContext(GraphContext);
	const { x, y } = getPosition!(uid);
	const { dragged, onMouseDown } = useDraggable(ref, (dragged : {x: number, y: number}) => {
		dispatch!(updatePosition(
			uid,
			dragged.x,
			dragged.y,
		));
	});

	useEffect(() => {
		nodeRef.current.style.left = (x + dragged.x) + 'px';
		nodeRef.current.style.top = (y + dragged.y) + 'px';
	}, [x, y, dragged, nodeRef]);

	return <div onMouseDown={onMouseDown}>{children}</div>;
};


interface NodeProps {
	uid: Uid;
	nodeRef: RefType;
}

const Node : React.FC<NodeProps> = ({ children, uid, nodeRef }) => {
	const { getPosition } = useContext(GraphContext);
	const { x, y } = getPosition!(uid);

	return <div style={{
		position: 'absolute',
		userSelect: 'none',
		left: `${x}px`,
		top: `${y}px`,
	}}
	ref={nodeRef}
	>
		{children}
	</div>
};

export const useNode = () => {
	const uid = useUID();
	const nodeRef = useRef(null);

	return {
		uid,
		Node: ({ ...args }) => <Node uid={uid} nodeRef={nodeRef} {...args} />,
		Draggable: ({ ...args }) => <Draggable uid={uid} nodeRef={nodeRef} {...args} />,
	};
}

interface PortProps {
	uid: Uid;
	position: Vector;
};

const Port : React.FC<PortProps> = ({ children, uid, position  }) => {
	
	return <div>
	{ children }
	</div>;
}

export const usePort = (nodeUid: Uid) => {
	const uid = useUID();
	
	return {
		uid,
		Port: ({ position, ...args } : { position: Vector } & any) => <Port uid={uid} {...args} />,
	};
}

export default GraphComponent;
