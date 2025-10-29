import { DataSource } from 'typeorm';
import { Environment } from '../../config/environment';
import { User } from '../../modules/auth/entities/user.entity';

export class DatabaseConfig {
  private static dataSource: DataSource;

  static getDataSource(): DataSource {
    if (!this.dataSource) {
      this.dataSource = new DataSource({
        type: 'postgres',
        host: Environment.DB_HOST,
        port: Environment.DB_PORT,
        username: Environment.DB_USERNAME,
        password: Environment.DB_PASSWORD,
        database: Environment.DB_DATABASE,
        entities: [User],
        synchronize: false, // Use migrations instead of synchronize
        logging: Environment.NODE_ENV === 'development',
        migrations: ['dist/migrations/*.js'],
        migrationsTableName: 'migrations',
        migrationsRun: false, // Run migrations manually with npm run migration:run
      });
    }
    return this.dataSource;
  }

  static async initialize(): Promise<void> {
    const dataSource = this.getDataSource();
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      console.log('Database connection established');
    }
  }

  static async close(): Promise<void> {
    const dataSource = this.getDataSource();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed');
    }
  }
}
