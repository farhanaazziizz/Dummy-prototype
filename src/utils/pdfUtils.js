import { PDFDocument, rgb } from 'pdf-lib';

export const embedSignatureInPDF = async (pdfBytes, signatures) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);

    for (const signature of signatures) {
      const page = pdfDoc.getPages()[signature.pageIndex];
      const { width: pageWidth, height: pageHeight } = page.getSize();

      // Embed signature image
      let signatureImage;
      if (signature.imageData.startsWith('data:image/png')) {
        signatureImage = await pdfDoc.embedPng(signature.imageData);
      } else {
        signatureImage = await pdfDoc.embedJpg(signature.imageData);
      }

      // Calculate position (PDF coordinates start from bottom-left)
      const pdfY = pageHeight - signature.y - signature.height;

      // Draw signature image
      page.drawImage(signatureImage, {
        x: signature.x,
        y: pdfY,
        width: signature.width,
        height: signature.height,
      });

      // Draw text overlay next to signature
      const textX = signature.x + signature.width + 10;
      const textY = pdfY + signature.height - 15;

      const fontSize = Math.min(10, signature.height / 4);
      const lineHeight = fontSize + 2;

      // Embed Arial font (use Helvetica as fallback)
      const font = await pdfDoc.embedFont('Helvetica');

      // Draw "Digitally signed by" text
      page.drawText('Digitally signed by', {
        x: textX,
        y: textY,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });

      // Draw name
      page.drawText(signature.userName, {
        x: textX,
        y: textY - lineHeight,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });

      // Draw timestamp
      page.drawText(signature.timestamp, {
        x: textX,
        y: textY - (lineHeight * 2),
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }

    const modifiedPdfBytes = await pdfDoc.save();
    return modifiedPdfBytes;
  } catch (error) {
    console.error('Error embedding signature in PDF:', error);
    throw new Error('Failed to embed signature in PDF');
  }
};

export const formatTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds} +07'00'`;
};

export const downloadPDF = (pdfBytes, filename = 'signed-document.pdf') => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
