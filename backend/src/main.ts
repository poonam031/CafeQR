/* eslint-disable prettier/prettier */

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { join } from 'path';

import { AppModule } from './app.module';


async function bootstrap() {

  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
      {
        rawBody: true,
      },
    );


  // =========================================
  // CORS
  // =========================================

  app.enableCors({

    // Accept the requesting frontend origin.
    // This avoids problems when Netlify generates
    // a different URL.

    origin: true,

    credentials: true,

    methods: [
      'GET',
      'HEAD',
      'PUT',
      'PATCH',
      'POST',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'ngrok-skip-browser-warning'
    ]

  });


  // =========================================
  // SERVE UPLOADED IMAGES
  // =========================================

  app.useStaticAssets(

    join(
      process.cwd(),
      'uploads'
    ),

    {
      prefix: '/uploads/'
    }

  );


  // =========================================
  // START SERVER
  // =========================================

  await app.listen(3000);

  console.log(
    '===================================='
  );

  console.log(
    'CafeQR Backend Started'
  );

  console.log(
    'http://localhost:3000'
  );

  console.log(
    '===================================='
  );

}

bootstrap();