import 'reflect-metadata'
import type { IncomingMessage, ServerResponse } from 'http'
import { NestFactory, Reflector } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import express from 'express'
import { AppModule } from '../src/app.module'


const expressApp = express()
let initialized = false

async function bootstrap() {
  if (initialized) return expressApp

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn', 'log'] },
  )

  const corsOrigin = process.env.CORS_ORIGIN
  const origins = corsOrigin
    ? corsOrigin.split(',').map((o) => o.trim()).filter(Boolean)
    : true

  app.enableCors({
    origin: origins,
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  await app.init()
  initialized = true
  return expressApp
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const server = await bootstrap()
  return server(req, res)
}
