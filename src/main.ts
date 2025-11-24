import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('WMS CRM API')
    .setDescription('A light CRM develop by WMS')
    .setVersion('1.0')
    .addTag('CRM Light WMS')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT-auth',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // 👈 DOIT matcher ton @ApiBearerAuth('JWT-auth')
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
