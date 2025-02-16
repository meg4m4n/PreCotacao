import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation } from './types';

export const generatePDF = (data: Quotation) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header with code
  doc.setFontSize(20);
  doc.text('Lomartex, Lda', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Pré-Cotação', pageWidth / 2, 30, { align: 'center' });
  doc.setFontSize(14);
  doc.text(`Código: ${data.code}`, pageWidth / 2, 40, { align: 'center' });

  // Client Information
  let yOffset = 50;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informação do Cliente', 14, yOffset);
  
  const clientData = [
    [
      { content: 'Nome:', styles: { fontStyle: 'bold' } },
      { content: data.client.name }
    ],
    [
      { content: 'Marca:', styles: { fontStyle: 'bold' } },
      { content: data.client.brand }
    ],
    [
      { content: 'Nossa Ref:', styles: { fontStyle: 'bold' } },
      { content: data.client.ourRef }
    ],
    [
      { content: 'Ref Cliente:', styles: { fontStyle: 'bold' } },
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

  // Materials List (simplified version)
  yOffset = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Lista de Materiais', 14, yOffset);

  const materialsData = data.components.map(comp => [comp.description]);

  autoTable(doc, {
    startY: yOffset + 5,
    head: [['Descrição']],
    body: materialsData,
    theme: 'striped',
    headStyles: { 
      fillColor: [41, 128, 185],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 3
    }
  });

  // Pricing Table
  yOffset = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Preços por Quantidade', 14, yOffset);

  const pricingData = data.quantities.map((qty, i) => {
    const basePrice = data.components.reduce(
      (sum, comp) => sum + comp.unitPrice * comp.consumption,
      0
    );
    const finalPrice = (basePrice * (1 + data.margins[i] / 100));
    return [
      qty.toString(),
      `${(finalPrice / qty).toFixed(2)} €`
    ];
  });

  autoTable(doc, {
    startY: yOffset + 5,
    head: [['Quantidade', 'Preço por Unidade']],
    body: pricingData,
    theme: 'striped',
    headStyles: { 
      fillColor: [41, 128, 185],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 3
    }
  });

  // Extra Costs with MOQ calculations
  const moqDevelopments = data.developments.filter(dev => dev.showInPdf && dev.moqQuantity);
  
  if (moqDevelopments.length > 0) {
    yOffset = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Custos Extra (MOQ)', 14, yOffset);

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
      head: [['Descrição', 'MOQ', 'Custo (€)', 'Margem', 'Total c/ Margem']],
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
  const footerText = [
    'Please note that this offer is based on our TERMS AND CONDITIONS.',
    'Prices exclude VAT Tax',
    'Prices Ex Works',
    'More info, please contact your account manager or info@lomartex.pt'
  ];

  const footerY = doc.internal.pageSize.height - 25;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  footerText.forEach((text, index) => {
    doc.text(text, 14, footerY + (index * 4));
  });

  // Save the PDF
  doc.save(`Lomartex-Pre-Cotacao-${data.code}.pdf`);
};