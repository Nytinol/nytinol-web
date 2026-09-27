"use client"

import { ChevronDown, Pencil, Trash2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useCallback, useEffect, useState } from "react"
import {
  addEdge,
  applyEdgeChanges,
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
  type EdgeChange,
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
type ExplorerNode = { id: string; kind: "experience" | "goal" | "class"; name: string }

const GRAPH_STORAGE_KEY = "nytinol-graph-data"

const seasons = ["Spring", "Summer", "Fall", "Winter"]

function getTermParts(term: string) {
  const [season = "Fall", year = "2026"] = term.split(" ")
  return { season, year }
}

const initialNodes: AppNode[] = [
  {
    id: "experience-1",
    type: "experience",
    position: { x: -1350, y: -200 },
    data: {
      type: "experience",
      experienceType: "Internship",
      experienceName: "Circuit Design Intern",
      organization: "NVIDIA",
      industry: "IC Design",
      term: "Fall 2026",
      termsParticipated: "1",
      hoursPerWeek: "10",
    },
  },
  {
    id: "experience-2",
    type: "experience",
    position: { x: -1080, y: -200 },
    data: {
      type: "experience",
      experienceType: "Experience",
      experienceName: "Software engineering intern",
      organization: "Civic technology lab",
      industry: "Software Engineering",
      term: "Fall 2026",
      termsParticipated: "1",
      hoursPerWeek: "10",
    },
  },
  {
    id: "experience-3",
    type: "experience",
    position: { x: -810, y: -200 },
    data: {
      type: "experience",
      experienceType: "Experience",
      experienceName: "Web application developer",
      organization: "Campus services team",
      industry: "Information Systems",
      term: "Spring 2027",
      termsParticipated: "1",
      hoursPerWeek: "12",
    },
  },
  {
    id: "experience-4",
    type: "experience",
    position: { x: -540, y: -200 },
    data: {
      type: "experience",
      experienceType: "Research",
      experienceName: "Data engineering assistant",
      organization: "Institutional research office",
      industry: "Data Engineering",
      term: "Fall 2027",
      termsParticipated: "1",
      hoursPerWeek: "8",
    },
  },
  {
    id: "experience-5",
    type: "experience",
    position: { x: -270, y: -200 },
    data: {
      type: "experience",
      experienceType: "Internship",
      experienceName: "Cybersecurity analyst intern",
      organization: "Regional security operations center",
      industry: "Cybersecurity",
      term: "Summer 2027",
      termsParticipated: "1",
      hoursPerWeek: "20",
    },
  },
  {
    id: "experience-6",
    type: "experience",
    position: { x: -1350, y: -100 },
    data: {
      type: "experience",
      experienceType: "Project",
      experienceName: "Cloud systems automation fellow",
      organization: "Research computing group",
      industry: "Cloud Infrastructure",
      term: "Fall 2027",
      termsParticipated: "1",
      hoursPerWeek: "10",
    },
  },
  {
    id: "experience-7",
    type: "experience",
    position: { x: -1080, y: -100 },
    data: {
      type: "experience",
      experienceType: "Experience",
      experienceName: "Technology product apprentice",
      organization: "Student innovation studio",
      industry: "Product Management",
      term: "Spring 2027",
      termsParticipated: "1",
      hoursPerWeek: "8",
    },
  },
  {
    id: "experience-8",
    type: "experience",
    position: { x: -810, y: -100 },
    data: {
      type: "experience",
      experienceType: "Research",
      experienceName: "Systems design research assistant",
      organization: "Digital services research lab",
      industry: "Systems Analysis",
      term: "Fall 2027",
      termsParticipated: "1",
      hoursPerWeek: "6",
    },
  },
  {
    id: "experience-9",
    type: "experience",
    position: { x: -540, y: -100 },
    data: {
      type: "experience",
      experienceType: "Project",
      experienceName: "Healthcare interoperability project",
      organization: "Community health network",
      industry: "Health Information Systems",
      term: "Spring 2028",
      termsParticipated: "1",
      hoursPerWeek: "10",
    },
  },
  {
    id: "experience-10",
    type: "experience",
    position: { x: -270, y: -100 },
    data: {
      type: "experience",
      experienceType: "Experience",
      experienceName: "Open-source quality contributor",
      organization: "Open software foundation",
      industry: "Software Quality",
      term: "Summer 2027",
      termsParticipated: "1",
      hoursPerWeek: "6",
    },
  },
  {
    id: "class-1",
    type: "class",
    position: { x: -1080, y: 100 },
    data: {
      type: "class",
      className: "Foundations of Computer Science I",
      subject: "CMSC 201",
      term: "Fall 2026",
      creditHours: "4",
    },
  },
  {
    id: "class-2",
    type: "class",
    position: { x: -810, y: 100 },
    data: {
      type: "class",
      className: "Foundations of Computer Science II",
      subject: "CMSC 202",
      term: "Spring 2027",
      creditHours: "4",
    },
  },
  {
    id: "class-3",
    type: "class",
    position: { x: -540, y: 100 },
    data: {
      type: "class",
      className: "Data Structures",
      subject: "CMSC 341",
      term: "Fall 2027",
      creditHours: "4",
    },
  },
  {
    id: "class-4",
    type: "class",
    position: { x: -270, y: 100 },
    data: {
      type: "class",
      className: "Web Application Architecture",
      subject: "CMSC 426",
      term: "Spring 2028",
      creditHours: "3",
    },
  },
  {
    id: "class-5",
    type: "class",
    position: { x: -1080-270, y: 100 },
    data: {
      type: "class",
      className: "Database Management Systems",
      subject: "CMSC 461",
      term: "Spring 2028",
      creditHours: "3",
    },
  },
  {
    id: "goal-1",
    type: "goal",
    deletable: false,
    position: { x: -270, y: 0 },
    data: {
      type: "goal",
      industry: "Technology",
      jobTitle: "Product designer",
      annualSalary: "95000",
    },
  },
  {
    id: "user-1",
    type: "user",
    position: { x: 50, y: 0 },
    deletable: false,
    data: {
      type: "user",
      profileImageUrl: "",
      name: "Your name",
      age: "20",
      major: "Computer Science",
      gpa: "3.8",
    },
  },
];

const permanentGoalUserEdge: Edge = {
  id: "goal-user-connection",
  source: "goal-1",
  target: "user-1",
  deletable: false,
}

const initialEdges: Edge[] = [
  permanentGoalUserEdge,
  ...initialNodes
    .filter((node) => node.type === "experience" || node.type === "class")
    .map((node) => ({
      id: `${node.id}-user-connection`,
      source: node.id,
      target: "user-1",
      deletable: false,
    })),
]

function cloneGraphData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

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
        <Button className="nodrag w-full" onClick={(event) => {
          interface Experience {
  experience_type: string;
  experience_name: string;
  industry: string;
  term: string;
  role_level: string;
  outcome: string;
  is_paid: boolean;
}

interface PlanPayload {
  major: string;
  track: string;
  gpa: number;
  credits_earned: number;
  classes: string[];
  experiences: Experience[];
  job_title: string;
  industry: string;
  salary: number;
  current_term: string;
  entry_term: string;
  entry_type: string;
  work_hours: number;
  campus_id: string;
  width: number;
  depth: number;
}

const payload: PlanPayload = {
  major: "Computer Science",
  track: "Cybersecurity",
  gpa: 3.1,
  credits_earned: 68,
  classes: ["CMSC201", "CMSC202", "CMSC203", "CMSC341", "MATH151"],
  experiences: [
    {
      experience_type: "Internship",
      experience_name: "ML Engineer",
      industry: "Consulting",
      term: "1",
      role_level: "Intern",
      outcome: "Completed",
      is_paid: false
    }
  ],
  job_title: "senior cybersecurity analyst",
  industry: "Financial Services",
  salary: 115000,
  current_term: "Fall 2026",
  entry_term: "Fall 2023",
  entry_type: "First-Time Freshman",
  work_hours: 0,
  campus_id: "123456",
  width: 3,
  depth: 3
};

async function fetchPlan(): Promise<void> {
  try {
    const response = await fetch('https://nr0cfvl5-8000.use.devtunnels.ms/plan', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: unknown = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchPlan();
        }} onPointerDown={stopNodePointer} size="sm">
          Generate Suggestions
        </Button>
      </CardHeader>
    </Card>
  )
}

const nodeTypes = { experience: ExperienceNodeCard, goal: GoalNodeCard, class: ClassNodeCard, user: UserNodeCard }

export default function GraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes)
  const [edges, setEdges] = useEdgesState<Edge>(initialEdges)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [newNodeId, setNewNodeId] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const editingNode = nodes.find((node) => node.id === editingNodeId)
  const [draft, setDraft] = useState<AppData | null>(null)
  const termParts = draft && "term" in draft ? getTermParts(draft.term) : null
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<AppNode, Edge> | null>(null)

  useEffect(() => {
    try {
      const savedGraph = localStorage.getItem(GRAPH_STORAGE_KEY)
      if (savedGraph) {
        const parsed = JSON.parse(savedGraph) as { nodes?: AppNode[]; edges?: Edge[] }
        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
          setNodes(parsed.nodes)
          setEdges(parsed.edges)
        }
      }
    } catch {
      localStorage.removeItem(GRAPH_STORAGE_KEY)
    } finally {
      setIsHydrated(true)
    }
  }, [setEdges, setNodes])

  useEffect(() => {
    if (!isHydrated) return
    localStorage.setItem(GRAPH_STORAGE_KEY, JSON.stringify({ nodes, edges }))
  }, [edges, isHydrated, nodes])

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((currentEdges) => addEdge(connection, currentEdges)),
    [setEdges]
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      setEdges((currentEdges) => {
        const allowedChanges = changes.filter((change) => change.type !== "remove")
        return applyEdgeChanges(allowedChanges, currentEdges)
      })
    },
    [setEdges]
  )

  function openNodeEditor(node: AppNode) {
    setEditingNodeId(node.id)
    setDraft({ ...node.data })
  }

  useEffect(() => {
    function handleEditNode(event: Event) {
      const id = (event as CustomEvent<{ id: string }>).detail.id
      const node = nodes.find((item) => item.id === id)
      if (node) openNodeEditor(node)
    }

    window.addEventListener("graph:edit-node", handleEditNode)
    return () => window.removeEventListener("graph:edit-node", handleEditNode)
  }, [nodes])

  useEffect(() => {
    function handleDeleteNode(event: Event) {
      const id = (event as CustomEvent<{ id: string }>).detail.id
      if (id === "goal-1" || id === "user-1") return
      setNodes((currentNodes) => currentNodes.filter((node) => node.id !== id))
      setEdges((currentEdges) => currentEdges.filter((edge) => edge.source !== id && edge.target !== id))
      if (editingNodeId === id) {
        setEditingNodeId(null)
        setDraft(null)
      }
    }

    window.addEventListener("graph:delete-node", handleDeleteNode)
    return () => window.removeEventListener("graph:delete-node", handleDeleteNode)
  }, [editingNodeId, setEdges, setNodes])

  function deleteNode(nodeId: string) {
    setNodes((currentNodes) => currentNodes.filter((node) => node.id !== nodeId))
    if (nodeId !== "goal-1" && nodeId !== "user-1") {
      setEdges((currentEdges) => currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
    }
    if (editingNodeId === nodeId) {
      setEditingNodeId(null)
      setDraft(null)
    }
  }

  function cancelEditing() {
    if (newNodeId) {
      setNodes((currentNodes) => currentNodes.filter((node) => node.id !== newNodeId))
      setEdges((currentEdges) => currentEdges.filter((edge) => edge.source !== newNodeId && edge.target !== newNodeId))
    }
    setNewNodeId(null)
    setEditingNodeId(null)
    setDraft(null)
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
    setNewNodeId(null)
    setDraft(null)
  }

  const createExperienceNode = useCallback(() => {
    if (!reactFlowInstance) return

    const position = reactFlowInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const newNode: ExperienceNode = {
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
    }
    setNodes((currentNodes) => [...currentNodes, newNode])
    setEdges((currentEdges) => [...currentEdges, {
      id: `${newNode.id}-user-connection`,
      source: newNode.id,
      target: "user-1",
      deletable: false,
    }])
    setNewNodeId(newNode.id)
    openNodeEditor(newNode)
  }, [reactFlowInstance, setEdges, setNodes])

  const createClassNode = useCallback(() => {
    if (!reactFlowInstance) return

    const position = reactFlowInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const newNode: ClassNode = {
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
    }
    setNodes((currentNodes) => [...currentNodes, newNode])
    setEdges((currentEdges) => [...currentEdges, {
      id: `${newNode.id}-user-connection`,
      source: newNode.id,
      target: "user-1",
      deletable: false,
    }])
    setNewNodeId(newNode.id)
    openNodeEditor(newNode)
  }, [reactFlowInstance, setEdges, setNodes])

  useEffect(() => {
    function handleCreateNode(event: Event) {
      const type = (event as CustomEvent<{ type: "experience" | "class" }>).detail.type
      if (type === "experience") createExperienceNode()
      if (type === "class") createClassNode()
    }

    window.addEventListener("graph:create-node", handleCreateNode)
    return () => window.removeEventListener("graph:create-node", handleCreateNode)
  }, [createClassNode, createExperienceNode])

  useEffect(() => {
    function resetGraph() {
      setNodes(cloneGraphData(initialNodes))
      setEdges(cloneGraphData(initialEdges))
      setNewNodeId(null)
      setEditingNodeId(null)
      setDraft(null)
    }

    window.addEventListener("graph:reset", resetGraph)
    return () => window.removeEventListener("graph:reset", resetGraph)
  }, [setEdges, setNodes])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("graph:nodes-updated", {
      detail: {
        nodes: nodes.flatMap<ExplorerNode>((node) => {
          if (node.type === "experience") return [{ id: node.id, kind: "experience", name: node.data.experienceName }]
          if (node.type === "goal") return [{ id: node.id, kind: "goal", name: node.data.jobTitle }]
          if (node.type === "class") return [{ id: node.id, kind: "class", name: node.data.className }]
          return []
        }),
      },
    }))
  }, [nodes])

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
        data: { ...node.data, onEdit: () => openNodeEditor(node) },
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
        nodeTypes={nodeTypes}
        deleteKeyCode={["Backspace", "Delete"]}
        proOptions={{ hideAttribution: true }}
        fitView
        className="bg-background"
      >
        <Background color="var(--ring)" gap={20} size={1} />
        <Controls />
      </ReactFlow>
      <Dialog
        open={editingNodeId !== null}
        onOpenChange={(open) => {
          if (!open) {
            cancelEditing()
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
            <Button variant="outline" onClick={cancelEditing}>Cancel</Button>
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