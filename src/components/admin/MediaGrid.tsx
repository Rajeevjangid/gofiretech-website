'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon } from 'lucide-react'
import MediaCard from './MediaCard'
import type { MediaFileType } from './MediaPreviewModal'

interface MediaGridProps {
  files: MediaFileType[]
  onCardClick: (file: MediaFileType) => void
  onDelete: (id: string) => Promise<void>
  search: string
}

export default function MediaGrid({
  files,
  onCardClick,
  onDelete,
  search,
}: MediaGridProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {search ? `No results for "${search}"` : 'No media files yet'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? 'Try a different search term' : 'Upload your first image using the area above'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      <AnimatePresence initial={false}>
        {files.map((file, i) => (
          <motion.div
            key={file.id}
            layout
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.18, delay: Math.min(i * 0.025, 0.3) }}
          >
            <MediaCard
              file={file}
              onClick={() => onCardClick(file)}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
