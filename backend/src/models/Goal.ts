import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface GoalAttributes {
  id?: string;
  user_id: string;
  type: 'weight' | 'training' | 'calorie';
  target_value: number;
  start_value: number;
  current_value: number;
  status: 'pending' | 'in_progress' | 'completed';
  start_date: Date;
  end_date?: Date;
  created_at?: Date;
  updated_at?: Date;
}

class Goal extends Model<GoalAttributes> implements GoalAttributes {
  public id!: string;
  public user_id!: string;
  public type!: 'weight' | 'training' | 'calorie';
  public target_value!: number;
  public start_value!: number;
  public current_value!: number;
  public status!: 'pending' | 'in_progress' | 'completed';
  public start_date!: Date;
  public end_date?: Date;
  public created_at!: Date;
  public updated_at!: Date;
}

Goal.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    type: {
      type: DataTypes.ENUM('weight', 'training', 'calorie'),
      allowNull: false
    },
    target_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    start_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    current_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      allowNull: false,
      defaultValue: 'in_progress'
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY
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
    tableName: 'goals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

Goal.belongsTo(User, { foreignKey: 'user_id' });

export default Goal;