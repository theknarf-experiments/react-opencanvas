import React from 'react';
import Graph, { useNode } from './components/graph';

const KeyboardNode : React.FC = () => {
	const { Node } = useNode();	

	return <Node>
		Keybaord
	</Node>
}

const App : React.FC = () => (
	<div>
		<Graph>
			<KeyboardNode />
			<KeyboardNode />
		</Graph>
		App
	</div>
);

export default App;
