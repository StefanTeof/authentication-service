import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import { connectToDatabase } from './config/database';
import { env } from './config/env';
import logger from './config/logger';
import authRoutes from './routes/routes.auth';
import { configurePassport } from './auth/passport';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const app = express();

configurePassport();

app.use(cors({ credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

const openApiSpecPath = path.join(__dirname, 'openapi/openapi.yaml');
const openApiDocument = YAML.load(openApiSpecPath);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get('/health', (_req, res) => {
    res.status(200).send('User Service is healthy');
});


// Authentication routes
app.use('/auth', authRoutes);


const startServer = async () => {
    try {
        await connectToDatabase();

        app.listen(env.port, () => {
            logger.info(`User Service is running on port ${env.port}`);
        });
    } catch (err) {
        logger.error('Failed to start server', err);
        process.exit(1);
    }
};

startServer();
