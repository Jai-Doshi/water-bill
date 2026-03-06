import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import type { Bill } from '../types';

export const generatePdf = (bill: Bill) => {
    const doc = new jsPDF();

    const formatDate = (dateStr: string) => {
        try {
            return format(parseISO(dateStr), 'MMM d, yyyy');
        } catch {
            return dateStr;
        }
    };

    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 119, 182); // Primary color
    doc.text('Water Bill Split', 14, 22);

    // Bill Summary
    doc.setFontSize(12);
    doc.setTextColor(3, 4, 94); // Text Primary
    doc.text(`Total Amount: $${bill.amount.toFixed(2)}`, 14, 32);
    doc.text(`Billing Period: ${formatDate(bill.startDate)} - ${formatDate(bill.endDate)}`, 14, 40);

    // Table
    const tableData = bill.peopleDetails.map(d => [
        d.name,
        d.days.toString(),
        `${formatDate(d.startDate)} - ${formatDate(d.endDate)}`,
        `$${d.amountContributed.toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: 50,
        head: [['Person', 'Days Stayed', 'Dates', 'Amount Due']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: {
            fillColor: [0, 180, 216],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
    });

    // Save the PDF
    doc.save(`water-bill-${bill.startDate}-to-${bill.endDate}.pdf`);
};
