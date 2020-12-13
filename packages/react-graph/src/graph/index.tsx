import React, { createContext, useContext, useReducer, useRef } from 'react';
import { useUID } from 'react-uid';
import useDraggable from './useDraggable';

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
	ref: { current: any };
}>({
	ref: { current: null }
});

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

interface BackgroundGraphProps {
	vertical: number[];
	horizontal: number[];
	width: number;
	height: number;
};

/*
 *	Repeats an array a number of times
 *
 *  Example:
 *    repeatArray([1, 2, 3], 2); // Result: [1, 2, 3, 1, 2, 3]
 */
const repeatArray = (array : any[], times : number) =>
	'.'.repeat(times).split('').flatMap(() => array);

const BackgroundGraph : React.FC<BackgroundGraphProps> = ({ vertical, horizontal, width, height }) => {
	const viewBox = `0 0 ${width} ${height}`;
	const sumVertical   = vertical.reduce((a,b) => a+b, 0);
	const sumHorizontal = horizontal.reduce((a,b) => a+b, 0);

	// Repeat horizontal and vertical lines until they fill the width and height
	vertical   = repeatArray(vertical, width / sumVertical + 1)
	horizontal = repeatArray(horizontal, height / sumHorizontal + 1)

	const verticalPath = vertical.reduce(
		({x, pathCommand}, moveRightBy) => {
			const newX = x+moveRightBy;
			const newLine = `M${newX},0 V${height} `;

			return {
				x: newX,
				pathCommand: pathCommand+newLine
			};
		},
		{x: 0, pathCommand: ''}
	).pathCommand;

	const horizontalPath = horizontal.reduce(
		({y, pathCommand}, moveDownBy) => {
			const newY = y+moveDownBy;
			const newLine = `M0,${newY} H${width} `;

			return {
				y: newY,
				pathCommand: pathCommand+newLine
			};
		},
		{y: 0, pathCommand: ''}
	).pathCommand;

	return <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox}>
		<path stroke='#3c529e' d={verticalPath + horizontalPath} />
	</svg>;
};

type Color = string;

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
		>
			<BackgroundGraph
				height={height}
				width={width}
				vertical={[50, 10, 10, 10]}
				horizontal={[50, 10, 10, 10]}
				/>
			{children}
		</div>
	</GraphContext.Provider>
};

interface NodeProps {
	uid: Uid
}

const Node : React.FC<NodeProps> = ({ children, uid }) => {
	const { getPosition, dispatch, ref } = useContext(GraphContext);
	const { x, y } = getPosition!(uid);
	const { dragged, onMouseDown } = useDraggable(ref, () => {
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
