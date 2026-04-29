import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface TrainingLogAttributes {
  id?: string;
  user_id: string;
  date: Date;
  notes?: string;
  duration: number;
  created_at?: Date;
}

class TrainingLog extends Model<TrainingLogAttributes> implements TrainingLogAttributes {
  public id!: string;
  public user_id!: string;
  public date!: Date;
  public notes?: string;
  public duration!: number;
  public created_at!: Date;
}

TrainingLog.init(
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
    notes: {
      type: DataTypes.TEXT
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'training_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

TrainingLog.belongsTo(User, { foreignKey: 'user_id' });

export default TrainingLog;
