"use client"

import { ChevronDown, Info, Pencil, Target, Trash2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
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
  jobTitle: string
  industry: string
  annualSalary: string
  schoolSpend: string
  onEdit?: () => void
}

type SuggestionKind = "experience" | "class"

type SuggestionData = {
  type: "suggestion"
  kind: SuggestionKind
  actionType: string
  position: string
  industry: string
  targetTerm: string
  feasibility: number
  goalAlignment: number
  why: string[]
  skillsAdded: string[]
  salary: number | null
  onEdit?: () => void
  onDelete?: () => void
}

type ExperienceNode = Node<ExperienceData, "experience">
type GoalNode = Node<GoalData, "goal">
type ClassNode = Node<ClassData, "class">
type UserNode = Node<UserData, "user">
type SuggestionNode = Node<SuggestionData, "suggestion">
type AppNode = ExperienceNode | GoalNode | ClassNode | UserNode | SuggestionNode
type AppData = ExperienceData | GoalData | ClassData | UserData | SuggestionData
type ExplorerNode = { id: string; kind: "experience" | "profile" | "class" | "suggestion"; name: string }

const GRAPH_STORAGE_KEY = "nytinol-graph-data"
const PLAN_API_URL = "/api/plan"
const PLAN_FETCH_TIMEOUT_MS = 120_000

type PlanExperience = {
  experience_type: string
  experience_name: string
  industry: string
  term: string
  role_level: string
  outcome: string
  is_paid: boolean
}

type PlanPayload = {
  major: string
  track: string
  gpa: number
  credits_earned: number
  classes: string[]
  experiences: PlanExperience[]
  job_title: string
  industry: string
  salary: number
  current_term: string
  entry_term: string
  entry_type: string
  work_hours: number
  campus_id: string
  width: number
  depth: number
}

type PlanRecommendation = {
  actionType: string
  position: string
  industry: string
  targetTerm: string
  feasibility: number
  goalAlignment: number
  why: string[]
  skillsAdded: string[]
  salary: number | null
  nextSteps: PlanRecommendation[]
}

const seasons = ["Spring", "Summer", "Fall", "Winter"]

function getTermParts(term: string) {
  const [season = "Fall", year = "2026"] = term.split(" ")
  return { season, year }
}

const initialNodes: AppNode[] = [
  {
    id: "experience-1",
    type: "experience",
    position: { x: -1080, y: -200 },
    data: {
      type: "experience",
      experienceType: "Experience",
      experienceName: "Undergraduate teaching assistant",
      organization: "Computer Science Department",
      industry: "Software Engineering",
      term: "Fall 2025",
      termsParticipated: "2",
      hoursPerWeek: "10",
    },
  },
  {
    id: "experience-2",
    type: "experience",
    position: { x: -810, y: -200 },
    data: {
      type: "experience",
      experienceType: "Research",
      experienceName: "Undergraduate research assistant",
      organization: "Systems and Security Lab",
      industry: "Computer Systems",
      term: "Spring 2026",
      termsParticipated: "1",
      hoursPerWeek: "8",
    },
  },
  {
    id: "experience-3",
    type: "experience",
    position: { x: -540, y: -200 },
    data: {
      type: "experience",
      experienceType: "Internship",
      experienceName: "Software engineering intern",
      organization: "Capital One",
      industry: "Software Engineering",
      term: "Summer 2026",
      termsParticipated: "1",
      hoursPerWeek: "40",
    },
  },
  {
    id: "experience-4",
    type: "experience",
    position: { x: -270, y: -200 },
    data: {
      type: "experience",
      experienceType: "Project",
      experienceName: "ACM club web platform",
      organization: "Association for Computing Machinery",
      industry: "Web Development",
      term: "Spring 2026",
      termsParticipated: "1",
      hoursPerWeek: "6",
    },
  },
  {
    id: "class-1",
    type: "class",
    position: { x: -1350, y: 100 },
    data: {
      type: "class",
      className: "Computer Science I",
      subject: "CMSC 201",
      term: "Fall 2024",
      creditHours: "4",
    },
  },
  {
    id: "class-2",
    type: "class",
    position: { x: -1080, y: 100 },
    data: {
      type: "class",
      className: "Computer Science II",
      subject: "CMSC 202",
      term: "Spring 2025",
      creditHours: "4",
    },
  },
  {
    id: "class-3",
    type: "class",
    position: { x: -810, y: 100 },
    data: {
      type: "class",
      className: "Discrete Structures",
      subject: "CMSC 203",
      term: "Spring 2025",
      creditHours: "3",
    },
  },
  {
    id: "class-4",
    type: "class",
    position: { x: -540, y: 100 },
    data: {
      type: "class",
      className: "Computer Organization and Assembly Language",
      subject: "CMSC 313",
      term: "Fall 2025",
      creditHours: "3",
    },
  },
  {
    id: "class-5",
    type: "class",
    position: { x: -270, y: 100 },
    data: {
      type: "class",
      className: "Data Structures",
      subject: "CMSC 341",
      term: "Fall 2025",
      creditHours: "3",
    },
  },
  {
    id: "class-6",
    type: "class",
    position: { x: -1350, y: 240 },
    data: {
      type: "class",
      className: "Principles of Programming Languages",
      subject: "CMSC 331",
      term: "Spring 2026",
      creditHours: "3",
    },
  },
  {
    id: "class-7",
    type: "class",
    position: { x: -1080, y: 240 },
    data: {
      type: "class",
      className: "Computer Architecture",
      subject: "CMSC 411",
      term: "Spring 2026",
      creditHours: "3",
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
      gpa: "3.6",
      jobTitle: "Solution Architect",
      industry: "Information Technology",
      annualSalary: "120000",
      schoolSpend: "200000",
    },
  },
];

const initialEdges: Edge[] = [
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

function mergeGoalIntoUserGraph(nodes: AppNode[], edges: Edge[]): { nodes: AppNode[]; edges: Edge[] } {
  const goal = nodes.find((node): node is GoalNode => node.type === "goal")
  const user = nodes.find((node): node is UserNode => node.type === "user")
  if (!user) return { nodes, edges }

  const mergedUser: UserNode = {
    ...user,
    data: {
      ...user.data,
      jobTitle: user.data.jobTitle || goal?.data.jobTitle || "Software engineer",
      industry: user.data.industry || goal?.data.industry || "Software Engineering",
      annualSalary: user.data.annualSalary || goal?.data.annualSalary || "120000",
      schoolSpend: user.data.schoolSpend || "200000",
    },
  }

  return {
    nodes: nodes
      .filter((node) => node.type !== "goal")
      .map((node) => (node.id === mergedUser.id ? mergedUser : node)),
    edges: edges.filter((edge) =>
      edge.id !== "goal-user-connection" && edge.source !== "goal-1" && edge.target !== "goal-1"
    ),
  }
}

function parseNumericField(value: string | undefined, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function asFiniteNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function asStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function parseProjectedSalary(value: unknown) {
  const band = asRecord(value)
  if (!band) return null
  const median = asFiniteNumber(band.median)
  return median > 0 ? median : null
}

function parseRecommendations(value: unknown): PlanRecommendation[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const rec = asRecord(item)
    if (!rec) return []
    return [{
      actionType: asString(rec.action_type, "Experience"),
      position: asString(rec.position, "Suggested next step"),
      industry: asString(rec.industry),
      targetTerm: asString(rec.target_term),
      feasibility: asFiniteNumber(rec.feasibility),
      goalAlignment: asFiniteNumber(rec.goal_alignment),
      why: asStringList(rec.why),
      skillsAdded: asStringList(rec.skills_added),
      salary: parseProjectedSalary(rec.projected_salary),
      nextSteps: parseRecommendations(rec.next_steps),
    }]
  })
}

function parsePlanRecommendations(data: unknown) {
  return parseRecommendations(asRecord(data)?.recommendations)
}

function suggestionKindFromRecommendation(actionType: string, position: string): SuggestionKind {
  const haystack = `${actionType} ${position}`.toLowerCase()
  if (/(class|course|credit)/.test(haystack) || /^[a-z]{2,5}\s*\d{3}/i.test(position)) {
    return "class"
  }
  return "experience"
}

function formatPercent(value: number) {
  const ratio = value > 1 ? value / 100 : value
  return `${Math.round(ratio * 100)}%`
}

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString()}`
}

function formatRoi(ratio: number) {
  const percent = Math.round(ratio * 100)
  const sign = percent > 0 ? "+" : ""
  return `${sign}${percent.toLocaleString()}%`
}

const CAREER_YEARS = 40

function degreeRoi(salary: number | null | undefined, schoolSpend: number, careerYears: number) {
  if (salary == null || salary <= 0 || schoolSpend <= 0 || careerYears <= 0) return null
  return (salary * careerYears - schoolSpend) / schoolSpend
}

const RoiInputsContext = createContext({ schoolSpend: 0, careerYears: CAREER_YEARS })

const SUGGESTION_COLUMN_GAP = 300
const SUGGESTION_ROW_GAP = 132

function measureSuggestionTree(recommendations: PlanRecommendation[]): number {
  if (recommendations.length === 0) return 0
  return recommendations.reduce((total, recommendation, index) => {
    const childHeight = recommendation.nextSteps.length > 0
      ? measureSuggestionTree(recommendation.nextSteps)
      : SUGGESTION_ROW_GAP
    return total + Math.max(SUGGESTION_ROW_GAP, childHeight) + (index > 0 ? 12 : 0)
  }, 0)
}

function buildSuggestionGraph(
  recommendations: PlanRecommendation[],
  origin: { x: number; y: number },
  parentId: string,
  idFactory: { current: number },
): { nodes: SuggestionNode[]; edges: Edge[] } {
  const nodes: SuggestionNode[] = []
  const edges: Edge[] = []
  let cursorY = origin.y

  for (const recommendation of recommendations) {
    const subtreeHeight = Math.max(
      SUGGESTION_ROW_GAP,
      recommendation.nextSteps.length > 0 ? measureSuggestionTree(recommendation.nextSteps) : SUGGESTION_ROW_GAP,
    )
    const id = `suggestion-${idFactory.current++}`
    nodes.push({
      id,
      type: "suggestion",
      position: { x: origin.x, y: cursorY + subtreeHeight / 2 - SUGGESTION_ROW_GAP / 2 },
      data: {
        type: "suggestion",
        kind: suggestionKindFromRecommendation(recommendation.actionType, recommendation.position),
        actionType: recommendation.actionType,
        position: recommendation.position,
        industry: recommendation.industry,
        targetTerm: recommendation.targetTerm,
        feasibility: recommendation.feasibility,
        goalAlignment: recommendation.goalAlignment,
        why: recommendation.why,
        skillsAdded: recommendation.skillsAdded,
        salary: recommendation.salary,
      },
    })
    edges.push({
      id: `suggestion-edge-${parentId}-${id}`,
      source: parentId,
      target: id,
      deletable: false,
    })
    if (recommendation.nextSteps.length > 0) {
      const nested = buildSuggestionGraph(
        recommendation.nextSteps,
        { x: origin.x + SUGGESTION_COLUMN_GAP, y: cursorY },
        id,
        idFactory,
      )
      nodes.push(...nested.nodes)
      edges.push(...nested.edges)
    }
    cursorY += subtreeHeight + 12
  }

  return { nodes, edges }
}

function buildPlanPayloadFromStoredGraph(): PlanPayload {
  let graphNodes = initialNodes

  try {
    const storedGraph = localStorage.getItem(GRAPH_STORAGE_KEY)
    if (storedGraph) {
      const parsed = JSON.parse(storedGraph) as { nodes?: AppNode[] }
      if (Array.isArray(parsed.nodes)) {
        graphNodes = parsed.nodes
      }
    }
  } catch {
    graphNodes = initialNodes
  }

  const user = graphNodes.find((node): node is UserNode => node.type === "user")
  const goal = graphNodes.find((node): node is GoalNode => node.type === "goal")
  const classes = graphNodes.filter((node): node is ClassNode => node.type === "class")
  const experiences = graphNodes.filter((node): node is ExperienceNode => node.type === "experience")
  const terms = [...classes, ...experiences]
    .map((node) => node.data.term)
    .filter((term) => term.trim().length > 0)
  const jobTitle = user?.data.jobTitle || goal?.data.jobTitle || ""
  const industry = user?.data.industry || goal?.data.industry || ""

  return {
    major: user?.data.major ?? "",
    track: industry,
    gpa: parseNumericField(user?.data.gpa),
    credits_earned: classes.reduce((total, node) => total + parseNumericField(node.data.creditHours), 0),
    classes: classes.map((node) =>
      (node.data.subject || node.data.className).replaceAll(" ", "")
    ),
    experiences: experiences.map((node) => ({
      experience_type: node.data.experienceType,
      experience_name: node.data.experienceName,
      industry: node.data.industry,
      term: node.data.term,
      role_level: node.data.experienceType,
      outcome: "Completed",
      is_paid: false,
    })),
    job_title: jobTitle,
    industry,
    salary: parseNumericField(user?.data.annualSalary || goal?.data.annualSalary),
    current_term: terms[0] ?? "",
    entry_term: "Fall 2023",
    entry_type: "First-Time Freshman",
    work_hours: experiences.reduce((total, node) => total + parseNumericField(node.data.hoursPerWeek), 0),
    campus_id: "",
    width: 3,
    depth: 3,
  }
}

async function fetchPlan(signal: AbortSignal): Promise<PlanRecommendation[]> {
  const payload = buildPlanPayloadFromStoredGraph()
  console.log("plan payload", payload)

  const response = await fetch(PLAN_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  const data: unknown = await response.json()
  console.log(data)
  return parsePlanRecommendations(data)
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

function UserNodeCard({ data }: NodeProps<UserNode>) {
  const { user } = useUser()
  const displayName = user?.fullName || user?.username || data.name

  function stopNodePointer(event: React.PointerEvent) {
    event.stopPropagation()
  }

  const profileName = data.name.trim() && data.name !== "Your name"
    ? data.name
    : displayName
  const salaryLabel = `${formatMoney(Number(data.annualSalary || 0))} / year`
  const schoolSpend = parseNumericField(data.schoolSpend)

  return (
    <Card size="sm" className="relative w-80 overflow-visible border-0 py-0 shadow-md ring-primary/20">
      <Handle className="z-10" style={{ left: "-1px", width: "8px", height: "8px" }} type="target" position={Position.Left} />
      <Handle className="z-10" style={{ right: "-1px", width: "8px", height: "8px" }} type="source" position={Position.Right} />
      <Button
        aria-label="Edit profile and goal"
        className="nodrag absolute top-3 right-3 z-10 size-7 rounded-md p-0"
        onClick={(event) => { event.stopPropagation(); data.onEdit?.() }}
        onPointerDown={stopNodePointer}
        size="icon-xs"
        title="Edit profile and goal"
        variant="secondary"
      >
        <Pencil />
      </Button>
      <CardHeader className="gap-4 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 pr-9">
          <div
            aria-label={`${profileName} profile`}
            className="size-14 shrink-0 rounded-full object-cover ring-2 ring-primary/15 ring-offset-2 ring-offset-background"
            role="img"
            style={{ backgroundImage: `url(${user?.imageUrl || data.profileImageUrl})`, backgroundPosition: "center", backgroundSize: "cover" }}
          />
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">You</p>
            <CardTitle className="truncate text-base">{profileName}</CardTitle>
            <CardDescription className="truncate text-xs">
              {data.major}
              {data.gpa ? ` · ${data.gpa} GPA` : ""}
            </CardDescription>
            {schoolSpend > 0 ? (
              <p className="truncate text-xs text-muted-foreground">{formatMoney(schoolSpend)} spent on school</p>
            ) : null}
          </div>
        </div>
        <div className="rounded-xl bg-muted/70 px-3 py-3">
          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            <Target className="size-3" />
            Goal
          </div>
          <CardTitle className="mt-1.5 truncate text-sm">{data.jobTitle || "Add a goal"}</CardTitle>
          <CardDescription className="truncate text-xs">
            {data.industry || "Industry"} · {salaryLabel}
          </CardDescription>
        </div>
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

function SuggestionNodeCard({ data }: NodeProps<SuggestionNode>) {
  const { schoolSpend, careerYears } = useContext(RoiInputsContext)
  const roi = degreeRoi(data.salary, schoolSpend, careerYears)

  function stopNodePointer(event: React.PointerEvent) {
    event.stopPropagation()
  }

  const label = data.kind === "class" ? "Future class" : "Future experience"
  const roiLabel = data.kind === "class" || roi == null ? null : `ROI ${formatRoi(roi)}`

  return (
    <Card size="sm" className="relative min-w-64 overflow-visible border-dashed py-0 shadow-sm ring-border">
      <Handle className="z-10" style={{ left: "-1px", width: "7px", height: "7px" }} type="target" position={Position.Left} />
      <Handle className="z-10" style={{ right: "-1px", width: "7px", height: "7px" }} type="source" position={Position.Right} />
      <CardHeader className="px-2.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <Badge className="text-[10px]">{label}</Badge>
          {data.targetTerm ? <Badge variant="secondary" className="text-[10px]">{data.targetTerm}</Badge> : null}
          <div className="ml-auto flex items-center gap-1">
            <Button aria-label={`About ${label}`} className="nodrag size-6 rounded-md p-0" onClick={(event) => { event.stopPropagation(); data.onEdit?.() }} onPointerDown={stopNodePointer} size="icon-xs" title={`About ${label}`} variant="secondary">
              <Info />
            </Button>
            <Button aria-label={`Delete ${label}`} className="nodrag size-6 rounded-md p-0" onClick={(event) => { event.stopPropagation(); data.onDelete?.() }} onPointerDown={stopNodePointer} size="icon-xs" title={`Delete ${label}`} variant="secondary">
              <Trash2 />
            </Button>
          </div>
        </div>
        <CardTitle className="truncate text-sm">{data.position}</CardTitle>
        <CardDescription className="truncate text-xs">
          {roiLabel ?? data.actionType} · {formatPercent(data.goalAlignment)} closer to goal
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

const nodeTypes = { experience: ExperienceNodeCard, class: ClassNodeCard, user: UserNodeCard, suggestion: SuggestionNodeCard }

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
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const nodesRef = useRef(nodes)
  const reactFlowInstanceRef = useRef(reactFlowInstance)
  const generatingRef = useRef(false)
  const planAbortRef = useRef<AbortController | null>(null)
  const generateSuggestionsRef = useRef<() => Promise<void>>(async () => {})

  nodesRef.current = nodes
  reactFlowInstanceRef.current = reactFlowInstance

  useEffect(() => {
    try {
      const savedGraph = localStorage.getItem(GRAPH_STORAGE_KEY)
      if (savedGraph) {
        const parsed = JSON.parse(savedGraph) as { nodes?: AppNode[]; edges?: Edge[] }
        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
          const merged = mergeGoalIntoUserGraph(parsed.nodes, parsed.edges)
          setNodes(merged.nodes)
          setEdges(merged.edges)
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
            : node.type === "suggestion"
              ? { ...node, data: draft as SuggestionData }
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

  const generateSuggestions = useCallback(async () => {
    planAbortRef.current?.abort()
    const abortController = new AbortController()
    planAbortRef.current = abortController
    generatingRef.current = true
    setIsGeneratingSuggestions(true)
    const timeoutId = window.setTimeout(() => abortController.abort(), PLAN_FETCH_TIMEOUT_MS)

    try {
      const recommendations = await fetchPlan(abortController.signal)
      if (abortController.signal.aborted) return
      const userNode = nodesRef.current.find((node) => node.type === "user")
      const origin = {
        x: (userNode?.position.x ?? 50) + 380,
        y: (userNode?.position.y ?? 0) - 80,
      }
      const built = buildSuggestionGraph(recommendations, origin, "user-1", { current: Date.now() })
      setNodes((currentNodes) => [
        ...currentNodes.filter((node) => node.type !== "suggestion"),
        ...built.nodes,
      ])
      setEdges((currentEdges) => [
        ...currentEdges.filter((edge) => !edge.id.startsWith("suggestion-edge-")),
        ...built.edges,
      ])
      window.setTimeout(() => {
        void reactFlowInstanceRef.current?.fitView({ padding: 0.2, duration: 400 })
      }, 50)
    } catch (error) {
      if (abortController.signal.aborted) return
      console.error("Error:", error)
    } finally {
      window.clearTimeout(timeoutId)
      if (planAbortRef.current === abortController) {
        generatingRef.current = false
        setIsGeneratingSuggestions(false)
        planAbortRef.current = null
      }
    }
  }, [setEdges, setNodes])

  generateSuggestionsRef.current = generateSuggestions

  const handleGenerateSuggestions = useCallback(() => {
    void generateSuggestionsRef.current()
  }, [])

  useEffect(() => {
    window.addEventListener("graph:generate-suggestions", handleGenerateSuggestions)
    return () => window.removeEventListener("graph:generate-suggestions", handleGenerateSuggestions)
  }, [handleGenerateSuggestions])

  useEffect(() => {
    function publishGenerating() {
      window.dispatchEvent(new CustomEvent("graph:generating-suggestions", {
        detail: { generating: isGeneratingSuggestions },
      }))
    }

    publishGenerating()
    window.addEventListener("graph:request-generating", publishGenerating)
    return () => window.removeEventListener("graph:request-generating", publishGenerating)
  }, [isGeneratingSuggestions])

  useEffect(() => {
    return () => {
      planAbortRef.current?.abort()
    }
  }, [])

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
      setIsGeneratingSuggestions(false)
      generatingRef.current = false
      planAbortRef.current?.abort()
    }

    window.addEventListener("graph:reset", resetGraph)
    return () => window.removeEventListener("graph:reset", resetGraph)
  }, [setEdges, setNodes])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("graph:nodes-updated", {
      detail: {
        nodes: nodes.flatMap<ExplorerNode>((node) => {
          if (node.type === "experience") return [{ id: node.id, kind: "experience", name: node.data.experienceName }]
          if (node.type === "user") return [{ id: node.id, kind: "profile", name: node.data.jobTitle || "You" }]
          if (node.type === "class") return [{ id: node.id, kind: "class", name: node.data.className }]
          if (node.type === "suggestion") return [{ id: node.id, kind: "suggestion", name: node.data.position }]
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
    if (node.type === "class") {
      return {
        ...node,
        data: { ...node.data, onEdit: () => openNodeEditor(node), onDelete: () => deleteNode(node.id) },
      }
    }
    if (node.type === "suggestion") {
      return {
        ...node,
        data: { ...node.data, onEdit: () => openNodeEditor(node), onDelete: () => deleteNode(node.id) },
      }
    }
    if (node.type === "user") {
      return {
        ...node,
        data: {
          ...node.data,
          onEdit: () => openNodeEditor(node),
        },
      }
    }
    return node
  })

  const profile = nodes.find((node): node is UserNode => node.type === "user")?.data
  const schoolSpend = parseNumericField(profile?.schoolSpend)
  const careerYears = CAREER_YEARS
  const suggestionRoi = editingNode?.type === "suggestion" && draft?.type === "suggestion" && draft.kind !== "class"
    ? degreeRoi(draft.salary, schoolSpend, careerYears)
    : null

  return (
    <RoiInputsContext.Provider value={{ schoolSpend, careerYears }}>
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
              {editingNode?.type === "class"
                ? "Edit class"
                : editingNode?.type === "user"
                  ? "Edit profile"
                  : editingNode?.type === "suggestion"
                    ? editingNode.data.kind === "class" ? "Future class" : "Future experience"
                    : "Edit experience"}
            </DialogTitle>
            <DialogDescription>
              {editingNode?.type === "suggestion"
                ? "This suggested next step came from the planner."
                : "Update the information shown on this node."}
            </DialogDescription>
          </DialogHeader>
          {editingNode?.type === "user" && draft && "gpa" in draft ? (
            <div className="grid gap-4">
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Profile</p>
              <FormField label="Age">
                <Input type="number" min="0" value={draft.age} onChange={(event) => updateDraft("age", event.target.value)} />
              </FormField>
              <FormField label="Major">
                <Input value={draft.major} onChange={(event) => updateDraft("major", event.target.value)} />
              </FormField>
              <FormField label="GPA">
                <Input type="number" min="0" step="0.01" value={draft.gpa} onChange={(event) => updateDraft("gpa", event.target.value)} />
              </FormField>
              <FormField label="Money spent on school">
                <Input type="number" min="0" value={draft.schoolSpend ?? ""} onChange={(event) => updateDraft("schoolSpend", event.target.value)} />
              </FormField>
              <p className="pt-2 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Goal</p>
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
          ) : editingNode?.type === "suggestion" && draft && draft.type === "suggestion" ? (
            <div className="grid gap-3 text-sm">
              {suggestionRoi != null ? (
                <p><span className="font-medium">ROI:</span> {formatRoi(suggestionRoi)} over {careerYears} years</p>
              ) : (
                <p><span className="font-medium">Type:</span> {draft.actionType}</p>
              )}
              <p><span className="font-medium">Name:</span> {draft.position}</p>
              {draft.industry ? <p><span className="font-medium">Industry:</span> {draft.industry}</p> : null}
              {draft.targetTerm ? <p><span className="font-medium">Term:</span> {draft.targetTerm}</p> : null}
              <p><span className="font-medium">Goal alignment:</span> {formatPercent(draft.goalAlignment)}</p>
              <p><span className="font-medium">Feasibility:</span> {formatPercent(draft.feasibility)}</p>
              {draft.kind !== "class" && draft.salary != null && draft.salary > 0 ? (
                <p><span className="font-medium">Projected salary:</span> {formatMoney(draft.salary)} / year</p>
              ) : null}
              {draft.skillsAdded.length > 0 ? (
                <p><span className="font-medium">Skills added:</span> {draft.skillsAdded.join(", ")}</p>
              ) : null}
              {draft.why.length > 0 ? (
                <div className="grid gap-1.5">
                  <span className="font-medium">Why</span>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    {draft.why.map((reason) => <li key={reason}>{reason}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
          <DialogFooter>
            {editingNode?.type === "suggestion" ? (
              <Button onClick={cancelEditing}>Close</Button>
            ) : (
              <>
                <Button variant="outline" onClick={cancelEditing}>Cancel</Button>
                <Button onClick={saveNode}>Save changes</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
    </RoiInputsContext.Provider>
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