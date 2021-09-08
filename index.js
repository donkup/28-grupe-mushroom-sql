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

    console.log('-------------------------');
    console.log(`Grybautojai: ${gatherers.join(', ')}.`);


    //**3.** _Isspausdinti, brangiausio grybo pavadinima_

    sql = 'SELECT `mushroom` \
            FROM `mushroom` \
            WHERE `price` = (\
                SELECT MAX(`price`) FROM `mushroom`\
                )';
    [rows] = await connection.execute(sql);
    console.log('-------------------------');
    console.log(`Brangiausias grybas yra: ${upperCaseName(rows[0].mushroom)}.`);

    //** 4. ** _Isspausdinti, pigiausio grybo pavadinima_

    sql = 'SELECT `mushroom` \
            FROM `mushroom` \
            WHERE `price` = (\
                SELECT MIN(`price`) FROM `mushroom`\
                )';
    [rows] = await connection.execute(sql);
    console.log('-------------------------');
    console.log(`Pigiausias grybas yra: ${upperCaseName(rows[0].mushroom)}.`);


    // 5
    sql = 'SELECT `mushroom`, (1000 / `weight`) as amount \
            FROM `mushroom` ORDER BY `mushroom` ASC';
    [rows] = await connection.execute(sql);

    console.log('Grybai:');
    i = 0;
    for (const item of rows) {
        console.log(`${++i}) ${upperCaseName(item.mushroom)} - ${(+item.amount).toFixed(1)}`);
    }

    // 6
    sql = 'SELECT `name`, SUM(`count`) as amount \
            FROM `basket` \
            LEFT JOIN `gatherer` \
                ON `gatherer`.`id` = `basket`.`gatherer_id` \
            GROUP BY `basket`.`gatherer_id` \
            ORDER BY `name`';
    [rows] = await connection.execute(sql);

    console.log('-------------------------');
    console.log('Grybu kiekis pas grybautoja:');
    i = 0;
    for (const item of rows) {
        console.log(`${++i}) ${upperCaseName(item.name)} - ${item.amount} grybu`);
    }

    // 7
    sql = 'SELECT `name`, SUM(`count`*`price`*`weight`/1000) as amount \
            FROM `basket` \
            LEFT JOIN `gatherer` \
                ON `gatherer`.`id` = `basket`.`gatherer_id` \
            LEFT JOIN `mushroom`\
                ON `mushroom`.`id` = `basket`.`mushroom_id` \
            GROUP BY `basket`.`gatherer_id` \
            ORDER BY `amount` DESC ';

    [rows] = await connection.execute(sql);

    console.log('-------------------------');
    console.log('Grybu krepselio kainos pas grybautoja:');
    i = 0;
    for (const item of rows) {
        console.log(`${++i}) ${upperCaseName(item.name)} - ${+item.amount} EUR`);
    }

    //**8** _Isspausdinti, kiek nuo geriausiai vertinamu iki blogiausiai 
    //vertinamu grybu yra surinkta. Spausdinima turi atlikti funkcija 
    //(pavadinimu `mushroomsByRating()`), kuri gauna vieninteli parametra - kalbos pavadinima, 
    //pagal kuria reikia sugeneruoti rezultata_
    // sql = 'SELECT  `ratings`.`id`, `name_en`, SUM(`count`) as amount\
    // FROM `ratings` \
    // LEFT JOIN `mushroom` \
    // ON `mushroom`.`rating` = `ratings`.`id` \
    // LEFT JOIN `basket` \
    // ON `basket`.`mushroom_id` = `mushroom`.`id` \
    // GROUP BY `ratings`.`id`\
    // ORDER BY `ratings`.`id` DESC';
    // [rows] = await connection.execute(sql);
    // console.log(rows);

    async function mushroomByRating(lang = 'lt') {
        sql = 'SELECT  `ratings`.`id`, `name_' + lang + '`, SUM(`count`) as amount\
    FROM `ratings` \
    LEFT JOIN `mushroom` \
    ON `mushroom`.`rating` = `ratings`.`id` \
    LEFT JOIN `basket` \
    ON `basket`.`mushroom_id` = `mushroom`.`id` \
    GROUP BY `ratings`.`id`\
    ORDER BY `ratings`.`id` DESC';
        [rows] = await connection.execute(sql);
        console.log(rows);

    }
    mushroomByRating('en');
    mushroomByRating('lt');
    mushroomByRating();

}


app.init();

module.exports = app;