import * as XLSX from 'xlsx';

/**
 * Utility for exporting data to Microsoft Excel (.xlsx) and clean UTF-8 CSV
 * formatted specifically so Excel (especially Spanish/Latin American versions)
 * opens them with perfect column separation, zero garbled accents, and proper widths.
 */

export interface SheetDefinition {
  name: string;
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Downloads a single-sheet native Microsoft Excel workbook (.xlsx)
 */
export function exportToExcel(
  headers: string[],
  rows: (string | number)[][],
  fileName: string,
  sheetName = 'Datos'
): void {
  const safeSheetName = sheetName.replace(/[:\\/?*\[\]]/g, '').slice(0, 31) || 'Datos';
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set intelligent column widths so text and numbers are cleanly legible
  worksheet['!cols'] = headers.map((header, colIndex) => {
    const maxLen = Math.max(
      header.length,
      ...rows.map((row) => (row[colIndex] !== undefined && row[colIndex] !== null ? String(row[colIndex]).length : 0))
    );
    return { wch: Math.min(Math.max(maxLen + 3, 14), 45) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  const cleanFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, cleanFileName);
}

/**
 * Downloads a multi-sheet native Microsoft Excel workbook (.xlsx)
 * Containing all plant modules (Máquinas, Mantenimiento, Producción, 5S, Punto de Equilibrio)
 */
export function exportMultiSheetExcel(
  sheets: SheetDefinition[],
  fileName: string
): void {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ name, headers, rows }) => {
    const safeName = name.replace(/[:\\/?*\[\]]/g, '').slice(0, 31) || 'Hoja';
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet['!cols'] = headers.map((header, colIndex) => {
      const maxLen = Math.max(
        header.length,
        ...rows.map((row) => (row[colIndex] !== undefined && row[colIndex] !== null ? String(row[colIndex]).length : 0))
      );
      return { wch: Math.min(Math.max(maxLen + 3, 14), 45) };
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, safeName);
  });

  const cleanFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, cleanFileName);
}

/**
 * Downloads a clean UTF-8 CSV with BOM and explicit delimiter indicator (sep=;)
 * so Microsoft Excel in Spanish/Latin American systems separates columns perfectly.
 */
export function exportToCsv(
  headers: string[],
  rows: (string | number)[][],
  fileName: string,
  delimiter = ';'
): void {
  const escapeCell = (val: string | number): string => {
    const str = val !== undefined && val !== null ? String(val) : '';
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCell).join(delimiter);
  const rowLines = rows.map((r) => r.map(escapeCell).join(delimiter)).join('\r\n');

  // \uFEFF is UTF-8 BOM, sep=; forces Excel on any regional settings to use semicolon
  const csvContent = `\uFEFFsep=${delimiter}\r\n${headerLine}\r\n${rowLines}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const cleanFileName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  link.setAttribute('download', cleanFileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
