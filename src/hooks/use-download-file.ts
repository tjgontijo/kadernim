import { useState } from 'react';
import { toast } from 'sonner';

interface DownloadOptions {
  filename?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface ShareOptions extends DownloadOptions {
  title?: string;
  text?: string;
}

/**
 * Hook para download de arquivos com suporte a mobile/iOS/PWA
 *
 * Resolve problemas de:
 * - window.open() bloqueado em iOS
 * - Popup blockers em PWA
 * - Falta de feedback ao usuário
 *
 * @example
 * ```tsx
 * const { downloadFile, shareFile, downloading } = useDownloadFile();
 *
 * <Button
 *   onClick={() => downloadFile('/api/export/file.pdf', 'documento.pdf')}
 *   disabled={downloading === '/api/export/file.pdf'}
 * >
 *   {downloading === '/api/export/file.pdf' ? 'Baixando...' : 'Baixar PDF'}
 * </Button>
 * ```
 */
export function useDownloadFile() {
  const [downloading, setDownloading] = useState<string | null>(null);

  /**
   * Baixa arquivo via fetch + blob (funciona em iOS/PWA)
   */
  const downloadFile = async (url: string, options?: DownloadOptions) => {
    try {
      setDownloading(url);

      // Fetch o arquivo
      const response = await fetch(url, {
        credentials: 'include', // Incluir cookies de auth
      });

      if (!response.ok) {
        throw new Error(`Erro ao baixar: ${response.status} ${response.statusText}`);
      }

      // Converter para blob
      const blob = await response.blob();

      // Extrair filename do Content-Disposition ou usar o fornecido
      let filename = options?.filename;
      if (!filename) {
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, '');
          }
        }
      }

      // Fallback se não conseguir extrair filename
      if (!filename) {
        const extension = blob.type.split('/')[1] || 'bin';
        filename = `download.${extension}`;
      }

      // Criar URL temporária do blob
      const blobUrl = URL.createObjectURL(blob);

      // Criar elemento <a> invisível
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.style.display = 'none';

      // Adicionar ao DOM, clicar, remover
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Limpar URL temporária após um delay (para garantir que o download iniciou)
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);

      // Feedback de sucesso
      toast.success('Arquivo baixado com sucesso!');
      options?.onSuccess?.();
    } catch (error) {
      console.error('[useDownloadFile] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao baixar arquivo';
      toast.error(errorMessage);
      options?.onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setDownloading(null);
    }
  };

  /**
   * Compartilha arquivo via Web Share API (mobile-friendly)
   * Com fallback para download se não suportado
   */
  const shareFile = async (url: string, options?: ShareOptions) => {
    try {
      setDownloading(url);

      // Fetch o arquivo
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();

      // Extrair ou usar filename fornecido
      let filename = options?.filename || 'arquivo';
      const contentDisposition = response.headers.get('Content-Disposition');
      if (!options?.filename && contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }

      // Criar File object
      const file = new File([blob], filename, { type: blob.type });

      // Verificar se Web Share API é suportada
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: options?.title || 'Compartilhar arquivo',
          text: options?.text,
        });

        toast.success('Arquivo compartilhado!');
        options?.onSuccess?.();
      } else {
        // Fallback: download normal
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

        toast.success('Arquivo baixado!');
        options?.onSuccess?.();
      }
    } catch (error) {
      // Se usuário cancelou o share, não mostrar erro
      if (error instanceof Error && error.name === 'AbortError') {
        setDownloading(null);
        return;
      }

      console.error('[useDownloadFile] Share error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao compartilhar arquivo';
      toast.error(errorMessage);
      options?.onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setDownloading(null);
    }
  };

  /**
   * Detecta se está em mobile/tablet
   */
  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  /**
   * Detecta se Web Share API é suportada
   */
  const canShare = () => {
    if (typeof navigator === 'undefined') return false;
    return 'share' in navigator && 'canShare' in navigator;
  };

  return {
    downloadFile,
    shareFile,
    downloading,
    isMobile: isMobile(),
    canShare: canShare(),
  };
}
