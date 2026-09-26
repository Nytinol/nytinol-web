"use client"

import { useEffect, useState, type MouseEvent } from "react"
import {
  ChevronLeft,
  FileText,
  Folder,
  FolderPlus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  | { kind: "file"; name: string }

type ContextMenuPosition = {
  x: number
  y: number
  target: ContextMenuTarget
}

type NameDialog =
  | { kind: "file" }
  | { kind: "folder" }
  | { kind: "rename-folder"; id: string }
  | { kind: "rename-file"; name: string }

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function GraphExplorer() {
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [rootFiles, setRootFiles] = useState<string[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null)
  const [nameDialog, setNameDialog] = useState<NameDialog | null>(null)
  const [draftName, setDraftName] = useState("")

  const currentFolder = folders.find((folder) => folder.id === currentFolderId)
  const files = currentFolder ? currentFolder.files : rootFiles

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

  function addFile(name: string) {
    if (currentFolderId) {
      setFolders((currentFolders) =>
        currentFolders.map((folder) =>
          folder.id === currentFolderId
            ? { ...folder, files: [...folder.files, name] }
            : folder
        )
      )
    } else {
      setRootFiles((currentFiles) => [...currentFiles, name])
    }
  }

  function addFolder(name: string) {
    setFolders((currentFolders) => [
      ...currentFolders,
      { id: createId(), name, parentId: currentFolderId, files: [] },
    ])
  }

  function isCurrentFolderOrDescendant(folderId: string) {
    if (!currentFolderId) return false
    if (currentFolderId === folderId) return true

    let parentId = folders.find((folder) => folder.id === currentFolderId)?.parentId
    while (parentId) {
      if (parentId === folderId) return true
      parentId = folders.find((folder) => folder.id === parentId)?.parentId ?? null
    }

    return false
  }

  function deleteTarget(target: ContextMenuTarget) {
    if (target.kind === "folder") {
      setFolders((currentFolders) => {
        const deletedIds = new Set([target.id])
        let changed = true

        while (changed) {
          changed = false
          currentFolders.forEach((folder) => {
            if (folder.parentId && deletedIds.has(folder.parentId)) {
              deletedIds.add(folder.id)
              changed = true
            }
          })
        }

        return currentFolders.filter((folder) => !deletedIds.has(folder.id))
      })

      if (isCurrentFolderOrDescendant(target.id)) setCurrentFolderId(null)
    }

    if (target.kind === "file") {
      if (currentFolderId) {
        setFolders((currentFolders) =>
          currentFolders.map((folder) =>
            folder.id === currentFolderId
              ? { ...folder, files: folder.files.filter((file) => file !== target.name) }
              : folder
          )
        )
      } else {
        setRootFiles((currentFiles) => currentFiles.filter((file) => file !== target.name))
      }
    }

    setContextMenu(null)
  }

  function renameTarget(target: ContextMenuTarget, name: string) {
    if (target.kind === "folder") {
      setFolders((currentFolders) =>
        currentFolders.map((folder) =>
          folder.id === target.id ? { ...folder, name } : folder
        )
      )
    }

    if (target.kind === "file") {
      if (currentFolderId) {
        setFolders((currentFolders) =>
          currentFolders.map((folder) =>
            folder.id === currentFolderId
              ? { ...folder, files: folder.files.map((file) => file === target.name ? name : file) }
              : folder
          )
        )
      } else {
        setRootFiles((currentFiles) => currentFiles.map((file) => file === target.name ? name : file))
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

    if (nameDialog.kind === "file") addFile(name)
    if (nameDialog.kind === "folder") addFolder(name)
    if (nameDialog.kind === "rename-folder") renameTarget({ kind: "folder", id: nameDialog.id }, name)
    if (nameDialog.kind === "rename-file") renameTarget({ kind: "file", name: nameDialog.name }, name)

    setNameDialog(null)
    setDraftName("")
  }

  function openContextMenu(
    event: MouseEvent<HTMLElement>,
    target: ContextMenuTarget = { kind: "background" }
  ) {
    event.preventDefault()
    event.stopPropagation()
    setContextMenu({ x: event.clientX, y: event.clientY, target })
  }

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col group-data-[collapsible=icon]:hidden"
      onContextMenu={openContextMenu}
    >
      <div className="flex h-9 items-center justify-between px-2 text-xs font-semibold text-sidebar-foreground/60">
        <div className="flex min-w-0 items-center gap-1">
          {currentFolder && (
            <button
              type="button"
              aria-label="Back to graphs"
              className="flex size-6 shrink-0 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => setCurrentFolderId(null)}
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
          <span className="truncate">{currentFolder?.name ?? "Graphs"}</span>
        </div>
        <button
          type="button"
          aria-label="Add new graph file"
          className="flex size-6 shrink-0 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => openNameDialog({ kind: "file" })}
        >
          <Plus className="size-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2">
        {folders
          .filter((folder) => folder.parentId === currentFolderId)
          .map((folder) => (
            <button
              key={folder.id}
              type="button"
              className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => setCurrentFolderId(folder.id)}
              onContextMenu={(event) => openContextMenu(event, { kind: "folder", id: folder.id })}
            >
              <Folder className="size-4 shrink-0 text-sidebar-accent-foreground" />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}

        {files.map((file) => (
          <button
            key={file}
            type="button"
            className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onContextMenu={(event) => openContextMenu(event, { kind: "file", name: file })}
          >
            <FileText className="size-4 shrink-0 text-sidebar-accent-foreground" />
            <span className="truncate">{file}</span>
          </button>
        ))}
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 min-w-40 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          {contextMenu.target.kind === "background" ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => openNameDialog({ kind: "folder" })}
            >
              <FolderPlus className="size-4" />
              New folder
            </button>
          ) : (
            <>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  const target = contextMenu.target
                  if (target.kind === "folder") {
                    const folder = folders.find((item) => item.id === target.id)
                    openNameDialog({ kind: "rename-folder", id: target.id }, folder?.name ?? "")
                  } else if (target.kind === "file") {
                    openNameDialog({ kind: "rename-file", name: target.name }, target.name)
                  }
                }}
              >
                <Pencil className="size-4" />
                Rename {contextMenu.target.kind}
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
                onClick={() => deleteTarget(contextMenu.target)}
              >
                <Trash2 className="size-4" />
                Delete {contextMenu.target.kind}
              </button>
            </>
          )}
        </div>
      )}

      <Dialog
        open={nameDialog !== null}
        onOpenChange={(open) => {
          if (!open) setNameDialog(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {nameDialog?.kind === "file" && "New graph file"}
              {nameDialog?.kind === "folder" && "New folder"}
              {nameDialog?.kind === "rename-file" && "Rename file"}
              {nameDialog?.kind === "rename-folder" && "Rename folder"}
            </DialogTitle>
            <DialogDescription>Enter a name for this item.</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              submitName()
            }}
          >
            <Input
              autoFocus
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Name"
            />
            <DialogFooter className="flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setNameDialog(null)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
