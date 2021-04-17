import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {join} from 'path';
import {AppModule} from './app.module';
import * as sassMiddleware from 'node-sass-middleware';
import express from 'express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    app.enableCors({
        origin: '*'
    })
    const httpAdapter = app.getHttpAdapter();
    const appExpress: express.Express = httpAdapter.getInstance();
    app.use(
        sassMiddleware({
            src: join(__dirname, '..', 'style'),
            dest: join(__dirname, '..', 'public'),
            debug: true,
        }),
    );
    await app.listen(8080);
}

bootstrap();
