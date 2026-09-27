"use client"

import { useEffect, useState } from "react"
import { BookOpen, BriefcaseBusiness, ChevronRight, Folder, Pencil, Plus, RotateCcw, Target, Trash2 } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type ExplorerNode = {
  id: string
  kind: "experience" | "goal" | "class"
  name: string
}

type NodesUpdatedEvent = CustomEvent<{ nodes: ExplorerNode[] }>
type ContextMenu = { x: number; y: number; node: ExplorerNode }

function requestNewNode(type: "experience" | "class") {
  window.dispatchEvent(new CustomEvent("graph:create-node", { detail: { type } }))
}

function requestEditNode(id: string) {
  window.dispatchEvent(new CustomEvent("graph:edit-node", { detail: { id } }))
}

function requestDeleteNode(id: string) {
  window.dispatchEvent(new CustomEvent("graph:delete-node", { detail: { id } }))
}

function requestReset() {
  window.dispatchEvent(new CustomEvent("graph:reset"))
}

export function GraphExplorer() {
  const [nodes, setNodes] = useState<ExplorerNode[]>([])
  const [expandedFolders, setExpandedFolders] = useState({ experiences: false, classes: false })
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)

  useEffect(() => {
    function updateNodes(event: Event) {
      setNodes((event as NodesUpdatedEvent).detail.nodes)
    }

    window.addEventListener("graph:nodes-updated", updateNodes)
    window.dispatchEvent(new CustomEvent("graph:request-nodes"))
    function closeContextMenu() {
      setContextMenu(null)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeContextMenu()
    }

    document.addEventListener("click", closeContextMenu)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      window.removeEventListener("graph:nodes-updated", updateNodes)
      document.removeEventListener("click", closeContextMenu)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [])

  const goals = nodes.filter((node) => node.kind === "goal")
  const experiences = nodes.filter((node) => node.kind === "experience")
  const classes = nodes.filter((node) => node.kind === "class")

  function toggleFolder(folder: "experiences" | "classes") {
    setExpandedFolders((current) => ({ ...current, [folder]: !current[folder] }))
  }

  function renderNode(node: ExplorerNode, paddingClass: string, showIcon = true) {
    const Icon = node.kind === "experience" ? BriefcaseBusiness : node.kind === "goal" ? Target : BookOpen
    return (
      <div
        className={`flex min-w-0 items-center gap-2 rounded-md py-1.5 pr-1 ${paddingClass} text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}
        key={node.id}
        onContextMenu={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setContextMenu({ x: event.clientX, y: event.clientY, node })
        }}
      >
        {showIcon && <Icon className="size-4 shrink-0 text-sidebar-accent-foreground" />}
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
      </div>
    )
  }

  function renderFolder(
    id: "experiences" | "classes",
    label: string,
    items: ExplorerNode[],
    FolderIcon: typeof Folder,
  ) {
    const expanded = expandedFolders[id]
    return (
      <div>
        <button
          className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => toggleFolder(id)}
          type="button"
        >
          <FolderIcon className="size-4 text-sidebar-accent-foreground" />
          <span className="truncate">{label}</span>
          <span className="ml-auto text-xs text-sidebar-foreground/50">{items.length}</span>
          <ChevronRight className={`size-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>
        {expanded && items.map((node) => renderNode(node, "pl-8", false))}
      </div>
    )
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
      <div className="flex h-9 items-center justify-between pr-2 pl-4 text-xs font-semibold text-sidebar-foreground/60">
        <span>File explorer</span>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  aria-label="Add graph item"
                  className="flex size-6 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  type="button"
                />
              }
            >
              <Plus className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Plus className="size-4" />
                  Create new
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => requestNewNode("experience")}>
                  <BriefcaseBusiness />
                  Experience
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => requestNewNode("class")}>
                  <BookOpen />
                  Class
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            aria-label="Reset graph"
            className="flex size-6 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={requestReset}
            title="Reset graph"
            type="button"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        {goals.map((node) => renderNode(node, "pl-2"))}
        {renderFolder("experiences", "Experiences", experiences, BriefcaseBusiness)}
        {renderFolder("classes", "Classes", classes, BookOpen)}
      </div>
      {contextMenu && (
        <div
          className="fixed z-50 min-w-36 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
          onClick={(event) => event.stopPropagation()}
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              requestEditNode(contextMenu.node.id)
              setContextMenu(null)
            }}
            type="button"
          >
            <Pencil className="size-4" />
            Edit
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50"
            disabled={contextMenu.node.kind === "goal"}
            onClick={() => {
              requestDeleteNode(contextMenu.node.id)
              setContextMenu(null)
            }}
            type="button"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
