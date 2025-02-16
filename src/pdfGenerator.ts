import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation } from './types';

export const generatePDF = (data: Quotation) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFontSize(20);
  doc.text('Lomartex, Lda', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Pré-Cotação', pageWidth / 2, 30, { align: 'center' });
  doc.setFontSize(14);
  doc.text(`Código: ${data.code}`, pageWidth / 2, 40, { align: 'center' });

  // Article Image
  if (data.articleImage) {
    doc.addImage(data.articleImage, 'JPEG', 14, 50, 40, 40);
  }

  // Client Information
  const startY = data.articleImage ? 100 : 55;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informação do Cliente', 14, startY);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const labels = ['Nome:', 'Marca:', 'Email:', 'Nossa Ref:', 'Ref Cliente:', 'Tamanho Amostra:', 'Descrição:'];
  const values = [
    data.client.name,
    data.client.brand,
    data.client.email,
    data.client.ourRef,
    data.client.clientRef,
    data.client.sampleSize,
    data.client.description
  ];

  let yOffset = startY + 10;
  labels.forEach((label, index) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yOffset);
    doc.setFont('helvetica', 'normal');
    doc.text(values[index], 45, yOffset);
    yOffset += 7;
  });

  // Materials List
  yOffset += 10;
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
      cellPadding:  Continuing the pdfGenerator.ts file content from where it left off:
    }
  }
  )
}

```
      cellPadding: 5,
    },
  });

  // Calculate totals and pricing
  const calculateMOQCostPerUnit = (quantity: number) => {
    return data.developments
      .filter(dev => dev.isFromMOQ && dev.includeInSubtotal && dev.moqQuantity && dev.moqQuantity > 0)
      .reduce((sum, dev) => sum + (dev.cost * dev.moqQuantity) / quantity, 0);
  };

  const calculateBasePrice = (quantity: number) => {
    const materialsTotal = data.components.reduce(
      (sum, comp) => sum + comp.unitPrice * comp.consumption,
      0
    );
    return materialsTotal + calculateMOQCostPerUnit(quantity);
  };

  // Pricing Table
  const pricingY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Preços por Quantidade', 14, pricingY);

  const pricingData = data.quantities.map((qty, i) => {
    const basePrice = calculateBasePrice(qty);
    const finalPrice = (basePrice * (1 + data.margins[i] / 100));
    return [
      qty.toString(),
      `€${(finalPrice / qty).toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: pricingY + 5,
    head: [['Quantidade', 'Preço por Unidade']],
    body: pricingData,
    theme: 'striped',
    headStyles: { 
      fillColor: [41, 128, 185],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
  });

  // Extra Costs
  const selectedDevelopments = data.developments.filter(dev => dev.showInPdf);
  
  if (selectedDevelopments.length > 0) {
    const developmentY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Custos Extra', 14, developmentY);

    const developmentData = selectedDevelopments.map(dev => [
      dev.description,
      `€${dev.cost.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: developmentY + 5,
      head: [['Descrição', 'Custo']],
      body: developmentData,
      theme: 'striped',
      headStyles: { 
        fillColor: [41, 128, 185],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
    });
  }

  // Footer
  const today = new Date(data.date).toLocaleDateString('pt-PT');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em ${today}`, 14, doc.internal.pageSize.height - 10);

  // Save the PDF
  doc.save(`Lomartex-Pre-Cotacao-${data.code}.pdf`);
};