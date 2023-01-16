const { Pool } = require("pg");
const format = require("pg-format")

const pool = new Pool({

    user: "postgres",
    host: "localhost",
    password: "postgres",
    database: "joyas",
    port: 5432,
    allowExitOnIdle: true
});


const buscadorJoyas = async ({ precio_min, precio_max, categoria, metal }) => {
    let filtros = [];
    const values = [];

    function addFilter (campo, comparador, valor) {
        values.push(valor);
        const { length } = filtros
        filtros.push(`${campo} ${comparador} $${length + 1}`)
    }

    if (precio_min) addFilter('precio', '>=', precio_min);
    if (precio_max) addFilter('precio', '<=', precio_max);
    if (categoria) addFilter('categoria', '=', categoria);
    if (metal) addFilter('metal', '=', metal);

    let consulta = 'SELECT * FROM inventario';
    if (filtros.length > 0) {
        filtros = filtros.join(' AND ');
        consulta += ` WHERE ${filtros}`
    };

    const { rows: joyas, rowCount } = await pool.query(consulta, values);

    if (rowCount === 0) {
        throw { code: 404, message: `No hay resultados` };
    };

    return joyas;
};

const conseguirJoyas = async ({
    limits = 10, page = 1, order_by = 'id_ASC' }) => {
    const [campo, direccion] = order_by.split("_");
    const offset = (page - 1) * limits;

    const formattedQuery = format('SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s', campo, direccion, limits, offset);
    const { rows: joyas, rowCount } = await pool.query(formattedQuery);

    if (rowCount === 0) {
        throw { code: 404, message: `No hay resultados` };
    };

    return joyas;
};

const prepararHATEOAS = (joyas) => {
    const results = joyas.map((j) => {
        return {
            name: m.nombre,
            href: `/joyas/joya/${j.id}`,
        }
    }).slice(0, 4)
    const total = joyas.length
    const HATEOAS = {
        total,
        results
    }
    return HATEOAS
}

module.exports = { prepararHATEOAS, conseguirJoyas, buscadorJoyas };