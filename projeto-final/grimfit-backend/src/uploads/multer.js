const multer = require("multer");

// Antes salvava em disco (src/uploads) — problema porque o disco
// do Render é efêmero, some a cada deploy/restart. Agora guarda só
// em memória (buffer), tempo suficiente pra mandar pro Cloudinary
// e depois descartar.
const storage = multer.memoryStorage();

const TIPOS_AGEITOS = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

function filtroDeArquivo(req, file, cb) {

  if (!TIPOS_AGEITOS.includes(file.mimetype)) {
    return cb(
      new Error("Formato de imagem inválido (use JPG, PNG ou WEBP)")
    );
  }

  cb(null, true);

}

module.exports = multer({
  storage,
  fileFilter: filtroDeArquivo,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
