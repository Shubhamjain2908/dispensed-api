import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
    console.log('Delivery service starting...');

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }

    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });
    console.log('Delivery Service: Connected to MongoDB!!!')

    app.listen(3000, () => {
        console.log('Delivery Service: Listening on port 3000!')
    });

};

start();