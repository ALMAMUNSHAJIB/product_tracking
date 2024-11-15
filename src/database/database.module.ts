import { Module } from '@nestjs/common';
import Knex from 'knex';
import { ConfigModule, ConfigService } from '@nestjs/config';

const knexConfig = require('../../knexfile');

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'KnexConnection',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return Knex(knexConfig);
      },
    },
  ],
  exports: ['KnexConnection'],
})
export class DatabaseModule { }