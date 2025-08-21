import fs from "fs";
import PDFKit from "pdfkit";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Funcao para gerar o PDF
function generatePDF() {
  const doc = new PDFKit();
  const filePath = "./file.pdf";
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(12).text("Orçamento!", 100, 100);
  doc.text("Este é um exemplo de PDF gerado com Node.js e PDFKit.", 100, 120);
  doc.end();
  console.log("PDF gerado com sucesso!");
}

generatePDF(); // Chama a funcao para gerar o PDF

// Middleware
app.use(cors());

// Rota inicial
app.get("/", (req, res) => {
  res.json({ message: "Requisição realizada com sucesso!" });
});

// Rota para download do PDF
app.get("/download", (req, res) => {
  const file = path.join(__dirname, "./file.pdf");

  res.download(file, (err) => {
    if (err) {
      console.log("Erro:", err);
    } else {
      console.log("Download realizado com sucesso!");
    }
  });
});

// Start server
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
