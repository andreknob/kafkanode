import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    brokers: ['localhost:9092'],
    clientId: 'certificate',
});

const consumer = kafka.consumer({ groupId: 'certificate-group' });

const producer = kafka.producer();


async function run() {
    await consumer.connect();
    await producer.connect();
    
    await consumer.subscribe({ topic: 'issue-certificate' });
    
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
            console.log(`- ${prefix} ${message.key}#${message.value}`);

            const payload = JSON.parse(message.value);

            producer.send({
                topic: 'certificate-response',
                messages: [
                    { value: `Certificate generated for user ${payload.user.name}. Course: ${payload.course}, grade: ${payload.grade}` }
                ]
            });
        }
    })
}

run().catch(console.error);