import PDFDocument from "pdfkit";
import fs from "fs";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname e __filename para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Função para gerar PDF retornando uma Promise
function generatePDF(data, outputPath = "./orcamento.pdf") {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);

    stream.on("finish", () => {
      console.log("PDF gerado em:", outputPath);
      resolve();
    });

    stream.on("error", (err) => {
      reject(err);
    });

    doc.pipe(stream);

    // Adiciona título
    doc.fontSize(20).text("Orçamento", { align: "center" });
    doc.moveDown();

    // Informações do cliente
    doc.fontSize(12).text(`Cliente: ${data.nome || "Não informado"}`);
    doc.text(`CPF/CNPJ: ${data.cpf || "Não informado"}`);
    doc.text(`Telefone: ${data.telefone || "Não informado"}`);
    doc.text(`E-mail: ${data.email || "Não informado"}`);
    doc.text(`Endereço: ${data.endereco || "Não informado"}`);
    doc.moveDown();

    // Detalhes do orçamento
    doc.fontSize(14).text("Detalhes do Orçamento:", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12).text(`Descrição: ${data.descricao || ""}`);
    doc.text(`Quantidade: ${data.quantidade || 0}`);
    doc.text(`Valor: R$ ${data.valor?.toFixed(2) || "0.00"}`);
    doc.text(`Desconto: R$ ${data.desconto?.toFixed(2) || "0.00"}`);

    const subtotal = (data.quantidade || 0) * (data.valor || 0);
    const total = subtotal - (data.desconto || 0);

    doc.moveDown();
    doc.text(`Subtotal: R$ ${subtotal.toFixed(2)}`);
    doc.font("Helvetica-Bold").text(`Total com desconto: R$ ${total.toFixed(2)}`);
    doc.font("Helvetica"); // volta para fonte normal

    // Data do orçamento
    doc.moveDown(2);
    doc.text(`Data: ${data.data || new Date().toLocaleDateString()}`);

    // Finaliza o PDF
    doc.end();
  });
}

// Middleware
app.use(cors());
app.use(express.json());

// Rota inicial
app.get("/", (req, res) => {
  res.json({ message: "API Online" });
});

// Rota POST para gerar PDF
app.post("/orcamento", async (req, res) => {
  const dados = req.body;
  const outputPath = path.join(__dirname, "orcamento.pdf");

  try {
    await generatePDF(dados, outputPath);
    res.download(outputPath, "orcamento.pdf");
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    res.status(500).send("Erro ao gerar PDF");
  }
});

// Rota GET para gerar PDF via query parameters, vem do banco de dados
app.get("/orcamento", async (req, res) => {
  const dados = {
    nome: req.query.nome || "Não informado",
    cpf: req.query.cpf || "Não informado",
    telefone: req.query.telefone || "Não informado",
    email: req.query.email || "Não informado",
    endereco: req.query.endereco || "Não informado",
    descricao: req.query.descricao || "",
    quantidade: Number(req.query.quantidade) || 0,
    valor: Number(req.query.valor) || 0,
    desconto: Number(req.query.desconto) || 0,
    data: req.query.data || new Date().toLocaleDateString()
  };

  const outputPath = path.join(__dirname, "orcamento.pdf");

  try {
    await generatePDF(dados, outputPath);
    res.download(outputPath, "orcamento.pdf");
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    res.status(500).send("Erro ao gerar PDF");
  }
});

// Inicia o servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
