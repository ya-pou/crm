import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './roles/roles.guard';
import { CaslAbilityFactory } from './casl/casl-ability.factory';
import { APP_GUARD } from '@nestjs/core';
import { CaslGuard } from './casl/casl.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        console.log(config.get('database'));
        return config.get('database');
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CustomersModule,
    OpportunitiesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CaslAbilityFactory,
    { provide: 'APP_GUARD', useClass: JwtAuthGuard }, //Permet de bloquer toutes les routes
    { provide: 'APP_GUARD', useClass: RolesGuard }, //Permet de bloquer toutes les routes
    { provide: APP_GUARD, useClass: CaslGuard },
  ],
})
export class AppModule {}
