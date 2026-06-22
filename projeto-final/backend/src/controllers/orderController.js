const pool = require("../config/db");

exports.createOrder = async (req, res) => {

  try {

    const {
      endereco_id
    } = req.body;

    const [cart] = await pool.query(`
      SELECT
        ic.quantidade,
        p.id produto_id,
        p.preco
      FROM carrinhos c
      JOIN itens_carrinho ic
        ON ic.carrinho_id = c.id
      JOIN variacoes_produto vp
        ON vp.id = ic.variacao_id
      JOIN produtos p
        ON p.id = vp.produto_id
      WHERE c.usuario_id = ?
    `, [req.user.id]);

    if (cart.length === 0) {
      return res.status(400).json({
        message: "Carrinho vazio"
      });
    }

    let total = 0;

    cart.forEach(item => {
      total += item.preco * item.quantidade;
    });

    const [pedido] = await pool.query(`
      INSERT INTO pedidos
      (
        usuario_id,
        endereco_id,
        valor_total
      )
      VALUES (?, ?, ?)
    `, [
      req.user.id,
      endereco_id,
      total
    ]);

    for (const item of cart) {

      await pool.query(`
        INSERT INTO itens_pedido
        (
          pedido_id,
          produto_id,
          quantidade,
          preco_unitario
        )
        VALUES (?, ?, ?, ?)
      `, [
        pedido.insertId,
        item.produto_id,
        item.quantidade,
        item.preco
      ]);

    }

    await pool.query(`
      DELETE ic
      FROM itens_carrinho ic
      JOIN carrinhos c
      ON c.id = ic.carrinho_id
      WHERE c.usuario_id = ?
    `, [req.user.id]);

    return res.status(201).json({
      message: "Pedido criado",
      pedido_id: pedido.insertId
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.myOrders = async (req, res) => {

  try {

    const [pedidos] = await pool.query(`
      SELECT *
      FROM pedidos
      WHERE usuario_id = ?
      ORDER BY created_at DESC
    `, [req.user.id]);

    return res.json(pedidos);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.cancelOrder = async (req, res) => {

  try {

    await pool.query(`
      UPDATE pedidos
      SET status = 'cancelado'
      WHERE id = ?
      AND usuario_id = ?
    `, [
      req.params.id,
      req.user.id
    ]);

    return res.json({
      message: "Pedido cancelado"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};