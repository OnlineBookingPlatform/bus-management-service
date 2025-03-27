import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      username: 'default',
      password: 'VsyEYaUJLYVYdFylfV7SNPcwtq5zLEVi',
      socket: {
        host: 'redis-18621.c276.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 18621,
      },
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));

    await this.client.connect();
    console.log('✅ Kết nối Redis thành công!');
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
      console.log('❌ Disconnected from Redis');
    }
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}
