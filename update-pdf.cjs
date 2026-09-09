const fs = require('fs');
const path = 'src/components/DashboardView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add imports
if (!content.includes('jsPDF')) {
  content = content.replace("import { ShieldCheck", "import jsPDF from 'jspdf';\nimport html2canvas from 'html2canvas';\nimport { ShieldCheck");
}

// Replace the mock download button with real PDF generation
const oldButton = `onClick={() => showToast('Generating PDF via Puppeteer Engine...', 'success')}`;
const newButton = `onClick={async () => {
                          showToast('Generating Cryptographic PDF...', 'success');
                          const element = document.getElementById('certificate-modal-content');
                          if (element) {
                             const canvas = await html2canvas(element, { scale: 2, useCORS: true });
                             const imgData = canvas.toDataURL('image/png');
                             const pdf = new jsPDF('p', 'mm', 'a4');
                             const pdfWidth = pdf.internal.pageSize.getWidth();
                             const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                             pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                             pdf.save(\`GeM_Intel_Audit_\${modalCert.id}.pdf\`);
                             showToast('PDF Downloaded Successfully!', 'success');
                          }
                       }}`;

content = content.replace(oldButton, newButton);

// Add an ID to the modal content so html2canvas can target it
content = content.replace(
  `<div className="bg-white rounded-2xl w-full max-w-3xl my-8 flex flex-col shadow-2xl relative overflow-hidden">`,
  `<div id="certificate-modal-content" className="bg-white rounded-2xl w-full max-w-3xl my-8 flex flex-col shadow-2xl relative overflow-hidden">`
);

fs.writeFileSync(path, content);
