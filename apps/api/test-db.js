import pg from 'pg';
const { Client } = pg;

const client = new Client({
    connectionString: 'postgresql://envioplus:01102001@127.0.0.1:5555/envioplus?schema=public',
});

async function test() {
    try {
        await client.connect();
        console.log('Connected successfully');
        const res = await client.query('SELECT $1::text as message', ['Hello world!']);
        console.log(res.rows[0].message);
        await client.end();
    } catch (err) {
        console.error('Connection failed', err);
    }
}

test();
