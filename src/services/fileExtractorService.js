const fs = require("fs");
const path = require("path");

const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const JSZip = require("jszip");
const { XMLParser } = require("fast-xml-parser");
const Tesseract = require("tesseract.js");
const sharp = require("sharp");

async function extractPptx(filePath) {
  const data = fs.readFileSync(filePath);

  const zip = await JSZip.loadAsync(data);

  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  const slideFiles = Object.keys(zip.files)
    .filter(
      (file) => file.startsWith("ppt/slides/slide") && file.endsWith(".xml"),
    )
    .sort();

  let plainText = "";

  for (const slide of slideFiles) {
    const xml = await zip.files[slide].async("string");

    const json = parser.parse(xml);

    const texts = [];

    const walk = (node) => {
      if (!node) return;

      if (typeof node === "string") return;

      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }

      for (const key in node) {
        if (key === "a:t") {
          if (Array.isArray(node[key])) {
            texts.push(...node[key]);
          } else {
            texts.push(node[key]);
          }
        } else {
          walk(node[key]);
        }
      }
    };

    walk(json);

    plainText += texts.join(" ");

    plainText += "\n\n";
  }

  return plainText.trim();
}

exports.extractFile = async (file) => {
  if (!file) {
    throw new Error("File tidak ditemukan.");
  }

  const ext = path.extname(file.originalname).toLowerCase();

  let plainText = "";

  try {
    switch (ext) {
      // ================= PDF =================

      case ".pdf": {
        const buffer = fs.readFileSync(file.path);

        const pdfData = await pdf(buffer);

        plainText = pdfData.text || "";

        break;
      }

      // ================= DOCX =================

      case ".docx": {
        const result = await mammoth.extractRawText({
          path: file.path,
        });

        plainText = result.value || "";

        break;
      }

      // ================= PPT / PPTX =================

      case ".ppt":
      case ".pptx": {
        plainText = await extractPptx(file.path);

        break;
      }

      // ================= TXT =================

      case ".txt": {
        plainText = fs.readFileSync(file.path, "utf8");

        break;
      }

      // ================= IMAGE OCR =================

      case ".png":
      case ".jpg":
      case ".jpeg": {
        const processedImage = file.path + "_processed.png";

        await sharp(file.path)
          .grayscale()
          .normalize()
          .sharpen()
          .png()
          .toFile(processedImage);

        const result = await Tesseract.recognize(processedImage, "eng+ind", {
          logger: (m) => {
            if (m.status)
              console.log(
                `${m.status} ${Math.round((m.progress || 0) * 100)}%`,
              );
          },
        });

        plainText = result.data.text || "";

        fs.unlinkSync(processedImage);

        break;
      }

      default:
        throw new Error("Format file belum didukung.");
    }

    return plainText.trim();
  } finally {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
};
