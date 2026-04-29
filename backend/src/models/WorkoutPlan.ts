import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface WorkoutPlanAttributes {
  id?: string;
  name: string;
  description?: string;
  goal: 'muscle_gain' | 'fat_loss' | 'shaping' | 'rehabilitation';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  created_by?: string;
  is_public: boolean;
  created_at?: Date;
  updated_at?: Date;
}

class WorkoutPlan extends Model<WorkoutPlanAttributes> implements WorkoutPlanAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public goal!: 'muscle_gain' | 'fat_loss' | 'shaping' | 'rehabilitation';
  public level!: 'beginner' | 'intermediate' | 'advanced';
  public duration!: number;
  public created_by?: string;
  public is_public!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

WorkoutPlan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    goal: {
      type: DataTypes.ENUM('muscle_gain', 'fat_loss', 'shaping', 'rehabilitation'),
      allowNull: false
    },
    level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    created_by: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: 'id'
      }
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    tableName: 'workout_plans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

WorkoutPlan.belongsTo(User, { foreignKey: 'created_by' });

export default WorkoutPlan;
