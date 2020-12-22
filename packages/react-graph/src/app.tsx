import React, { useState } from 'react';
import Graph, { useNode } from './graph';

const GenericNode1 : React.FC = () => {
	const { Node, Draggable, uid } = useNode();	

	return <Node>
		<Draggable>
		<div style={{ background: 'darkgrey' }}>
			Uid: {uid}
		</div>
		</Draggable>
		<div style={{ background: 'black' }}>
			<div style={{ padding: '20px'}}>
			generic node type 1	
			</div>
		</div>
	</Node>
}

const GenericNode2 : React.FC<{
	onClose?: Function
}> = ({ onClose }) => {
	const { Node, Draggable, uid } = useNode();	
	const onClick = () => {
		if(typeof onClose === 'function')
			onClose();
	}

	return <Node>
		<Draggable>
			<div style={{ background: '#003' }}>
				<span>Uid: {uid}</span>
				<div style={{ padding: '20px'}}>
					generic node type 2	
					<button onClick={onClick}>Close</button>
				</div>
			</div>
		</Draggable>
	</Node>
}

const App : React.FC = () => {
	const [num, setNum] = useState<{
		max: number;
		items: number[];
	}>({
		max: 0,
		items: [],
	});
	const onClick = () => {
		const max = num.max +1
		setNum({
			max,
			items: [ ...num.items, max ],
		});
	};
	const remove = (i : number) => {
		setNum({
			max: num.max,
			items: num.items.filter(itm => itm !== i)
		});
	}

	return <div>
		<Graph width={1200} height={500}>
			<GenericNode1 />
			<GenericNode1 />
			{
				num.items.map(i => (
					<GenericNode2 key={i} onClose={() => remove(i)} />
				))
			}
		</Graph>
		<button onClick={onClick}>Add new</button>
	</div>
};

export default App;
