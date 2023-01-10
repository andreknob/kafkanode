import express from 'express';
import { Kafka } from 'kafkajs';

import routes from './routes';

const app = express();

const kafka = new Kafka({
    clientId: 'api',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'api-group' });

app.use((req, res, next) => {
    req.producer = producer;

    return next();
});

app.use(routes);


async function run() {
    await producer.connect();

    await consumer.connect();

    await consumer.subscribe({ topic: 'certificate-response' });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(`response - ${message.value}`);
        }
    })

    app.listen(3333);
}

run().catch(console.error);