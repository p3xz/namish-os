"use client"

import { useState } from "react"
import { ChevronRight, Folder, File } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export type Node = {
  name: string
  nodes?: Node[]
}

interface FilesystemItemProps {
  node: Node
  animated?: boolean
  defaultOpen?: boolean
  onSelect?: (node: Node) => void
  selectedName?: string | null
}

export function FilesystemItem({
  node,
  animated = false,
  defaultOpen = false,
  onSelect,
  selectedName,
}: FilesystemItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const selected = selectedName === node.name

  const ChevronIcon = () =>
    animated ? (
      <motion.span
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="flex"
      >
        <ChevronRight className="size-4 text-white/50" />
      </motion.span>
    ) : (
      <ChevronRight
        className={`size-4 text-white/50 ${isOpen ? "rotate-90" : ""}`}
      />
    )

  const ChildrenList = () => {
    const children = node.nodes?.map((child) => (
      <FilesystemItem
        node={child}
        key={child.name}
        animated={animated}
        onSelect={onSelect}
        selectedName={selectedName}
      />
    ))

    if (animated) {
      return (
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="pl-6 overflow-hidden flex flex-col justify-end"
            >
              {children}
            </motion.ul>
          )}
        </AnimatePresence>
      )
    }

    return isOpen && <ul className="pl-6">{children}</ul>
  }

  return (
    <li key={node.name}>
      <span
        className={`flex items-center gap-1.5 py-1 px-1 rounded-md cursor-pointer transition-colors ${
          selected ? "bg-white/20" : "hover:bg-white/10"
        }`}
        onClick={() => onSelect?.(node)}
      >
        {node.nodes && node.nodes.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(!isOpen)
            }}
            className="p-1 -m-1"
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            <ChevronIcon />
          </button>
        )}

        {node.nodes ? (
          <Folder
            className={`size-5 text-sky-300 ${node.nodes.length === 0 ? "ml-[22px]" : ""}`}
            fill="rgba(14, 165, 233, 0.85)"
          />
        ) : (
          <File className="ml-[22px] size-5 text-white/70" />
        )}
        <span className="text-[13px] text-white/90">{node.name}</span>
      </span>

      <ChildrenList />
    </li>
  )
}
