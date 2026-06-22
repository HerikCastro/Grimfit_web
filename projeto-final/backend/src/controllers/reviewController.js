const pool = require("../config/db");

exports.createReview = async (req, res) => {

  try {

    const {
      produto_id,
      nota,
      comentario
    } = req.body;

    await pool.query(`
      INSERT INTO avaliacoes
      (
        usuario_id,
        produto_id,
        nota,
        comentario
      )
      VALUES (?, ?, ?, ?)
    `, [
      req.user.id,
      produto_id,
      nota,
      comentario
    ]);

    return res.status(201).json({
      message: "Avaliação criada"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.getReviews = async (req, res) => {

  try {

    const [reviews] = await pool.query(`
      SELECT
        a.*,
        u.nome
      FROM avaliacoes a
      JOIN usuarios u
      ON u.id = a.usuario_id
      WHERE produto_id = ?
    `, [req.params.id]);

    return res.json(reviews);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};