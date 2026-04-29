import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';

interface UserAttributes {
  id?: string;
  username: string;
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  height?: number;
  weight?: number;
  fitness_level?: 'beginner' | 'intermediate' | 'advanced';
  workout_duration?: number;
  target_weight?: number;
  created_at?: Date;
  updated_at?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public name?: string;
  public avatar?: string;
  public gender?: 'male' | 'female' | 'other';
  public age?: number;
  public height?: number;
  public weight?: number;
  public fitness_level?: 'beginner' | 'intermediate' | 'advanced';
  public workout_duration?: number;
  public target_weight?: number;
  public created_at!: Date;
  public updated_at!: Date;

  // 密码加密
  public async setPassword(password: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(password, salt);
  }

  // 密码验证
  public async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100)
    },
    avatar: {
      type: DataTypes.STRING(255)
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other')
    },
    age: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1
      }
    },
    height: {
      type: DataTypes.DECIMAL(5, 2),
      validate: {
        min: 1
      }
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      validate: {
        min: 1
      }
    },
    fitness_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced')
    },
    workout_duration: {
      type: DataTypes.INTEGER
    },
    target_weight: {
      type: DataTypes.DECIMAL(5, 2)
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default User;
