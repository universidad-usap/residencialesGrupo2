import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToExcel(data: any[], fileName: string, sheetName: string = 'Datos') {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { [sheetName]: worksheet },
      SheetNames: [sheetName]
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob: Blob = new Blob(
      [excelBuffer],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' }
    );

    saveAs(blob, `${fileName}.xlsx`);
  }

  exportToPdf(title: string, headers: string[], rows: any[][], fileName: string) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(title, 14, 15);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 25,
      styles: {
        fontSize: 10
      },
      headStyles: {
        fillColor: [37, 99, 235]
      }
    });

    doc.save(`${fileName}.pdf`);
  }
}