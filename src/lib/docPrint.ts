import { DOC_CSS } from './docCss';

// Печать документа в скрытом iframe: в диалог печати уходит
// только HTML бланка, без меню и интерфейса админки.
export function printDocHtml(title: string, innerHtml: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const safeTitle = title.replace(/[<>]/g, '');
  iframe.srcdoc = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>${safeTitle}</title><style>${DOC_CSS}</style></head><body style="margin:0;background:#fff">${innerHtml}</body></html>`;

  const cleanup = () => {
    setTimeout(() => iframe.remove(), 100);
  };

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) {
      cleanup();
      return;
    }
    win.onafterprint = cleanup;
    win.focus();
    win.print();
    // на случай, если браузер не вызовет onafterprint
    setTimeout(cleanup, 300000);
  };
}
