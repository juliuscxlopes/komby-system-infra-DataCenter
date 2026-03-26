const cors = require('cors');
require('dotenv').config();

const allowedOrigins = [
    process.env.CLIENT_URL,
];

const corsOptions = {
    origin: (origin, callback) => {
        // Permite requisições sem 'origin' (mobile apps, postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
};

module.exports = cors(corsOptions);