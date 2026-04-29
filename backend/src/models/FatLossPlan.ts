import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface FatLossPlanAttributes {
  id?: string;
  user_id: string;
  sex: 'male' | 'female';
  weight: number;
  height: number;
  age: number;
  workout_duration: number;
  workout_intensity: 'beginner' | 'intermediate' | 'advanced';
  target_weight: number;
  ratio_type: '532' | '442';
  bmr: number;
  tdee: number;
  daily_calories: number;
  macros: object;
  weekly_loss: number;
  total_months: number;
  total_weeks: number;
  recipes: object;
  created_at?: Date;
  updated_at?: Date;
}

class FatLossPlan extends Model<FatLossPlanAttributes> implements FatLossPlanAttributes {
  public id!: string;
  public user_id!: string;
  public sex!: 'male' | 'female';
  public weight!: number;
  public height!: number;
  public age!: number;
  public workout_duration!: number;
  public workout_intensity!: 'beginner' | 'intermediate' | 'advanced';
  public target_weight!: number;
  public ratio_type!: '532' | '442';
  public bmr!: number;
  public tdee!: number;
  public daily_calories!: number;
  public macros!: object;
  public weekly_loss!: number;
  public total_months!: number;
  public total_weeks!: number;
  public recipes!: object;
  public created_at!: Date;
  public updated_at!: Date;
}

FatLossPlan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sex: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    height: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workout_duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workout_intensity: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: false,
    },
    target_weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    ratio_type: {
      type: DataTypes.ENUM('532', '442'),
      allowNull: false,
    },
    bmr: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    tdee: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    daily_calories: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    macros: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    weekly_loss: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
    },
    total_months: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_weeks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recipes: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'fat_loss_plans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ fields: ['user_id'] }, { fields: ['created_at'] }],
  }
);

export default FatLossPlan;
