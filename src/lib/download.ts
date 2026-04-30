import { toast } from 'sonner';

/**
 * Capacitor-aware file download.
 * On native (Capacitor), tries Filesystem + Share plugin; falls back to web download.
 * On web, uses standard anchor download.
 */
export async function downloadFile(filename: string, content: string, mimeType: string) {
  const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();

  if (isCapacitor) {
    try {
      // Dynamically import — only works if user has installed plugins
      const { Filesystem, Directory, Encoding } = await import(/* @vite-ignore */ '@capacitor/filesystem' as any);
      await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      toast.success(`Saved to Documents/${filename}`);

      // Try Share plugin
      try {
        const { Share } = await import(/* @vite-ignore */ '@capacitor/share' as any);
        const fileUri = await Filesystem.getUri({ directory: Directory.Documents, path: filename });
        await Share.share({ title: filename, url: fileUri.uri, dialogTitle: 'Share or open' });
      } catch {
        // Share plugin not available — file already saved, that's enough
      }
      return;
    } catch (e) {
      console.warn('Capacitor download failed, falling back to web:', e);
    }
  }

  // Web fallback
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success('Downloaded!');
}
