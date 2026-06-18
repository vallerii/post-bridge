'use client'

import { useRef, useState } from 'react'
import { uploadFile, deleteFile, validateFile, type MediaFile } from '@/lib/storage/upload'

interface Props {
  userId: string
  value: MediaFile[]
  onChange: (files: MediaFile[]) => void
}

export function MediaUpload({ userId, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<string[]>([])

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return
    const files = Array.from(fileList)
    setErrors([])

    // Валидация
    const validationErrors: string[] = []
    const validFiles: File[] = []
    files.forEach(f => {
      const err = validateFile(f)
      if (err) validationErrors.push(err)
      else validFiles.push(f)
    })
    if (validationErrors.length) setErrors(validationErrors)
    if (!validFiles.length) return

    setUploading(true)

    // Загружаем параллельно
    const results = await Promise.allSettled(
      validFiles.map(async (file) => {
        setProgress(p => ({ ...p, [file.name]: 0 }))
        const result = await uploadFile(file, userId, (pct) => {
          setProgress(p => ({ ...p, [file.name]: pct }))
        })
        return result
      })
    )

    const uploaded: MediaFile[] = []
    const uploadErrors: string[] = []
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') uploaded.push(r.value)
      else uploadErrors.push(`${validFiles[i].name}: ${r.reason?.message}`)
    })

    if (uploadErrors.length) setErrors(prev => [...prev, ...uploadErrors])
    onChange([...value, ...uploaded])
    setProgress({})
    setUploading(false)
  }

  async function handleRemove(file: MediaFile) {
    await deleteFile(file.url)
    onChange(value.filter(f => f.url !== file.url))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const uploadingFiles = Object.entries(progress)

  return (
    <div className="flex flex-col gap-3">

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-[#2A2A32] hover:border-[#6C63FF] rounded-xl p-8 text-center cursor-pointer transition-colors group"
      >
        <div className="text-3xl mb-2">📎</div>
        <div className="text-white text-sm font-semibold group-hover:text-[#A78BFA] transition-colors">
          Натисніть або перетягніть файли
        </div>
        <div className="text-zinc-500 text-xs mt-1">
          Зображення: JPG, PNG, WebP, GIF до 20MB<br />
          Відео: MP4, MOV, AVI, WebM до 200MB<br />
          Можна завантажити кілька файлів одночасно
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/mov,video/quicktime,video/avi,video/webm"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Uploading progress */}
      {uploadingFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          {uploadingFiles.map(([name, pct]) => (
            <div key={name} className="bg-[#1E1E23] rounded-lg p-3">
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span className="truncate mr-2">{name}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1 bg-[#2A2A32] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6C63FF] rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          {errors.map((e, i) => (
            <div key={i} className="text-red-400 text-sm">{e}</div>
          ))}
        </div>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((file) => (
            <div key={file.url} className="relative group aspect-square rounded-lg overflow-hidden bg-[#1E1E23]">
              {file.type === 'image' ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={file.url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                  onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0 }}
                />
              )}

              {/* Overlay info */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <div className="text-white text-xs font-semibold px-2 text-center truncate w-full">
                  {file.type === 'video' ? '🎥' : '🖼️'} {file.name}
                </div>
                <div className="text-zinc-300 text-xs">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleRemove(file) }}
                  className="bg-red-500/80 hover:bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
                >
                  Видалити
                </button>
              </div>

              {/* Type badge */}
              <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                {file.type === 'video' ? '🎥' : '🖼️'}
              </div>
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div className="text-zinc-500 text-xs">
          {value.length} файл{value.length === 1 ? '' : 'и'} •{' '}
          {(value.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(1)} MB загалом
        </div>
      )}
    </div>
  )
}