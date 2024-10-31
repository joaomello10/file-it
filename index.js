const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ip = require("ip");

const app = express();
const PORT = 3000;

// Configuração do armazenamento com Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname));
  },
});

const generateFileName = (originalName) => {
  const fileExtension = path.extname(originalName);
  const baseName = path
    .basename(originalName, fileExtension)
    .replace(/[^a-zA-Z0-9]/g, "-");
  let finalName = `${baseName}${fileExtension}`;
  let counter = 1;

  while (fs.existsSync(path.join(__dirname, "uploads", finalName))) {
    finalName = `${baseName}(${counter})${fileExtension}`;
    counter++;
  }

  return finalName;
};
const uploadsDir = path.join(__dirname, "uploads");
const upload = multer({ storage: storage });

app.use("/public", express.static(path.join(__dirname, "/src/public")));
app.set("view engine", "ejs");
app.set("views", "./src/views");
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

function formatFileSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

app.get("/", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    const fileDetails = files.map((file) => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      return { name: file, size: formatFileSize(stats.size) };
    });

    console.log(fileDetails);

    const machineIp = ip.address(); // Obtendo o IP da máquina
    res.render("index", {
      files: fileDetails,
      machineIp: machineIp,
    });
  });
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Nenhum arquivo foi enviado.");
  }
  res.redirect("/");
});

app.post("/clear", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) {
      return res.status(500).send("Erro ao acessar a pasta de uploads.");
    }

    files.forEach((file) => {
      fs.unlink(path.join("uploads", file), (err) => {
        if (err) {
          console.error(`Erro ao remover ${file}:`, err);
        }
      });
    });

    res.redirect("/");
  });
});

app.get("/download/:filename", (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "uploads", fileName);

  // Verifica se o arquivo existe e faz o download
  res.download(filePath, (err) => {
    if (err) {
      console.error("Erro ao baixar o arquivo:", err);
      res.status(404).send("Arquivo não encontrado.");
    }
  });
});

app.post("/delete/:filename", (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "uploads", fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Erro ao remover o arquivo ${fileName}:`, err);
      return res.status(500).send("Erro ao excluir o arquivo.");
    }
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
