import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './infrastructure/firebase/firebase.module';
import { UsersModule } from './modules/users/users.module';
import { RiskEngineModule } from './modules/risk-engine/risk-engine.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseAuthGuard } from './common/guards/firebase-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TripGuardModule } from './modules/trip-guard/trip-guard.module';
import { VehicleMatcherModule } from './modules/vehicle-matcher/vehicle-matcher.module';
import { IncidentsModule } from './modules/incidents/incidents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'safeng'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production', // Use carefully in prod
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    FirebaseModule,
    UsersModule,
    RiskEngineModule,
    TripGuardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
