import fetch from 'node-fetch';

async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/exam');
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Body:', text);
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

test();
