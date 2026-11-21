import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './dates';

export const generateQuotationPDF = (quotation, mode = 'download') => {
  const doc = new jsPDF();

  // 1. Header & Branding
  doc.setFontSize(22);
  doc.setTextColor(40);
  doc.text('CODEXLABZ', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Codexlabz Technologies', 14, 29);

  // 2. Document Title & Meta
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text('QUOTATION / PROPOSAL', 128, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Quote No: ${quotation.quotation_number}`, 128, 30);
  doc.text(`Date: ${formatDate(quotation.quotation_date)}`, 128, 36);
  doc.text(`Valid Until: ${formatDate(quotation.valid_until)}`, 128, 42);
  doc.text(`Status: ${quotation.status}`, 128, 48);

  // 3. Client Details
  doc.setTextColor(40);
  doc.setFont(undefined, 'bold');
  doc.text('Prepared For:', 14, 46);
  doc.text(quotation.client_name || 'Client', 14, 52);
  doc.setFont(undefined, 'normal');
  let clientY = 58;
  if (quotation.company_name) {
    doc.text(quotation.company_name, 14, clientY);
    clientY += 6;
  }
  doc.text(`Proposal Type: ${quotation.proposal_type || '—'}`, 14, clientY);
  clientY += 6;

  // 4. Line Items Table
  const tableColumns = ['Description', 'Qty', 'Rate (INR)', 'Amount (INR)'];
  const items = Array.isArray(quotation.items) ? quotation.items : [];
  const tableRows = items.map((item) => {
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.rate ?? item.price ?? 0);
    const amount = Number(item.amount ?? item.total ?? qty * rate);
    return [
      item.description || '—',
      qty,
      `Rs. ${rate.toLocaleString('en-IN')}`,
      `Rs. ${amount.toLocaleString('en-IN')}`,
    ];
  });

  autoTable(doc, {
    startY: Math.max(clientY + 4, 72),
    head: [tableColumns],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [59, 110, 168] },
    styles: { fontSize: 10, cellPadding: 5 },
  });

  const finalY = doc.lastAutoTable.finalY || 80;

  // 5. Totals
  const subtotal = Number(quotation.subtotal || 0);
  const discount = Number(quotation.discount || 0);
  const taxable = Math.max(subtotal - discount, 0);
  const gstAmount = quotation.gst_applied ? Number((taxable * 0.18).toFixed(2)) : 0;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Subtotal: Rs. ${subtotal.toLocaleString('en-IN')}`, 128, finalY + 12);
  doc.text(`Discount: - Rs. ${discount.toLocaleString('en-IN')}`, 128, finalY + 18);
  if (quotation.gst_applied) {
    doc.text(`GST (18%): Rs. ${gstAmount.toLocaleString('en-IN')}`, 128, finalY + 24);
  }

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  const totalY = quotation.gst_applied ? finalY + 32 : finalY + 26;
  doc.text(`Total Amount: Rs. ${Number(quotation.total_amount || 0).toLocaleString('en-IN')}`, 128, totalY);

  // 6. Terms & Notes
  let footerY = totalY + 14;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100);
  if (quotation.terms) {
    doc.text(`Terms & Conditions: ${quotation.terms}`, 14, footerY, { maxWidth: 180 });
    footerY += 12;
  }
  if (quotation.notes) {
    doc.text(`Notes: ${quotation.notes}`, 14, footerY, { maxWidth: 180 });
  }

  // 7. Print or Download
  if (mode === 'print') {
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  } else {
    doc.save(`Quotation_${quotation.quotation_number}.pdf`);
  }
};

export const generateInvoicePDF = (invoice, mode = 'download') => {
  const doc = new jsPDF();

  // 1. Header & Branding
  doc.setFontSize(22);
  doc.setTextColor(40);
  doc.text('CODEXLABZ', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Codexlabz Technologies', 14, 29);

  // 2. Invoice Title & Meta
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text('TAX INVOICE', 140, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Invoice No: ${invoice.invoice_number}`, 140, 30);
  doc.text(`Invoice Date: ${formatDate(invoice.invoice_date)}`, 140, 36);
  doc.text(`Status: ${invoice.payment_status}`, 140, 42);

  // 3. Client Details
  doc.setTextColor(40);
  doc.setFont(undefined, 'bold');
  doc.text('Billed To:', 14, 46);
  doc.text(invoice.client_name || 'Client', 14, 52);
  doc.setFont(undefined, 'normal');
  let clientY = 58;
  if (invoice.company_name) {
    doc.text(invoice.company_name, 14, clientY);
    clientY += 6;
  }
  if (invoice.mobile_number) {
    doc.text(`Mobile: ${invoice.mobile_number}`, 14, clientY);
    clientY += 6;
  }
  if (invoice.address) {
    doc.text(invoice.address, 14, clientY);
    clientY += 6;
  }

  // 4. Services Table
  const tableColumns = ['Description', 'Qty', 'Rate (INR)', 'Amount (INR)'];
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const tableRows = items.map((item) => [
    item.description || '—',
    item.quantity || 1,
    `Rs. ${Number(item.rate || 0).toLocaleString('en-IN')}`,
    `Rs. ${Number(item.amount || (item.quantity || 1) * (item.rate || 0)).toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: Math.max(clientY + 6, 72),
    head: [tableColumns],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [24, 58, 55] },
    styles: { fontSize: 10, cellPadding: 5 },
  });

  const finalY = doc.lastAutoTable.finalY || 80;

  // 5. Totals
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Subtotal: Rs. ${Number(invoice.subtotal || 0).toLocaleString('en-IN')}`, 130, finalY + 12);
  doc.text(`Discount: - Rs. ${Number(invoice.discount || 0).toLocaleString('en-IN')}`, 130, finalY + 18);
  if (invoice.gst_applied) {
    doc.text(`GST (18%): Rs. ${Number(invoice.tax_amount || 0).toLocaleString('en-IN')}`, 130, finalY + 24);
  }

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  const totalY = invoice.gst_applied ? finalY + 32 : finalY + 26;
  doc.text(`Grand Total: Rs. ${Number(invoice.grand_total || 0).toLocaleString('en-IN')}`, 130, totalY);

  if (invoice.notes) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text(`Notes: ${invoice.notes}`, 14, totalY + 14);
  }

  // 6. Print or Download
  if (mode === 'print') {
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  } else {
    doc.save(`${invoice.invoice_number}.pdf`);
  }
};