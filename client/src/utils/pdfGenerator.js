import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './dates';

export const generateQuotationPDF = (quotation) => {
  const doc = new jsPDF();

  // 1. Header & Branding
  doc.setFontSize(22);
  doc.setTextColor(40);
  doc.text('CODEXLABZ', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Business Management System', 14, 30);

  // 2. Document Title & Meta
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text('QUOTATION / PROPOSAL', 130, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Quote No: ${quotation.quotation_number}`, 130, 30);
  doc.text(`Date: ${formatDate(quotation.quotation_date)}`, 130, 36);
  doc.text(`Valid Until: ${formatDate(quotation.valid_until)}`, 130, 42);

  // 3. Client Details
  doc.setTextColor(40);
  doc.text('Bill To:', 14, 45);
  doc.setFont(undefined, 'bold');
  doc.text(quotation.client_name || 'Client', 14, 51);
  doc.setFont(undefined, 'normal');
  doc.text(`Proposal Type: ${quotation.proposal_type || '—'}`, 14, 57);

  // 4. Line Items Table
  // Note: Adjust the keys (description, quantity, price, total) to match your DB schema
  const tableColumns = ['Description', 'Qty', 'Price (INR)', 'Total (INR)'];
  const tableRows = [];

  const items = quotation.items || quotation.line_items || [];
  items.forEach(item => {
    tableRows.push([
      item.description || '—',
      item.quantity || 1,
      `Rs. ${Number(item.price || 0).toLocaleString('en-IN')}`,
      `Rs. ${Number(item.total || item.amount || 0).toLocaleString('en-IN')}`
    ]);
  });

  autoTable(doc, {
    startY: 65,
    head: [tableColumns],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [59, 110, 168] },
    styles: { fontSize: 10, cellPadding: 5 },
  });

  const finalY = doc.lastAutoTable.finalY || 65;

  // 5. Totals
  doc.setFont(undefined, 'bold');
  doc.text(`Subtotal: Rs. ${Number(quotation.subtotal || 0).toLocaleString('en-IN')}`, 130, finalY + 12);
  doc.text(`Total Amount (incl. GST): Rs. ${Number(quotation.total_amount || 0).toLocaleString('en-IN')}`, 130, finalY + 20);

  // 6. Save File
  doc.save(`Quotation_${quotation.quotation_number}.pdf`);
};