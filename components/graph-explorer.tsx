"use client"

import { useEffect, useState, type DragEvent, type MouseEvent, type ReactNode } from "react"
import {
  ChevronRight,
  Network,
  Folder,
  FolderPlus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type FolderItem = {
  id: string
  name: string
  parentId: string | null
  files: string[]
}

type ContextMenuTarget =
  | { kind: "background" }
  | { kind: "folder"; id: string }
  | { kind: "file"; name: string; folderId: string | null }

type NameDialog =
  | { kind: "file"; folderId: string | null }
  | { kind: "folder"; parentId: string | null }
  | { kind: "rename-folder"; id: string }
  | { kind: "rename-file"; name: string; folderId: string | null }

type ContextMenuPosition = {
  x: number
  y: number
  target: ContextMenuTarget
}

type DraggedFile = {
  name: string
  folderId: string | null
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function GraphExplorer() {
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [rootFiles, setRootFiles] = useState<string[]>([])
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set())
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null)
  const [dragOverRoot, setDragOverRoot] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null)
  const [nameDialog, setNameDialog] = useState<NameDialog | null>(null)
  const [draftName, setDraftName] = useState("")

  useEffect(() => {
    function closeContextMenu() {
      setContextMenu(null)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeContextMenu()
    }

    document.addEventListener("click", closeContextMenu)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("click", closeContextMenu)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [])

  function addFile(name: string, folderId: string | null) {
    if (folderId) {
      setFolders((items) => items.map((folder) =>
        folder.id === folderId ? { ...folder, files: [...folder.files, name] } : folder
      ))
    } else {
      setRootFiles((files) => [...files, name])
    }
  }

  function addFolder(name: string, parentId: string | null) {
    const id = createId()
    setFolders((items) => [...items, { id, name, parentId, files: [] }])
    if (parentId) {
      setExpandedFolderIds((ids) => new Set(ids).add(parentId))
    }
  }

  function moveFile(file: DraggedFile, targetFolderId: string) {
    if (file.folderId === targetFolderId) return

    if (file.folderId) {
      setFolders((items) => items.map((folder) => {
        if (folder.id === file.folderId) return { ...folder, files: folder.files.filter((name) => name !== file.name) }
        if (folder.id === targetFolderId) return { ...folder, files: [...folder.files, file.name] }
        return folder
      }))
    } else {
      setRootFiles((files) => files.filter((name) => name !== file.name))
      setFolders((items) => items.map((folder) =>
        folder.id === targetFolderId ? { ...folder, files: [...folder.files, file.name] } : folder
      ))
    }
  }

  function handleDragStart(event: DragEvent<HTMLButtonElement>, file: DraggedFile) {
    event.dataTransfer.setData("application/json", JSON.stringify(file))
    event.dataTransfer.effectAllowed = "copy"
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>, folderId: string) {
    event.preventDefault()
    event.stopPropagation()
    setDragOverFolderId(null)
    const data = event.dataTransfer.getData("application/json")
    if (!data) return
    moveFile(JSON.parse(data) as DraggedFile, folderId)
  }

  function handleRootDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    setDragOverRoot(false)
    const data = event.dataTransfer.getData("application/json")
    if (!data) return

    const file = JSON.parse(data) as DraggedFile
    if (!file.folderId) return

    setFolders((items) => items.map((folder) =>
      folder.id === file.folderId
        ? { ...folder, files: folder.files.filter((name) => name !== file.name) }
        : folder
    ))
    setRootFiles((files) => [...files, file.name])
  }

  function deleteTarget(target: ContextMenuTarget) {
    if (target.kind === "folder") {
      setFolders((items) => {
        const deleted = new Set([target.id])
        let changed = true
        while (changed) {
          changed = false
          items.forEach((folder) => {
            if (folder.parentId && deleted.has(folder.parentId)) {
              deleted.add(folder.id)
              changed = true
            }
          })
        }
        return items.filter((folder) => !deleted.has(folder.id))
      })
    }

    if (target.kind === "file") {
      if (target.folderId) {
        setFolders((items) => items.map((folder) =>
          folder.id === target.folderId
            ? { ...folder, files: folder.files.filter((name) => name !== target.name) }
            : folder
        ))
      } else {
        setRootFiles((files) => files.filter((name) => name !== target.name))
      }
    }
    setContextMenu(null)
  }

  function renameTarget(target: ContextMenuTarget, name: string) {
    if (target.kind === "folder") {
      setFolders((items) => items.map((folder) => folder.id === target.id ? { ...folder, name } : folder))
    }
    if (target.kind === "file") {
      if (target.folderId) {
        setFolders((items) => items.map((folder) => folder.id === target.folderId
          ? { ...folder, files: folder.files.map((file) => file === target.name ? name : file) }
          : folder
        ))
      } else {
        setRootFiles((files) => files.map((file) => file === target.name ? name : file))
      }
    }
    setContextMenu(null)
  }

  function openNameDialog(dialog: NameDialog, initialName = "") {
    setDraftName(initialName)
    setNameDialog(dialog)
    setContextMenu(null)
  }

  function submitName() {
    const name = draftName.trim()
    if (!name || !nameDialog) return
    if (nameDialog.kind === "file") addFile(name, nameDialog.folderId)
    if (nameDialog.kind === "folder") addFolder(name, nameDialog.parentId)
    if (nameDialog.kind === "rename-folder") renameTarget({ kind: "folder", id: nameDialog.id }, name)
    if (nameDialog.kind === "rename-file") renameTarget({ kind: "file", name: nameDialog.name, folderId: nameDialog.folderId }, name)
    setNameDialog(null)
    setDraftName("")
  }

  function openContextMenu(event: MouseEvent<HTMLElement>, target: ContextMenuTarget = { kind: "background" }) {
    event.preventDefault()
    event.stopPropagation()
    setContextMenu({ x: event.clientX, y: event.clientY, target })
  }

  function renderFile(name: string, folderId: string | null, depth: number): ReactNode {
    return (
      <button
        key={`${folderId ?? "root"}-${name}`}
        type="button"
        draggable
        className="flex w-full min-w-0 cursor-grab items-center gap-2 rounded-md py-1.5 pr-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:cursor-grabbing"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onDragStart={(event) => handleDragStart(event, { name, folderId })}
        onContextMenu={(event) => openContextMenu(event, { kind: "file", name, folderId })}
      >
        <Network className="size-4 shrink-0 text-sidebar-accent-foreground" />
        <span className="truncate">{name}</span>
      </button>
    )
  }

  function renderFolder(folder: FolderItem, depth: number): ReactNode {
    const expanded = expandedFolderIds.has(folder.id)
    const children = folders.filter((item) => item.parentId === folder.id)
    return (
      <div key={folder.id}>
        <div className="group flex min-w-0 items-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <button
            type="button"
            className={`flex min-w-0 flex-1 items-center gap-1 py-1.5 pr-1 text-left text-sm ${dragOverFolderId === folder.id ? "cursor-copy bg-sidebar-accent" : ""}`}
            style={{ paddingLeft: `${8 + depth * 16}px` }}
            onClick={() => setExpandedFolderIds((ids) => {
              const next = new Set(ids)
              if (next.has(folder.id)) next.delete(folder.id)
              else next.add(folder.id)
              return next
            })}
            onDragOver={(event) => {
              event.preventDefault()
              event.stopPropagation()
              event.dataTransfer.dropEffect = "copy"
              setDragOverFolderId(folder.id)
              setDragOverRoot(false)
            }}
            onDragLeave={() => setDragOverFolderId(null)}
            onDrop={(event) => handleDrop(event, folder.id)}
            onContextMenu={(event) => openContextMenu(event, { kind: "folder", id: folder.id })}
          >
            <Folder className="size-4 shrink-0 text-sidebar-accent-foreground" />
            <span className="truncate">{folder.name}</span>
            <ChevronRight className={`ml-auto size-4 shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        </div>
        {expanded && (
          <>
            {children.map((child) => renderFolder(child, depth + 1))}
            {folder.files.map((file) => renderFile(file, folder.id, depth + 1))}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col group-data-[collapsible=icon]:hidden" onContextMenu={(event) => openContextMenu(event)}>
      <div className="flex h-9 items-center justify-between pr-2 pl-4 text-xs font-semibold text-sidebar-foreground/60">
        <span>Graphs</span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Add graph item"
                className="flex size-6 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              />
            }
          >
            <Plus className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => openNameDialog({ kind: "file", folderId: null })}>
              <Network />
              New graph
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openNameDialog({ kind: "folder", parentId: null })}>
              <FolderPlus />
              New folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className={`flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 ${dragOverRoot ? "bg-sidebar-accent/40" : ""}`}
        onDragOver={(event) => {
          event.preventDefault()
          event.dataTransfer.dropEffect = "copy"
          setDragOverRoot(true)
        }}
        onDragLeave={() => setDragOverRoot(false)}
        onDrop={handleRootDrop}
      >
        {folders.filter((folder) => folder.parentId === null).map((folder) => renderFolder(folder, 0))}
        {rootFiles.map((file) => renderFile(file, null, 0))}
      </div>

      {contextMenu && (
        <div className="fixed z-50 min-w-40 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(event) => event.stopPropagation()}>
          {contextMenu.target.kind === "background" ? (
            <>
              <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground" onClick={() => openNameDialog({ kind: "file", folderId: null })}>
                <Network className="size-4" /> New graph
              </button>
              <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground" onClick={() => openNameDialog({ kind: "folder", parentId: null })}>
                <FolderPlus className="size-4" /> New folder
              </button>
            </>
          ) : (
            <>
              {contextMenu.target.kind === "folder" && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() =>
                    openNameDialog({
                      kind: "file",
                      folderId: contextMenu.target.kind === "folder"
                        ? contextMenu.target.id
                        : null,
                    })
                  }
                >
                  <Network className="size-4" /> New graph
                </button>
              )}
              <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground" onClick={() => {
                const target = contextMenu.target
                if (target.kind === "folder") {
                  const folder = folders.find((item) => item.id === target.id)
                  openNameDialog({ kind: "rename-folder", id: target.id }, folder?.name ?? "")
                } else if (target.kind === "file") {
                  openNameDialog({ kind: "rename-file", name: target.name, folderId: target.folderId }, target.name)
                }
              }}>
                <Pencil className="size-4" /> Rename {contextMenu.target.kind === "file" ? "graph" : contextMenu.target.kind}
              </button>
              <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10" onClick={() => deleteTarget(contextMenu.target)}>
                <Trash2 className="size-4" /> Delete {contextMenu.target.kind === "file" ? "graph" : contextMenu.target.kind}
              </button>
            </>
          )}
        </div>
      )}

      <Dialog open={nameDialog !== null} onOpenChange={(open) => { if (!open) setNameDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {nameDialog?.kind === "file" && "New graph"}
              {nameDialog?.kind === "folder" && "New folder"}
              {nameDialog?.kind === "rename-file" && "Rename graph"}
              {nameDialog?.kind === "rename-folder" && "Rename folder"}
            </DialogTitle>
            <DialogDescription>Enter a name for this item.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={(event) => { event.preventDefault(); submitName() }}>
            <Input autoFocus value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="Name" />
            <DialogFooter className="flex-row gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setNameDialog(null)}>Cancel</Button>
              <Button type="submit" className="flex-1">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
