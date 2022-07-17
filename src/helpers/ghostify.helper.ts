import { doesItHavePropertyFills } from './utils.helper'

export async function ghostify(
	allNodes: SceneNode[],
	fills: (SolidPaint | GradientPaint)[]
) {
	let vectorNodes: VectorNode[] = []
	let textNodes: TextNode[] = []
	let frameNodes: FrameNode[] = []
	let sharpeNodes: (
		| BooleanOperationNode
		| EllipseNode
		| LineNode
		| PolygonNode
		| RectangleNode
		| SliceNode
		| StarNode
	)[] = []
	allNodes.forEach((node) => {
		if (node.type === 'VECTOR') {
			vectorNodes.push(node)
		}
		if (node.type === 'TEXT') {
			textNodes.push(node)
		}

		if (node.type === 'FRAME' && 'PAGE' !== node.parent.type) {
			frameNodes.push(node)
		}

		if (
			node.type === 'BOOLEAN_OPERATION' ||
			node.type === 'ELLIPSE' ||
			node.type === 'LINE' ||
			node.type === 'POLYGON' ||
			node.type === 'RECTANGLE' ||
			node.type === 'SLICE' ||
			node.type === 'STAR'
		) {
			sharpeNodes.push(node)
		}
	})

	ghostifyFrames(frameNodes)
	ghostifyVector(vectorNodes, fills)
	ghostifyShapes(sharpeNodes, fills)
	await ghostifyText(textNodes, fills)

	figma.closePlugin('Selection ghostified 👻.')
}

function ghostifyFrames(frameNodes: FrameNode[]) {
	frameNodes.forEach((frameNode) => {
		frameNode.layoutMode = 'NONE'
		frameNode.effects = []
		frameNode.fills = []
		frameNode.strokes = []
	})
}

function ghostifyVector(
	vectorNodes: VectorNode[],
	fills: (SolidPaint | GradientPaint)[]
) {
	vectorNodes.map((vectorNode) => {
		vectorNode.fills = fills
		if (vectorNode.strokeWeight > 0) {
			vectorNode.strokes = fills
		} else if (vectorNode.strokeWeight === 0) {
			vectorNode.strokes = []
		}
	})
}

function ghostifyShapes(
	sharpeNodes: (
		| RectangleNode
		| SliceNode
		| BooleanOperationNode
		| StarNode
		| LineNode
		| EllipseNode
		| PolygonNode
	)[],
	fills: any
) {
	sharpeNodes.map((sharpeNode) => {
		if (
			doesItHavePropertyFills(sharpeNode) &&
			sharpeNode.fills !== figma.mixed
		) {
			if (sharpeNode.fills.filter((fill) => fill.type !== 'IMAGE').length) {
				sharpeNode.fills = fills
				sharpeNode.strokes = fills
			} else {
				sharpeNode.fills = []
				sharpeNode.strokes = []
			}
		}
	})
}

async function ghostifyText(
	textNodes: TextNode[],
	fills: (SolidPaint | GradientPaint)[]
) {
	for (const textNode of textNodes) {
		if (textNode.fontName === figma.mixed) {
			const rectangleNode = figma.createRectangle()

			rectangleNode.resizeWithoutConstraints(
				textNode.width,
				0.7 * textNode.height
			)

			rectangleNode.cornerRadius = textNode.height
			rectangleNode.x = textNode.relativeTransform[0][2]
			rectangleNode.y = textNode.relativeTransform[1][2]
			rectangleNode.fills = fills

			textNode.parent.insertChild(
				textNode.parent.children.length,
				rectangleNode
			)

			textNode.remove()
		} else {
			await figma.loadFontAsync(textNode.fontName)
			textNode.textAutoResize = 'NONE'

			if (textNode.hasMissingFont) {
				figma.closePlugin(
					"You can't convert text until loading its source font."
				)
			}
			const textNodeFontSize = Number(textNode.fontSize)
			const textNodeHeight = textNode.height
			let lineHeightValue =
				textNode.lineHeight !== figma.mixed &&
				textNode.lineHeight.unit !== 'AUTO'
					? textNode.lineHeight.value
					: 1.25 * textNodeFontSize

			if (isNaN(lineHeightValue)) {
				lineHeightValue = 1.25 * textNodeFontSize
			}

			textNode.textAutoResize =
				textNodeHeight > lineHeightValue ? 'NONE' : 'WIDTH_AND_HEIGHT'

			const r = Math.round(textNodeHeight / lineHeightValue)

			for (let i = 0; i < r; i++) {
				const rectangleNode = figma.createRectangle()
				rectangleNode.resizeWithoutConstraints(
					textNode.width,
					0.7 * lineHeightValue
				)
				rectangleNode.cornerRadius = lineHeightValue
				rectangleNode.x = textNode.relativeTransform[0][2]
				rectangleNode.y = textNode.relativeTransform[1][2] + lineHeightValue * i
				rectangleNode.fills = fills
				textNode.parent.insertChild(
					textNode.parent.children.length,
					rectangleNode
				)
			}

			textNode.remove()
		}
	}
}