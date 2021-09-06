const mysql = require('mysql2/promise');

const app = {}

app.init = async () => {
    // prisijungti prie duomenu bazes
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'mushroom',
    });

    let sql = '';
    let rows = [];

    // LOGIC BELOW

    function upperCaseName(str) {
        return str[0].toUpperCase() + str.slice(1)
    }

    // ** 1. ** _Isspausdinti, visu grybu pavadinimus ir ju kainas, grybus isrikiuojant nuo brangiausio link pigiausio_

    sql = 'SELECT `mushroom`, `price`\
            FROM`mushroom` \
            ORDER BY `price` DESC;';
    [rows] = await connection.execute(sql);

    // const mushroomList = rows.map(obj => obj.mushroom);
    // const mushroomPriceList = rows.map(obj => obj.price);

    let count = 0;
    let allMushrooms = [];
    for (const { mushroom, price } of rows) {
        allMushrooms.push(`${++count}. ${upperCaseName(mushroom)} - ${price} EUR/kg`)
    }
    console.log(allMushrooms.join('\n'));

    //** 2. ** _Isspausdinti, visu grybautoju vardus_

    sql = 'SELECT `name` \
            FROM `gatherer`';

    [rows] = await connection.execute(sql);
    const gatherers = rows.map(obj => obj.name);

    console.log(`Grybautojai: ${gatherers.join(', ')}.`);


}

app.init();

module.exports = app;