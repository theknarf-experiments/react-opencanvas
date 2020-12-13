import React, { useState } from 'react';
import Graph, { useNode } from './graph';

const GenericNode1 : React.FC = () => {
	const { Node } = useNode();	

	return <Node>
		<div style={{ padding: '20px'}}>
		generic node type 1	
		</div>
	</Node>
}

const GenericNode2 : React.FC = () => {
	const { Node } = useNode();	

	return <Node>
		<div style={{ padding: '20px'}}>
		generic node type 2	
		</div>
	</Node>
}

const App : React.FC = () => {
	const [num, setNum] = useState(0);
	const onClick = () => {
		setNum(num + 1);
	};

	return <div>
		<Graph width={1200} height={500}>
			<GenericNode1 />
			<GenericNode2 />
			{
				'.'.repeat(num).split('').map((_, i) => (
					<GenericNode2 key={i} />
				))
			}
		</Graph>
		<button onClick={onClick}>Add new</button>
	</div>
};

export default App;
