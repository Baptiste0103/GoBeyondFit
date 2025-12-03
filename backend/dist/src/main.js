"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
async function bootstrap() {
    let app;
    try {
        console.log('[Bootstrap] Starting NestFactory.create...');
        app = await core_1.NestFactory.create(app_module_1.AppModule);
        console.log('[Bootstrap] NestFactory.create completed successfully');
    }
    catch (error) {
        console.error('[Bootstrap] Error during application startup:', error);
        if (error instanceof Error) {
            console.error('[Bootstrap] Error stack:', error.stack);
        }
        throw error;
    }
    app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
        credentials: true,
    });
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(), new all_exceptions_filter_1.AllExceptionsFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('GoBeyondFit API')
        .setDescription('Fitness Coaching Platform API')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const options = {
        operationIdFactory: (controllerKey, methodKey) => methodKey,
    };
    const document = swagger_1.SwaggerModule.createDocument(app, config, options);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger API docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map