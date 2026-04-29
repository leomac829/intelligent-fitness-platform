import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface ScheduleAttributes {
  id?: string;
  user_id: string;
  date: string;
  body_parts: string[];
  created_at?: Date;
  updated_at?: Date;
}

class Schedule extends Model<ScheduleAttributes> implements ScheduleAttributes {
  public id!: string;
  public user_id!: string;
  public date!: string;
  public body_parts!: string[];
  public created_at!: Date;
  public updated_at!: Date;
}

Schedule.init(
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    body_parts: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
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
    tableName: 'schedules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

Schedule.belongsTo(User, { foreignKey: 'user_id' });

export default Schedule;
