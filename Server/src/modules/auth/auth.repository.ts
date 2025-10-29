import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';

export interface CreateUserData {
  username: string;
  passwordHash: string;
  displayName?: string;
  level?: number;
  onlineStatus?: string;
  privacySettings?: {
    allowFriendRequests: boolean;
    showOnlineStatus: boolean;
    showLevel: boolean;
  };
}

export class AuthRepository {
  private repository: Repository<User>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(User);
  }

  /**
   * Create a new user with hashed password and default profile values
   * Sets displayName to username if not provided
   * Sets default level to 1, onlineStatus to 'offline'
   * Sets default privacySettings
   */
  async createUser(data: CreateUserData): Promise<User> {
    const user = this.repository.create({
      username: data.username,
      passwordHash: data.passwordHash,
      displayName: data.displayName || data.username, // Default to username if not provided
      level: data.level ?? 1, // Default to 1
      onlineStatus: data.onlineStatus || 'offline', // Default to 'offline'
      privacySettings: data.privacySettings || {
        allowFriendRequests: true,
        showOnlineStatus: true,
        showLevel: true,
      },
    });

    return await this.repository.save(user);
  }

  /**
   * Find user by username for login lookup
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { username },
    });
  }

  /**
   * Find user by ID for token validation
   */
  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Check if username already exists for registration validation
   */
  async usernameExists(username: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { username },
    });
    return count > 0;
  }
}
