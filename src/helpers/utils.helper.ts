export function doesItHavePropertyChildren(
	node: SceneNode
): node is
	| FrameNode
	| GroupNode
	| BooleanOperationNode
	| ComponentNode
	| ComponentSetNode
	| InstanceNode
	| SectionNode {
	return (
		node.type === 'FRAME' ||
		node.type === 'GROUP' ||
		node.type === 'BOOLEAN_OPERATION' ||
		node.type === 'COMPONENT' ||
		node.type === 'COMPONENT_SET' ||
		node.type === 'INSTANCE' ||
		node.type === 'SECTION'
	)
}

export function doesItHavePropertyFills(
	node: SceneNode
): node is
	| FrameNode
	| RectangleNode
	| BooleanOperationNode
	| ComponentNode
	| ComponentSetNode
	| EllipseNode
	| InstanceNode
	| VectorNode
	| StarNode
	| LineNode
	| PolygonNode
	| TextNode
	| StickyNode
	| ShapeWithTextNode
	| StampNode
	| SectionNode
	| HighlightNode
	| WashiTapeNode {
	return (
		node.type === 'RECTANGLE' ||
		node.type === 'FRAME' ||
		node.type === 'BOOLEAN_OPERATION' ||
		node.type === 'COMPONENT' ||
		node.type === 'COMPONENT_SET' ||
		node.type === 'ELLIPSE' ||
		node.type === 'INSTANCE' ||
		node.type === 'VECTOR' ||
		node.type === 'STAR' ||
		node.type === 'LINE' ||
		node.type === 'POLYGON' ||
		node.type === 'TEXT' ||
		node.type === 'STICKY' ||
		node.type === 'SHAPE_WITH_TEXT' ||
		node.type === 'STAMP' ||
		node.type === 'SECTION' ||
		node.type === 'HIGHLIGHT' ||
		node.type === 'WASHI_TAPE'
	)
}

export function clone(val: any): any {
	const type = typeof val
	if (val === null) {
		return null
	} else if (
		type === 'undefined' ||
		type === 'number' ||
		type === 'string' ||
		type === 'boolean'
	) {
		return val
	} else if (type === 'object') {
		if (val instanceof Array) {
			return val.map((x) => clone(x))
		} else if (val instanceof Uint8Array) {
			return new Uint8Array(val)
		} else {
			let o: any = {}
			for (const key in val) {
				o[key] = clone(val[key])
			}
			return o
		}
	}
	throw 'unknown'
}