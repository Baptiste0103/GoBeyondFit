import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  let app;
  try {
    console.log('[Bootstrap] Starting NestFactory.create...');
    app = await NestFactory.create(AppModule);
    console.log('[Bootstrap] NestFactory.create completed successfully');
  } catch (error) {
    console.error('[Bootstrap] Error during application startup:', error);
    if (error instanceof Error) {
      console.error('[Bootstrap] Error stack:', error.stack);
    }
    throw error;
  }

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  });

  // Enable global validation pipe
  // Disabled: causing issues with nested objects in POST /programs
  // app.useGlobalPipes(
  //   new ValidationPipe({...})
  // );

  // Enable global exception filters (order matters - HttpException first, then catch-all)
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('GoBeyondFit API')
    .setDescription('Fitness Coaching Platform API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      methodKey,
  };

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger API docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
