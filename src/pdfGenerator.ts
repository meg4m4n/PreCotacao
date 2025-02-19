import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation } from './types';
import { translations } from './translations';

export const generatePDF = (data: Quotation) => {
  const lang = data.language || 'pt';
  const t = translations[lang];
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;

  // Add logo if available
  // const logoHeight = 20;
  // doc.addImage('path_to_logo', 'PNG', margin, margin, 40, logoHeight);

  // Header with code
  doc.setFontSize(20);
  doc.text(t.title, pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text(t.preQuotation, pageWidth / 2, 30, { align: 'center' });
  doc.setFontSize(14);
  doc.text(`${t.code}: ${data.code}`, pageWidth / 2, 40, { align: 'center' });

  // Add article image if available
  let yOffset = 50;
  if (data.articleImage) {
    try {
      const imgWidth = 100;
      const imgHeight = 100;
      doc.addImage(data.articleImage, 'JPEG', (pageWidth - imgWidth) / 2, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 10;
    } catch (error) {
      console.error('Error adding image to PDF:', error);
    }
  }

  // Client Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.clientInfo, margin, yOffset);
  
  const clientData = [
    [
      { content: `${t.name}:`, styles: { fontStyle: 'bold' } },
      { content: data.client.name }
    ],
    [
      { content: `${t.brand}:`, styles: { fontStyle: 'bold' } },
      { content: data.client.brand }
    ],
    [
      { content: `${t.ourRef}:`, styles: { fontStyle: 'bold' } },
      { content: data.client.ourRef }
    ],
    [
      { content: `${t.clientRef}:`, styles: { fontStyle: 'bold' } },
      { content: data.client.clientRef }
    ]
  ];

  autoTable(doc, {
    startY: yOffset + 5,
    body: clientData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 'auto' }
    }
  });

  // Materials List
  yOffset = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.materialsList, margin, yOffset);

  const materialsData = data.components.map(comp => [
    comp.description,
    comp.supplier,
    `${comp.unitPrice.toFixed(2)} €`,
    comp.consumption.toString(),
    `${(comp.unitPrice * comp.consumption).toFixed(2)} €`
  ]);

  autoTable(doc, {
    startY: yOffset + 5,
    head: [[t.description, 'Supplier', 'Unit Price', 'Consumption', 'Total']],
    body: materialsData,
    theme: 'striped',
    headStyles: { 
      fillColor: [41, 128, 185],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    }
  });

  // Pricing Table
  yOffset = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.pricesByQuantity, margin, yOffset);

  const pricingData = data.quantities.map((qty, i) => {
    const basePrice = data.components.reduce(
      (sum, comp) => sum + comp.unitPrice * comp.consumption,
      0
    );
    const finalPrice = (basePrice * (1 + data.margins[i] / 100));
    return [
      qty.toString(),
      `${(finalPrice / qty).toFixed(2)} €`,
      `${data.margins[i]}%`,
      `${finalPrice.toFixed(2)} €`
    ];
  });

  autoTable(doc, {
    startY: yOffset + 5,
    head: [[t.quantity, t.pricePerUnit, t.margin, t.totalWithMargin]],
    body: pricingData,
    theme: 'striped',
    headStyles: { 
      fillColor: [41, 128, 185],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    }
  });

  // Extra Costs with MOQ calculations
  const moqDevelopments = data.developments.filter(dev => dev.showInPdf && dev.moqQuantity);
  
  if (moqDevelopments.length > 0) {
    yOffset = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(t.extraCosts, margin, yOffset);

    const moqData = moqDevelopments.flatMap(dev => {
      return data.margins.map((margin, index) => {
        const totalCost = dev.cost * (dev.moqQuantity || 0);
        const withMargin = totalCost * (1 + margin / 100);
        return [
          dev.description,
          dev.moqQuantity?.toString() || '0',
          `${dev.cost.toFixed(2)} €`,
          `${margin}%`,
          `${withMargin.toFixed(2)} €`
        ];
      });
    });

    autoTable(doc, {
      startY: yOffset + 5,
      head: [[t.description, 'MOQ', t.cost, t.margin, t.totalWithMargin]],
      body: moqData,
      theme: 'striped',
      headStyles: { 
        fillColor: [41, 128, 185],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 25, halign: 'right' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' }
      }
    });
  }

  // Footer
  const footerY = pageHeight - 25;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  t.footer.forEach((text, index) => {
    doc.text(text, margin, footerY + (index * 4));
  });

  // Save the PDF
  doc.save(`Lomartex-${t.preQuotation}-${data.code}.pdf`);
};