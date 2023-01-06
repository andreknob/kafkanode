import express from 'express';
import { Kafka } from 'kafkajs';

const app = express();

const kafka = new Kafka({
    clientId: 'api',
    brokers: ['kafka:9092']
})

app.post('/certifications', (req, res) => {
    return res.json({ ok: true });
});

app.listen(3333);