import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface TrainingDiaryAttributes {
  id?: string;
  user_id: string;
  date: Date;
  content: string;
  duration?: number;
  tags?: string;
  created_at?: Date;
  updated_at?: Date;
}

class TrainingDiary extends Model<TrainingDiaryAttributes> implements TrainingDiaryAttributes {
  public id!: string;
  public user_id!: string;
  public date!: Date;
  public content!: string;
  public duration?: number;
  public tags?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

TrainingDiary.init(
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1
      }
    },
    tags: {
      type: DataTypes.STRING
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
    tableName: 'training_diaries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

TrainingDiary.belongsTo(User, { foreignKey: 'user_id' });

export default TrainingDiary;