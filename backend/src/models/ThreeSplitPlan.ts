import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface ThreeSplitPlanAttributes {
  id?: string;
  user_id: string;
  config: object;
  plan_data: object;
  created_at?: Date;
  updated_at?: Date;
}

class ThreeSplitPlan extends Model<ThreeSplitPlanAttributes> implements ThreeSplitPlanAttributes {
  public id!: string;
  public user_id!: string;
  public config!: object;
  public plan_data!: object;
  public created_at!: Date;
  public updated_at!: Date;
}

ThreeSplitPlan.init(
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
      }
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    plan_data: {
      type: DataTypes.JSONB,
      allowNull: false
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
    tableName: 'three_split_plans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

ThreeSplitPlan.belongsTo(User, { foreignKey: 'user_id' });

export default ThreeSplitPlan;
