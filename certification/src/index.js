import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    brokers: ['localhost:9092'],
    clientId: 'certificate',
});

const topic = 'issue-certificate';
const consumer = kafka.consumer({ groupId: 'certificate-group' });

const producer = kafka.producer();

let counter = 0;

async function run() {
    await consumer.connect();
    await consumer.subscribe({ topic });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
            console.log(`- ${prefix} ${message.key}#${message.value}`);

            const payload = JSON.parse(message.value);

            setTimeout(() => {
                counter ++;

                producer.send({
                    topic: 'certificate-response',
                    messages: [
                        { value: `Certificate #${counter} generated for user ${payload.user.name}. Course: ${payload.course}, grade: ${payload.grade}` }
                    ]
                })
            }, 3000);
        }
    })
}

run().catch(console.error);