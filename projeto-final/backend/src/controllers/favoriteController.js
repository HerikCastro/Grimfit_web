const pool = require("../config/db");

exports.addFavorite = async (req, res) => {
  try {

    const { produto_id } = req.body;

    await pool.query(
      `
      INSERT IGNORE INTO favoritos
      (usuario_id, produto_id)
      VALUES (?, ?)
      `,
      [
        req.user.id,
        produto_id
      ]
    );

    return res.status(201).json({
      message: "Favorito adicionado"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }
};

exports.removeFavorite = async (req, res) => {

  try {

    await pool.query(
      `
      DELETE FROM favoritos
      WHERE usuario_id = ?
      AND produto_id = ?
      `,
      [
        req.user.id,
        req.params.id
      ]
    );

    return res.json({
      message: "Favorito removido"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.getFavorites = async (req, res) => {

  try {

    const [favoritos] =
      await pool.query(
        `
        SELECT p.*
        FROM favoritos f
        JOIN produtos p
        ON p.id = f.produto_id
        WHERE f.usuario_id = ?
        `,
        [req.user.id]
      );

    return res.json(favoritos);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};