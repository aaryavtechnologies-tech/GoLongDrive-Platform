require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        console.log("Connected. Dropping index 'userId_1' on 'drivers' collection...");
        await mongoose.connection.collection('drivers').dropIndex('userId_1');
        console.log('Index dropped successfully.');
    } catch(err) {
        console.log("Error dropping index: ", err.message);
    }
    process.exit(0);
});
