import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendNotification = async (email, subject, message) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Notification sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send notification to ${email}:`, error);
    }
};

const uri = process.env.DB_URI;
let db;

const connectDB = async () => {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        db = client.db('appointmentSystem');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

connectDB();

const createAppointment = (patientId, doctorId, appointmentDate) => {
    return {
        patientId: patientId,
        doctorId: doctorId,
        appointmentDate: new Date(appointmentDate),
        status: 'scheduled',
    };
};

app.post('/appointments', async (req, res) => {
    const { patientId, doctorId, appointmentDate } = req.body;

    if (!patientId || !doctorId || !appointmentDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const appointment = createAppointment(patientId, doctorId, appointmentDate);

    try {
        const result = await db.collection('appointments').insertOne(appointment);
        res.status(201).json({ message: 'Appointment booked successfully', appointmentId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

const checkMissedAppointments = async () => {
    const now = new Date();
    const gracePeriod = 15 * 60 * 1000; // 15 minutes in milliseconds

    try {
        const result = await db.collection('appointments').updateMany(
            { 
                appointmentDate: { $lt: new Date(now.getTime() - gracePeriod) }, // Ensure correct date comparison
                status: 'scheduled' 
            },
            { $set: { status: 'missed' } }
        );
        console.log(`${result.modifiedCount} appointments marked as missed`);
    } catch (error) {
        console.error('Error checking missed appointments:', error);
    }
};

// Run the function every 5 minutes
setInterval(checkMissedAppointments, 5 * 60 * 1000); // 5 minutes

const isSlotAvailable = async (doctorId, newDate) => {
    const appointment = await db.collection('appointments').findOne({
        doctorId: doctorId,
        appointmentDate: new Date(newDate),
        status: { $ne: 'missed' }
    });
    return !appointment;
};

app.put('/appointments/:id/reschedule', async (req, res) => {
    const { id } = req.params;
    const { doctorId, newDate } = req.body;

    if (!newDate || !doctorId) {
        return res.status(400).json({ error: 'New date and doctorId are required' });
    }

    try {
        const slotAvailable = await isSlotAvailable(doctorId, newDate);

        if (!slotAvailable) {
            return res.status(409).json({ error: 'Slot not available for this doctor' });
        }

        const result = await db.collection('appointments').updateOne(
            { _id: new ObjectId(id), status: 'missed' },
            { $set: { appointmentDate: new Date(newDate), status: 'rescheduled' } }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: 'Appointment rescheduled successfully' });
        } else {
            res.status(404).json({ error: 'Appointment not found or already rescheduled' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to reschedule appointment' });
    }
});

app.listen(3000, () => {
    console.log('Backend running on port 3000');
});
