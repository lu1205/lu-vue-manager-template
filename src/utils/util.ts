export function arrayToTree(inputArray, parentId = null) {
  const nodeMap = {}
  const result = []

  inputArray.forEach((item) => {
    nodeMap[item.id] = { ...item }
  })

  inputArray.forEach((item) => {
    const currentNode = nodeMap[item.id]

    if (item.parentId === parentId) {
      result.push(currentNode)
    } else {
      const parentNode = nodeMap[item.parentId]
      if (parentNode) {
        if (!parentNode['children']) {
          parentNode['children'] = []
        }
        parentNode['children'].push(currentNode)
      }
    }
  })

  return result
}

export function findAllChildren(items, parentId) {
  const children = items.filter((item) => item.pid === parentId)

  // 对每个子节点递归查找其子节点
  children.forEach((child) => {
    child.children = findAllChildren(items, child.id)
  })

  return children
}

export function toTree(arr) {
  const tree = []
  const map = new Map()

  arr.forEach((node) => {
    map.set(node.id, { ...node, children: [] })
  })

  map.forEach((node, _, map) => {
    const parentId = node.pid
    const parent = map.get(parentId)

    if (parent) {
      parent.children.push(node)
    } else {
      tree.push(node)
    }
  })

  return tree
}
