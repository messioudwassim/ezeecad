// jsPDF est importé dynamiquement dans generateInvoicePdf() ci-dessous.

type InvoiceData = {
  orderId: string;
  date: string; // ISO string
  amount: number;
  currency?: string;
  modelTitle: string;
  buyerName: string;
  buyerEmail: string;
};

/**
 * Génère et déclenche le téléchargement d'une facture PDF simple pour une
 * commande payée. jsPDF est chargé dynamiquement (import() différé) pour
 * ne pas alourdir le bundle principal du site avec une librairie utilisée
 * seulement occasionnellement. Les informations d'entreprise sont des
 * placeholders à remplacer une fois les informations légales réelles
 * disponibles (voir src/pages/TermsPage.tsx pour les mêmes placeholders).
 */
export async function generateInvoicePdf(data: InvoiceData) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 20;

  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(27, 130, 245);
  doc.setFont('helvetica', 'bold');
  doc.text('EzeeCAD', marginX, 25);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('[Nom de l\'entreprise à compléter]', marginX, 32);
  doc.text('[Adresse à compléter], Algérie', marginX, 37);
  doc.text('RC: [N° RC]  -  NIF: [N° NIF]', marginX, 42);

  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', pageWidth - marginX, 25, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`N° ${data.orderId.slice(0, 8).toUpperCase()}`, pageWidth - marginX, 32, { align: 'right' });
  doc.text(new Date(data.date).toLocaleDateString('fr-DZ'), pageWidth - marginX, 37, { align: 'right' });

  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, 50, pageWidth - marginX, 50);

  // Acheteur
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Facturé à :', marginX, 60);
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.buyerName || 'Client', marginX, 67);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(data.buyerEmail || '', marginX, 73);

  // Tableau produit
  const tableTop = 90;
  doc.setFillColor(245, 247, 250);
  doc.rect(marginX, tableTop, pageWidth - marginX * 2, 10, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('Description', marginX + 3, tableTop + 7);
  doc.text('Montant', pageWidth - marginX - 3, tableTop + 7, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 20);
  doc.text(`Modèle 3D — ${data.modelTitle}`, marginX + 3, tableTop + 18);
  doc.text(
    `${data.amount.toLocaleString('fr-DZ')} ${(data.currency || 'DZD').toUpperCase()}`,
    pageWidth - marginX - 3,
    tableTop + 18,
    { align: 'right' },
  );

  doc.setDrawColor(230, 230, 230);
  doc.line(marginX, tableTop + 25, pageWidth - marginX, tableTop + 25);

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total payé', marginX + 3, tableTop + 35);
  doc.setTextColor(27, 130, 245);
  doc.text(
    `${data.amount.toLocaleString('fr-DZ')} ${(data.currency || 'DZD').toUpperCase()}`,
    pageWidth - marginX - 3,
    tableTop + 35,
    { align: 'right' },
  );

  // Méthode de paiement
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('Paiement effectué par carte CIB / EDAHABIA via Chargily Pay.', marginX, tableTop + 50);
  doc.text('Statut : Payé', marginX, tableTop + 56);

  // Pied de page
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text(
    'Cette facture est générée automatiquement et fait foi de preuve de paiement.',
    pageWidth / 2,
    pageHeight - 15,
    { align: 'center' },
  );

  doc.save(`facture-ezeecad-${data.orderId.slice(0, 8)}.pdf`);
}