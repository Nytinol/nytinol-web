"use client"

import { BookOpen, BriefcaseBusiness, ChevronDown, Pencil, Plus, Target, Trash2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useCallback, useState } from "react"
import {
  addEdge,
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type NodeProps,
  type Node,
  type Edge,
  type OnConnect,
  type ReactFlowInstance,
} from "@xyflow/react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type ExperienceData = {
  type: "experience"
  experienceType: string
  experienceName: string
  organization: string
  industry: string
  term: string
  termsParticipated: string
  hoursPerWeek: string
  onEdit?: () => void
  onDelete?: () => void
}

type GoalData = {
  type: "goal"
  industry: string
  jobTitle: string
  annualSalary: string
  onEdit?: () => void
  onDelete?: () => void
}

type ClassData = {
  type: "class"
  className: string
  subject: string
  term: string
  creditHours: string
  onEdit?: () => void
  onDelete?: () => void
}

type UserData = {
  type: "user"
  profileImageUrl: string
  name: string
  age: string
  major: string
  gpa: string
}

type ExperienceNode = Node<ExperienceData, "experience">
type GoalNode = Node<GoalData, "goal">
type ClassNode = Node<ClassData, "class">
type UserNode = Node<UserData, "user">
type AppNode = ExperienceNode | GoalNode | ClassNode | UserNode
type AppData = ExperienceData | GoalData | ClassData | UserData
type ContextMenuPosition = { x: number; y: number }

const seasons = ["Spring", "Summer", "Fall", "Winter"]

function getTermParts(term: string) {
  const [season = "Fall", year = "2026"] = term.split(" ")
  return { season, year }
}

const initialNodes: AppNode[] = [
  {
    id: "experience-1",
    type: "experience",
    position: { x: 180, y: 140 },
    data: {
      type: "experience",
      experienceType: "Experience",
      experienceName: "Community research fellow",
      organization: "Organization name",
      industry: "",
      term: "Fall 2026",
      termsParticipated: "1",
      hoursPerWeek: "10",
    },
  },
  {
    id: "goal-1",
    type: "goal",
    position: { x: 560, y: 140 },
    data: {
      type: "goal",
      industry: "Technology",
      jobTitle: "Product designer",
      annualSalary: "95000",
    },
  },
  {
    id: "class-1",
    type: "class",
    position: { x: 180, y: 360 },
    data: {
      type: "class",
      className: "Product strategy",
      subject: "Business",
      term: "Fall 2026",
      creditHours: "3",
    },
  },
  {
    id: "user-1",
    type: "user",
    position: { x: 560, y: 360 },
    deletable: false,
    data: {
      type: "user",
      profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
      name: "Your name",
      age: "24",
      major: "Your major",
      gpa: "3.8",
    },
  },
]

function ExperienceNodeCard({ data }: NodeProps<ExperienceNode>) {
  function stopNodePointer(event: React.PointerEvent) {
    event.stopPropagation()
  }

  return (
    <Card size="sm" className="experience-node-card relative min-w-64 overflow-visible border-0 py-0 shadow-sm ring-border">
      <Handle className="z-10" style={{ left: "-1px", width: "7px", height: "7px" }} type="target" position={Position.Left} />
      <Handle className="z-10" style={{ right: "-1px", width: "7px", height: "7px" }} type="source" position={Position.Right} />
      <CardHeader className="px-2.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <Badge className="text-[10px]">
            Experience
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {data.term}
          </Badge>
          <div className="ml-auto flex items-center gap-1">
          <Button
            aria-label="Edit experience"
            className="nodrag size-6 rounded-md p-0"
            onClick={(event) => { event.stopPropagation(); data.onEdit?.() }}
            onPointerDown={stopNodePointer}
            size="icon-xs"
            title="Edit experience"
            variant="secondary"
          >
            <Pencil />
          </Button>
          <Button
            aria-label="Delete experience"
            className="nodrag size-6 rounded-md p-0"
            onClick={(event) => { event.stopPropagation(); data.onDelete?.() }}
            onPointerDown={stopNodePointer}
            size="icon-xs"
            title="Delete experience"
            variant="secondary"
          >
            <Trash2 />
          </Button>
          </div>
        </div>
        <CardTitle className="truncate text-sm">{data.experienceName}</CardTitle>
        <CardDescription className="truncate text-xs">
          {data.industry || "Industry"} · {data.hoursPerWeek || "0"} hrs/week
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

function GoalNodeCard({ data }: NodeProps<GoalNode>) {
  function stopNodePointer(event: React.PointerEvent) {
    event.stopPropagation()
  }

  return (
    <Card size="sm" className="relative min-w-64 overflow-visible border-0 py-0 shadow-sm ring-border">
      <Handle className="z-10" style={{ left: "-1px", width: "7px", height: "7px" }} type="target" position={Position.Left} />
      <Handle className="z-10" style={{ right: "-1px", width: "7px", height: "7px" }} type="source" position={Position.Right} />
      <CardHeader className="px-2.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <Badge className="text-[10px]">Goal</Badge>
          <div className="ml-auto flex items-center gap-1">
            <Button aria-label="Edit goal" className="nodrag size-6 rounded-md p-0" onClick={(event) => { event.stopPropagation(); data.onEdit?.() }} onPointerDown={stopNodePointer} size="icon-xs" title="Edit goal" variant="secondary">
              <Pencil />
            </Button>
            <Button aria-label="Delete goal" className="nodrag size-6 rounded-md p-0" onClick={(event) => { event.stopPropagation(); data.onDelete?.() }} onPointerDown={stopNodePointer} size="icon-xs" title="Delete goal" variant="secondary">
              <Trash2 />
            </Button>
          </div>
        </div>
        <CardTitle className="truncate text-sm">{data.jobTitle}</CardTitle>
        <CardDescription className="truncate text-xs">{data.industry} · ${Number(data.annualSalary || 0).toLocaleString()} / year</CardDescription>
      </CardHeader>
    </Card>
  )
}

function ClassNodeCard({ data }: NodeProps<ClassNode>) {
  function stopNodePointer(event: React.PointerEvent) {
    event.stopPropagation()
  }

  return (
    <Card size="sm" className="relative min-w-64 overflow-visible border-0 py-0 shadow-sm ring-border">
      <Handle className="z-10" style={{ left: "-1px", width: "7px", height: "7px" }} type="target" position={Position.Left} />
      <Handle className="z-10" style={{ right: "-1px", width: "7px", height: "7px" }} type="source" position={Position.Right} />
      <CardHeader className="px-2.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <Badge className="text-[10px]">Class</Badge>
          <Badge variant="secondary" className="text-[10px]">{data.term}</Badge>
          <div className="ml-auto flex items-center gap-1">
            <Button aria-label="Edit class" className="nodrag size-6 rounded-md p-0" onClick={(event) => { event.stopPropagation(); data.onEdit?.() }} onPointerDown={stopNodePointer} size="icon-xs" title="Edit class" variant="secondary">
              <Pencil />
            </Button>
            <Button aria-label="Delete class" className="nodrag size-6 rounded-md p-0" onClick={(event) => { event.stopPropagation(); data.onDelete?.() }} onPointerDown={stopNodePointer} size="icon-xs" title="Delete class" variant="secondary">
              <Trash2 />
            </Button>
          </div>
        </div>
        <CardTitle className="truncate text-sm">{data.subject}</CardTitle>
        <CardDescription className="truncate text-xs">{data.className} · {data.creditHours} credit hours</CardDescription>
      </CardHeader>
    </Card>
  )
}

function UserNodeCard({ data }: NodeProps<UserNode>) {
  const { user } = useUser()
  const displayName = user?.fullName || user?.username || data.name

  function stopNodePointer(event: React.PointerEvent) {
    event.stopPropagation()
  }

  return (
    <Card size="sm" className="relative min-w-64 overflow-visible border-0 py-0 shadow-sm ring-border">
      <Handle className="z-10" style={{ left: "-1px", width: "7px", height: "7px" }} type="target" position={Position.Left} />
      <Handle className="z-10" style={{ right: "-1px", width: "7px", height: "7px" }} type="source" position={Position.Right} />
      <CardHeader className="gap-3 px-3 py-3">
        <div className="flex items-center gap-3">
          <div
            aria-label={`${displayName} profile`}
            className="size-12 shrink-0 rounded-full object-cover ring-2 ring-background"
            role="img"
            style={{ backgroundImage: `url(${user?.imageUrl || data.profileImageUrl})`, backgroundPosition: "center", backgroundSize: "cover" }}
          />
          <div className="min-w-0">
            <CardTitle className="truncate text-sm">{displayName}</CardTitle>
            <CardDescription className="truncate text-xs">{data.major}</CardDescription>
          </div>
        </div>
        <Button className="nodrag w-full" onClick={(event) => event.stopPropagation()} onPointerDown={stopNodePointer} size="sm">
          Generate Suggestions
        </Button>
      </CardHeader>
    </Card>
  )
}

const nodeTypes = { experience: ExperienceNodeCard, goal: GoalNodeCard, class: ClassNodeCard, user: UserNodeCard }

export default function GraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const editingNode = nodes.find((node) => node.id === editingNodeId)
  const [draft, setDraft] = useState<AppData | null>(null)
  const termParts = draft && "term" in draft ? getTermParts(draft.term) : null
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<AppNode, Edge> | null>(null)

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((currentEdges) => addEdge(connection, currentEdges)),
    [setEdges]
  )

  function openNodeEditor(node: AppNode) {
    setEditingNodeId(node.id)
    setDraft({ ...node.data })
  }

  function deleteNode(nodeId: string) {
    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== nodeId))
    setEdges((currentEdges) => currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
    if (editingNodeId === nodeId) {
      setEditingNodeId(null)
      setDraft(null)
    }
  }

  function updateDraft(field: string, value: string) {
    setDraft((currentDraft) => currentDraft ? { ...currentDraft, [field]: value } as AppData : currentDraft)
  }

  function updateTermPart(part: "season" | "year", value: string) {
    if (!termParts) return
    const nextTerm = part === "season"
      ? `${value} ${termParts.year}`
      : `${termParts.season} ${value}`
    updateDraft("term", nextTerm)
  }

  function saveNode() {
    if (!editingNodeId || !draft) return

    setNodes((currentNodes) => currentNodes.map((node) => {
      if (node.id !== editingNodeId) return node
      return node.type === "experience"
        ? { ...node, data: draft as ExperienceData }
        : node.type === "goal"
          ? { ...node, data: draft as GoalData }
          : node.type === "class"
            ? { ...node, data: draft as ClassData }
            : { ...node, data: draft as UserData }
    }))
    setEditingNodeId(null)
    setDraft(null)
  }

  function createExperienceNode() {
    if (!contextMenu || !reactFlowInstance) return

    const position = reactFlowInstance.screenToFlowPosition(contextMenu)
    setNodes((currentNodes) => [...currentNodes, {
      id: `experience-${Date.now()}`,
      type: "experience",
      position: { x: position.x - 128, y: position.y - 48 },
      data: {
        type: "experience",
        experienceType: "Experience",
        experienceName: "New experience",
        organization: "Organization name",
        industry: "",
        term: "Fall 2026",
        termsParticipated: "1",
        hoursPerWeek: "10",
      },
    }])
    setContextMenu(null)
  }

  function createGoalNode() {
    if (!contextMenu || !reactFlowInstance) return

    const position = reactFlowInstance.screenToFlowPosition(contextMenu)
    setNodes((currentNodes) => [...currentNodes, {
      id: `goal-${Date.now()}`,
      type: "goal",
      position: { x: position.x - 128, y: position.y - 48 },
      data: { type: "goal", industry: "Industry", jobTitle: "Job title", annualSalary: "" },
    }])
    setContextMenu(null)
  }

  function createClassNode() {
    if (!contextMenu || !reactFlowInstance) return

    const position = reactFlowInstance.screenToFlowPosition(contextMenu)
    setNodes((currentNodes) => [...currentNodes, {
      id: `class-${Date.now()}`,
      type: "class",
      position: { x: position.x - 128, y: position.y - 48 },
      data: {
        type: "class",
        className: "New class",
        subject: "Subject",
        term: "Fall 2026",
        creditHours: "3",
      },
    }])
    setContextMenu(null)
  }

  const nodesWithActions: AppNode[] = nodes.map((node) => {
    if (node.type === "experience") {
      return {
        ...node,
        data: { ...node.data, onEdit: () => openNodeEditor(node), onDelete: () => deleteNode(node.id) },
      }
    }
    if (node.type === "goal") {
      return {
        ...node,
        data: { ...node.data, onEdit: () => openNodeEditor(node), onDelete: () => deleteNode(node.id) },
      }
    }
    if (node.type === "class") {
      return {
        ...node,
        data: { ...node.data, onEdit: () => openNodeEditor(node), onDelete: () => deleteNode(node.id) },
      }
    }
    return {
      ...node,
      data: {
        ...node.data,
      },
    }
  })

  return (
    <main className="h-full min-h-0 flex-1 overflow-hidden">
      <ReactFlow
        nodes={nodesWithActions}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => setReactFlowInstance(instance)}
        onPaneClick={() => setContextMenu(null)}
        onPaneContextMenu={(event) => {
          event.preventDefault()
          setContextMenu({ x: event.clientX, y: event.clientY })
        }}
        nodeTypes={nodeTypes}
        deleteKeyCode={["Backspace", "Delete"]}
        proOptions={{ hideAttribution: true }}
        fitView
        className="bg-background"
      >
        <Background color="var(--ring)" gap={20} size={1} />
        <Controls />
      </ReactFlow>
      {contextMenu && (
        <div
          className="fixed z-[100] w-44 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-muted-foreground">
            <Plus className="size-4" />
            Create new
          </div>
          <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm whitespace-nowrap hover:bg-accent hover:text-accent-foreground" onClick={createExperienceNode}>
            <BriefcaseBusiness className="size-4" />
            Experience
          </button>
          <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm whitespace-nowrap hover:bg-accent hover:text-accent-foreground" onClick={createGoalNode}>
            <Target className="size-4" />
            Goal
          </button>
          <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm whitespace-nowrap hover:bg-accent hover:text-accent-foreground" onClick={createClassNode}>
            <BookOpen className="size-4" />
            Class
          </button>
        </div>
      )}
      <Dialog
        open={editingNodeId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingNodeId(null)
            setDraft(null)
          }
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNode?.type === "goal" ? "Edit goal" : editingNode?.type === "class" ? "Edit class" : editingNode?.type === "user" ? "Edit user" : "Edit experience"}
            </DialogTitle>
            <DialogDescription>
              Update the information shown on this node.
            </DialogDescription>
          </DialogHeader>
          {editingNode?.type === "user" && draft && "name" in draft ? (
            <div className="grid gap-4">
              <FormField label="Name">
                <Input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} />
              </FormField>
              <FormField label="Age">
                <Input type="number" min="0" value={draft.age} onChange={(event) => updateDraft("age", event.target.value)} />
              </FormField>
              <FormField label="Major">
                <Input value={draft.major} onChange={(event) => updateDraft("major", event.target.value)} />
              </FormField>
              <FormField label="GPA">
                <Input type="number" min="0" step="0.01" value={draft.gpa} onChange={(event) => updateDraft("gpa", event.target.value)} />
              </FormField>
            </div>
          ) : editingNode?.type === "class" && draft && "className" in draft ? (
            <div className="grid gap-4">
              <FormField label="Class code">
                <Input value={draft.className} onChange={(event) => updateDraft("className", event.target.value)} />
              </FormField>
              <FormField label="Class name">
                <Input value={draft.subject} onChange={(event) => updateDraft("subject", event.target.value)} />
              </FormField>
              <FormField label="Term">
                <TermControls termParts={termParts} ariaPrefix="Class term" onChange={updateTermPart} />
              </FormField>
              <FormField label="Credit hours">
                <Input type="number" min="0" value={draft.creditHours} onChange={(event) => updateDraft("creditHours", event.target.value)} />
              </FormField>
            </div>
          ) : editingNode?.type === "goal" && draft && "jobTitle" in draft ? (
            <div className="grid gap-4">
              <FormField label="Industry">
                <Input value={draft.industry} onChange={(event) => updateDraft("industry", event.target.value)} />
              </FormField>
              <FormField label="Job title">
                <Input value={draft.jobTitle} onChange={(event) => updateDraft("jobTitle", event.target.value)} />
              </FormField>
              <FormField label="Annual salary">
                <Input type="number" min="0" value={draft.annualSalary} onChange={(event) => updateDraft("annualSalary", event.target.value)} />
              </FormField>
            </div>
          ) : editingNode?.type === "experience" && draft && "experienceName" in draft ? (
            <div className="grid gap-4">
              <FormField label="Experience Type">
                <Input value={draft.experienceType} onChange={(event) => updateDraft("experienceType", event.target.value)} />
              </FormField>
              <FormField label="Experience Name">
                <Input value={draft.experienceName} onChange={(event) => updateDraft("experienceName", event.target.value)} />
              </FormField>
              <FormField label="Organization">
                <Input value={draft.organization} onChange={(event) => updateDraft("organization", event.target.value)} />
              </FormField>
              <FormField label="Industry">
                <Input value={draft.industry} onChange={(event) => updateDraft("industry", event.target.value)} />
              </FormField>
              <FormField label="Term">
                <TermControls termParts={termParts} ariaPrefix="Term" onChange={updateTermPart} />
              </FormField>
              <FormField label="Terms Participated">
                <Input type="number" min="0" value={draft.termsParticipated} onChange={(event) => updateDraft("termsParticipated", event.target.value)} />
              </FormField>
              <FormField label="Hours per week">
                <Input type="number" min="0" value={draft.hoursPerWeek} onChange={(event) => updateDraft("hoursPerWeek", event.target.value)} />
              </FormField>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNodeId(null)}>Cancel</Button>
            <Button onClick={saveNode}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium leading-none">
      {label}
      {children}
    </label>
  )
}

function TermControls({
  termParts,
  ariaPrefix,
  onChange,
}: {
  termParts: { season: string; year: string } | null
  ariaPrefix: string
  onChange: (part: "season" | "year", value: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="relative min-w-0">
        <select
          aria-label={`${ariaPrefix} season`}
          className="h-8 w-full appearance-none rounded-lg border border-input bg-transparent pl-3 pr-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          value={termParts?.season ?? "Fall"}
          onChange={(event) => onChange("season", event.target.value)}
        >
          {seasons.map((season) => <option key={season}>{season}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <Input
        aria-label={`${ariaPrefix} year`}
        className="h-8 w-full"
        type="number"
        min="0"
        value={termParts?.year ?? "2026"}
        onChange={(event) => onChange("year", event.target.value)}
      />
    </div>
  )
}