"use client"

import { useCallback } from "react"
import {
  addEdge,
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Node,
  type OnConnect,
} from "@xyflow/react"

const initialNodes: Node[] = [
  {
    id: "starter-node",
    position: { x: 180, y: 140 },
    data: { label: "Starter node" },
  },
  {
    id: "second-node",
    position: { x: 460, y: 260 },
    data: { label: "Second node" },
  },
]

export default function GraphPage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((currentEdges) => addEdge(connection, currentEdges)),
    [setEdges]
  )

  return (
    <main className="h-full min-h-0 flex-1 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        deleteKeyCode={["Backspace", "Delete"]}
        proOptions={{ hideAttribution: true }}
        fitView
        className="bg-background"
      >
        <Background color="var(--ring)" gap={20} size={1} />
        <Controls />
      </ReactFlow>
    </main>
  )
}