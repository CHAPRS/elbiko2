// Общие стили печатных документов (договор, акты, доп. соглашение).
// Используются на странице заполнения и внутри сохранённого HTML-снапшота.
export const DOC_CSS = `
  .doc-page { font-family: 'Times New Roman', Times, serif; font-size: 11.5pt; line-height: 1.45; color: #000; }
  .doc-page p { margin: 0 0 6pt; text-align: justify; }
  .doc-page .doc-title { text-align: center; font-weight: bold; font-size: 13pt; margin: 0 0 10pt; }
  .doc-page .doc-subtitle { text-align: center; font-weight: bold; margin: 0 0 8pt; }
  .doc-page .doc-city { display: flex; justify-content: space-between; margin-bottom: 8pt; }
  .doc-page .doc-h { font-weight: bold; margin: 10pt 0 4pt; }
  .doc-page ul { margin: 0 0 6pt 18pt; padding: 0; }
  .doc-page table { width: 100%; border-collapse: collapse; margin: 4pt 0 8pt; }
  .doc-page td, .doc-page th { border: 1px solid #000; padding: 3pt 5pt; vertical-align: top; text-align: left; }
  .doc-page .doc-sign { display: flex; justify-content: space-between; margin-top: 16pt; gap: 30pt; }
  .doc-page .doc-sign > div { width: 48%; }
  .doc-page .doc-sign p { text-align: left; }
  .doc-field { border: none; border-bottom: 1px solid #555; background: #fffbe8; font: inherit; padding: 0 2px; outline: none; min-width: 40px; }
  .doc-field:focus { border-bottom-color: #000; background: #fff3c4; }
  .doc-field-wide { width: 100%; }
  .doc-field.area { width: 100%; border: 1px solid #999; resize: vertical; }
  @media print {
    .doc-field { border-bottom: none; background: transparent; }
    .doc-field.area { border: none; }
    @page { size: A4; margin: 15mm 15mm 15mm 20mm; }
  }
`;
