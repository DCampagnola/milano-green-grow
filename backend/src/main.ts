import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as sassMiddleware from 'node-sass-middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  console.log(join(__dirname, '..', 'style'));
  app.use(
    sassMiddleware({
        src: join(__dirname, '..', 'style'),
        dest: join(__dirname, '..', 'public'),
        debug: true,
    }),
);
  await app.listen(3000);
}
bootstrap();
