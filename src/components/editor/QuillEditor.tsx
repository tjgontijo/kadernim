'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type QuillType from 'quill'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.core.css'
import './quill-styles.css'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function QuillEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const quillRef = useRef<QuillType | null>(null)
  const changeHandlerRef = useRef<(() => void) | null>(null)
  const latestOnChangeRef = useRef(onChange)
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [htmlValue, setHtmlValue] = useState(value)
  const htmlValueRef = useRef(value)
  const codeButtonRef = useRef<HTMLButtonElement | null>(null)
  const pendingFrameRef = useRef<number | null>(null)

  useEffect(() => {
    latestOnChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!isHtmlMode) {
      setHtmlValue(value)
      htmlValueRef.current = value
    }
  }, [value, isHtmlMode])

  useEffect(() => {
    htmlValueRef.current = htmlValue
  }, [htmlValue])

  const emitChange = useCallback((html: string) => {
    if (typeof window === 'undefined') {
      latestOnChangeRef.current(html)
      return
    }

    if (pendingFrameRef.current) {
      window.cancelAnimationFrame(pendingFrameRef.current)
    }

    pendingFrameRef.current = window.requestAnimationFrame(() => {
      pendingFrameRef.current = null
      latestOnChangeRef.current(html)
    })
  }, [])

  const toggleHtmlView = useCallback(() => {
    if (!quillRef.current) {
      return
    }

    setIsHtmlMode((prev) => {
      const nextMode = !prev
      if (!prev) {
        const currentHtml = quillRef.current!.root.innerHTML
        setHtmlValue(currentHtml)
        htmlValueRef.current = currentHtml
        quillRef.current!.enable(false)
      } else {
        quillRef.current!.enable(true)
        quillRef.current!.clipboard.dangerouslyPasteHTML(htmlValueRef.current || '', 'silent')
        emitChange(htmlValueRef.current || '')
      }
      codeButtonRef.current?.classList.toggle('ql-active', nextMode)
      return nextMode
    })
  }, [emitChange])

  useEffect(() => {
    let isMounted = true

    const initializeEditor = async () => {
      if (!editorRef.current || quillRef.current) {
        return
      }

      const { default: Quill } = await import('quill')

      if (!isMounted || !editorRef.current) {
        return
      }

      editorRef.current.innerHTML = ''

      const quillInstance = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ indent: '-1' }, { indent: '+1' }],
              ['link', 'image', 'video'],
              [{ align: [] }],
              [{ color: [] }, { background: [] }],
              ['clean'],
            ],
            handlers: {
              'code-block': () => {
                toggleHtmlView()
              },
            },
          },
        },
      })

      quillRef.current = quillInstance

      const toolbarModule = quillInstance.getModule('toolbar') as { container?: HTMLElement }
      codeButtonRef.current = toolbarModule?.container?.querySelector('.ql-code-block') ?? null
      codeButtonRef.current?.classList.toggle('ql-active', isHtmlMode)

      const handleTextChange = () => {
        emitChange(quillInstance.root.innerHTML)
      }

      changeHandlerRef.current = handleTextChange
      quillInstance.on('text-change', handleTextChange)
      quillInstance.root.innerHTML = value || ''
    }

    void initializeEditor()

    return () => {
      isMounted = false
      if (quillRef.current && changeHandlerRef.current) {
        quillRef.current.off('text-change', changeHandlerRef.current)
      }
      quillRef.current = null
      changeHandlerRef.current = null
      codeButtonRef.current = null
      if (pendingFrameRef.current) {
        if (typeof window !== 'undefined') {
          window.cancelAnimationFrame(pendingFrameRef.current)
        }
        pendingFrameRef.current = null
      }
    }
  }, [toggleHtmlView, isHtmlMode, value, emitChange])

  useEffect(() => {
    if (quillRef.current && quillRef.current.root.innerHTML !== value) {
      quillRef.current.root.innerHTML = value || ''
    }
  }, [value])

  const handleHtmlChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = event.target.value
    setHtmlValue(newHtml)
    htmlValueRef.current = newHtml
    emitChange(newHtml)
  }

  return (
    <div className="quill-wrapper">
      <div ref={editorRef} style={{ display: isHtmlMode ? 'none' : 'block' }} />
      {isHtmlMode && (
        <textarea
          value={htmlValue || ''}
          onChange={handleHtmlChange}
          className="min-h-[220px] w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      )}
    </div>
  )
}