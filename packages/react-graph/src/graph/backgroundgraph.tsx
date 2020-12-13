import React from 'react';

/*
 *	Repeats an array a number of times
 *
 *  Example:
 *    repeatArray([1, 2, 3], 2); // Result: [1, 2, 3, 1, 2, 3]
 */
const repeatArray = (array : any[], times : number) =>
	'.'.repeat(times).split('').flatMap(() => array);

interface BackgroundGraphProps {
	vertical: number[];
	horizontal: number[];
	width: number;
	height: number;
};

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

export default BackgroundGraph;
