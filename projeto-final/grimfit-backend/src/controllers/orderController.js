const pool = require("../config/db");

exports.createOrder = async (req, res) => {

  const client = await pool.connect();

  try {

    const {
      endereco_id
    } = req.body;

    await client.query("BEGIN");

    const { rows: cart } = await client.query(`
      SELECT
        ic.id AS item_carrinho_id,
        ic.quantidade,
        ic.variacao_id,
        p.id produto_id,
        p.preco,
        vp.estoque
      FROM carrinhos c
      JOIN itens_carrinho ic
        ON ic.carrinho_id = c.id
      JOIN variacoes_produto vp
        ON vp.id = ic.variacao_id
      JOIN produtos p
        ON p.id = vp.produto_id
      WHERE c.usuario_id = $1
      FOR UPDATE OF vp
    `, [req.user.id]);

    if (cart.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Carrinho vazio"
      });
    }

    for (const item of cart) {
      if (item.quantidade > item.estoque) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          message: `Estoque insuficiente para um dos itens do carrinho`
        });
      }
    }

    let total = 0;

    cart.forEach(item => {
      total += item.preco * item.quantidade;
    });

    const { rows: [pedido] } = await client.query(`
      INSERT INTO pedidos
      (
        usuario_id,
        endereco_id,
        valor_total
      )
      VALUES ($1, $2, $3)
      RETURNING id
    `, [
      req.user.id,
      endereco_id,
      total
    ]);

    for (const item of cart) {

      await client.query(`
        INSERT INTO itens_pedido
        (
          pedido_id,
          produto_id,
          quantidade,
          preco_unitario
        )
        VALUES ($1, $2, $3, $4)
      `, [
        pedido.id,
        item.produto_id,
        item.quantidade,
        item.preco
      ]);

      await client.query(`
        UPDATE variacoes_produto
        SET estoque = estoque - $1
        WHERE id = $2
      `, [item.quantidade, item.variacao_id]);

    }

    await client.query(`
      DELETE FROM itens_carrinho
      WHERE carrinho_id IN (
        SELECT id
        FROM carrinhos
        WHERE usuario_id = $1
      )
    `, [req.user.id]);

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Pedido criado",
      pedido_id: pedido.id
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  } finally {

    client.release();

  }

};

exports.myOrders = async (req, res) => {

  try {

    const { rows: pedidos } = await pool.query(`
      SELECT *
      FROM pedidos
      WHERE usuario_id = $1
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

exports.getOrderById = async (req, res) => {

  try {

    const { rows: pedidos } = await pool.query(
      `
      SELECT *
      FROM pedidos
      WHERE id = $1
      AND usuario_id = $2
      `,
      [req.params.id, req.user.id]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({
        message: "Pedido não encontrado"
      });
    }

    const { rows: itens } = await pool.query(
      `
      SELECT
        ip.quantidade,
        ip.preco_unitario,
        p.nome,
        p.imagem_url
      FROM itens_pedido ip
      JOIN produtos p ON p.id = ip.produto_id
      WHERE ip.pedido_id = $1
      `,
      [req.params.id]
    );

    return res.json({
      ...pedidos[0],
      itens
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.cancelOrder = async (req, res) => {

  try {

    const { rowCount } = await pool.query(`
      UPDATE pedidos
      SET status = 'cancelado'
      WHERE id = $1
      AND usuario_id = $2
      AND status NOT IN ('entregue', 'cancelado')
    `, [
      req.params.id,
      req.user.id
    ]);

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Pedido não encontrado ou não pode mais ser cancelado"
      });
    }

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
