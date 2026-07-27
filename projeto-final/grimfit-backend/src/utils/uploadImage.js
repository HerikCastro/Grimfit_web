const cloudinary = require("../config/cloudinary");

// Recebe o buffer do arquivo (memória, não disco) e envia pro
// Cloudinary. Devolve a URL pública (https, já otimizada).
function uploadImage(buffer, pasta) {

  return new Promise((resolve, reject) => {

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `grimfit/${pasta}`,
        resource_type: "image"
      },
      (error, result) => {

        if (error) {
          return reject(error);
        }

        resolve(result.secure_url);

      }
    );

    stream.end(buffer);

  });

}

module.exports = uploadImage;
