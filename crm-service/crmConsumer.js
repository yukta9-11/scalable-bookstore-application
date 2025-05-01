// crmConsumer.js
require('dotenv').config();
const { Kafka } = require('kafkajs');
const nodemailer = require('nodemailer');

const kafka = new Kafka({
  clientId: 'crm-consumer',
  brokers: process.env.KAFKA_BROKERS.split(',') // e.g., "localhost:9092"
});

// Use template literals for groupId.
const consumer = kafka.consumer({ groupId: `${process.env.ANDREW_ID}-crm-group` });

// Construct the topic using template literals.
const topic = `${process.env.ANDREW_ID}.customer.evt`;

// Configure nodemailer transporter.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});


/**
 * Sends a welcome email to a newly registered customer.
 */
async function sendWelcomeEmail(customer) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customer.userId, // Assuming customer.userId is the customer’s email.
    subject: "Activate your book store account",
    text: `Dear ${customer.name},
Welcome to the Book store created by ${process.env.ANDREW_ID}.
Exceptionally this time we won’t ask you to click a link to activate your account.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${customer.userId}`);
  } catch (error) {
    console.error(`Failed to send email to ${customer.userId}:`, error.message);
  }
}

/**
 * Starts the Kafka consumer and processes customer events.
 */
async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  console.log(`CRM Kafka consumer listening on topic: ${topic}`);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const customer = JSON.parse(message.value.toString());
        console.log("Received customer event:", customer);
        await sendWelcomeEmail(customer);
      } catch (err) {
        console.error("Failed to process message:", err.message);
      }
    }
  });
}

run().catch(err => {
  console.error("Error starting consumer:", err);
});
