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
  const inputHandlerRef = useRef<(() => void) | null>(null)
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
    console.log('🔄 [QuillEditor] emitChange chamado com conteúdo:', html)
    if (typeof window === 'undefined') {
      console.log('🔄 [Quill] SSR mode')
      latestOnChangeRef.current(html)
      return
    }

    if (pendingFrameRef.current) {
      window.cancelAnimationFrame(pendingFrameRef.current)
    }

    pendingFrameRef.current = window.requestAnimationFrame(() => {
      pendingFrameRef.current = null
      console.log('✅ [Quill] onChange callback executado')
      
      // Garantir que sempre temos um conteúdo válido, mesmo que vazio
      // Isso evita que o editor envie um valor nulo ou undefined
      const validContent = html || '<p></p>'
      
      // Verificar se o HTML contém conteúdo real
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = validContent
      const hasContent = (tempDiv.textContent?.trim().length || 0) > 0
      console.log('🔍 [QuillEditor] HTML contém conteúdo real?', hasContent, 'Texto:', tempDiv.textContent)
      
      latestOnChangeRef.current(validContent)
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

  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    let isMounted = true

    const initializeEditor = async () => {
      if (!editorRef.current || quillRef.current || isInitialized) {
        return
      }

      const { default: Quill } = await import('quill')

      if (!isMounted || !editorRef.current) {
        return
      }

      // Limpar o editor antes de inicializar
      editorRef.current.innerHTML = ''
      
      // Marcar como inicializado para evitar duplicação
      setIsInitialized(true)

      const quillInstance = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean'],
          ],
        },
        placeholder: 'Digite aqui a descrição detalhada...',
      })

      quillRef.current = quillInstance

      const toolbarModule = quillInstance.getModule('toolbar') as { container?: HTMLElement }
      codeButtonRef.current = toolbarModule?.container?.querySelector('.ql-code-block') ?? null
      codeButtonRef.current?.classList.toggle('ql-active', isHtmlMode)

      // Forçar um conteúdo inicial para evitar o problema de descrição vazia
      if (!value || value === '<p><br></p>') {
        // Se não houver valor inicial, definimos um parágrafo vazio que será detectável
        quillInstance.root.innerHTML = '<p></p>'
        // Emitimos a mudança para atualizar o estado do formulário
        emitChange('<p></p>')
      } else {
        quillInstance.root.innerHTML = value
        // Emitimos a mudança para garantir que o valor inicial seja registrado
        emitChange(value)
      }

      const handleTextChange = () => {
        const html = quillInstance.root.innerHTML
        console.log('🔄 [Quill] text-change event disparado, HTML:', html)
        
        // Verificar se o conteúdo é realmente vazio
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        const textContent = tempDiv.textContent?.trim() || ''
        
        console.log('🔍 [Quill] Conteúdo de texto após mudança:', textContent)
        console.log('🔍 [Quill] HTML após mudança:', html)
        
        // Garantir que o valor nunca seja completamente vazio
        if (html === '' || html === '<p><br></p>') {
          console.log('⚠️ [Quill] Detectado HTML vazio, usando <p></p>')
          emitChange('<p></p>')
        } else {
          emitChange(html)
        }
      }

      // Fallback: também escutar mudanças diretas no contenteditable
      const handleInput = () => {
        const html = quillInstance.root.innerHTML
        console.log('🔄 [Quill] input event disparado, HTML:', html)
        
        // Verificar se o conteúdo é realmente vazio
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        const textContent = tempDiv.textContent?.trim() || ''
        
        console.log('🔍 [Quill] Conteúdo de texto após input:', textContent)
        
        // Garantir que o valor nunca seja completamente vazio
        if (html === '' || html === '<p><br></p>') {
          console.log('⚠️ [Quill] Detectado HTML vazio no input, usando <p></p>')
          emitChange('<p></p>')
        } else {
          emitChange(html)
        }
      }

      changeHandlerRef.current = handleTextChange
      inputHandlerRef.current = handleInput
      quillInstance.on('text-change', handleTextChange)
      quillInstance.root.addEventListener('input', handleInput)
      console.log('✅ [Quill] Listeners registrados (text-change + input)')
      console.log('✅ [Quill] Editor inicializado com valor:', quillInstance.root.innerHTML)
      
      // Disparar um evento de mudança inicial para garantir que o valor seja registrado
      handleTextChange()
    }

    void initializeEditor()

    return () => {
      isMounted = false
      if (quillRef.current && changeHandlerRef.current) {
        quillRef.current.off('text-change', changeHandlerRef.current)
      }
      if (quillRef.current && inputHandlerRef.current) {
        quillRef.current.root.removeEventListener('input', inputHandlerRef.current)
      }
      quillRef.current = null
      changeHandlerRef.current = null
      inputHandlerRef.current = null
      codeButtonRef.current = null
      if (pendingFrameRef.current) {
        if (typeof window !== 'undefined') {
          window.cancelAnimationFrame(pendingFrameRef.current)
        }
        pendingFrameRef.current = null
      }
    }
  }, [toggleHtmlView, isHtmlMode, value, emitChange, isInitialized])

  useEffect(() => {
    if (quillRef.current && !isHtmlMode && quillRef.current.root.innerHTML !== value) {
      // Usar clipboard.dangerouslyPasteHTML para evitar problemas de renderização
      quillRef.current.clipboard.dangerouslyPasteHTML(value || '', 'silent')
    }
  }, [value, isHtmlMode])

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