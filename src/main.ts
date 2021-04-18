import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {join} from 'path';
import {AppModule} from './app.module';
import * as sassMiddleware from 'node-sass-middleware';
import express from 'express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors({
        origin: '*'
    })
    const httpAdapter = app.getHttpAdapter();
    const appExpress: express.Express = httpAdapter.getInstance();
    await app.listen(process.env.PORT ||8080);
}

bootstrap();
