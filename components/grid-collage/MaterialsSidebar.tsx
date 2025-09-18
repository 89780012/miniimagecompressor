"use client"

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface UploadedImage {
  id: string
  file: File
  url: string
  name: string
  size: number
}

interface MaterialsSidebarProps {
  images: UploadedImage[]
  onFilesSelected: (files: FileList | null) => void
  onClearImages: () => void
  onAutoFill: () => void
  onImageDragStart: (imageId: string) => void
  onImageDragEnd: () => void
  onImageClick: (imageId: string) => void
  draggedImageId: string | null
  selectedCellId: string | null
  assignedImageIds: Set<string>
}

function formatFileSize(size: number, t: ReturnType<typeof useTranslations>) {
  if (size >= 1024 * 1024) {
    return t('gridPage.common.sizeMb', { value: (size / (1024 * 1024)).toFixed(1) })
  }
  if (size >= 1024) {
    return t('gridPage.common.sizeKb', { value: (size / 1024).toFixed(1) })
  }
  return t('gridPage.common.sizeBytes', { value: size })
}

export function MaterialsSidebar({
  images,
  onFilesSelected,
  onClearImages,
  onAutoFill,
  onImageDragStart,
  onImageDragEnd,
  onImageClick,
  draggedImageId,
  selectedCellId,
  assignedImageIds
}: MaterialsSidebarProps) {
  const t = useTranslations()

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(event.target.files)
  }, [onFilesSelected])

  const unassignedImages = images.filter((image) => !assignedImageIds.has(image.id))

  return (
    <Sidebar side="left" className="w-80">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('gridPage.materials.title')}
          </h2>
          <div className="text-sm text-gray-500">
            {t('gridPage.stats.images', { count: images.length })}
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {t('gridPage.materials.description')}
        </p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {t('gridPage.upload.heading')}
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            {/* 文件上传区域 */}
            <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0l-4 4m4-4l4 4m2 8H6a2 2 0 01-2-2V8a2 2 0 012-2h3l2-2h2l2 2h3a2 2 0 012 2v10a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium text-gray-700">{t('gridPage.upload.selectButton')}</span>
              <span className="text-xs text-gray-500">{t('gridPage.upload.supported')}</span>
            </label>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onAutoFill}
                disabled={images.length === 0}
              >
                {t('gridPage.upload.autoFill')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={onClearImages}
                disabled={images.length === 0}
              >
                {t('gridPage.upload.clear')}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>{t('gridPage.images.heading')}</span>
            <span className="text-xs text-gray-400">
              {t('gridPage.images.dragHint')}
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-1">
              {images.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  {t('gridPage.images.empty')}
                </div>
              ) : (
                images.map((image) => {
                  const isAssigned = assignedImageIds.has(image.id)

                  return (
                    <div
                      key={image.id}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition bg-white cursor-pointer',
                        isAssigned
                          ? 'border-blue-200 bg-blue-50/60'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/60',
                        draggedImageId === image.id && 'opacity-50'
                      )}
                      draggable
                      onDragStart={() => onImageDragStart(image.id)}
                      onDragEnd={onImageDragEnd}
                      onClick={() => {
                        if (selectedCellId) {
                          onImageClick(image.id)
                        }
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={image.name}
                        className="h-14 w-14 rounded object-cover border border-gray-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-gray-800">{image.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(image.size, t)}</p>
                      </div>
                      {isAssigned ? (
                        <span className="text-xs font-semibold text-blue-600">
                          {t('gridPage.images.assignedBadge')}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {t('gridPage.images.dragBadge')}
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {unassignedImages.length > 0 && (
              <div className="mt-4 text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-md p-2">
                {t('gridPage.images.unassigned', { count: unassignedImages.length })}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Card className="p-3">
          <div className="text-xs text-gray-600">
            <p className="font-medium text-gray-800 mb-1">
              {t('gridPage.materials.tips.title')}
            </p>
            <ul className="space-y-1">
              <li>• {t('gridPage.materials.tips.dragDrop')}</li>
              <li>• {t('gridPage.materials.tips.multiSelect')}</li>
              <li>• {t('gridPage.materials.tips.autoFill')}</li>
            </ul>
          </div>
        </Card>
      </SidebarFooter>
    </Sidebar>
  )
}