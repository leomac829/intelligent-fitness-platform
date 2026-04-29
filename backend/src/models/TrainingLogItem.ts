import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import TrainingLog from './TrainingLog';
import Exercise from './Exercise';

interface TrainingLogItemAttributes {
  id?: string;
  log_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  completed_at?: Date;
}

class TrainingLogItem extends Model<TrainingLogItemAttributes> implements TrainingLogItemAttributes {
  public id!: string;
  public log_id!: string;
  public exercise_id!: string;
  public set_number!: number;
  public reps!: number;
  public weight!: number;
  public completed_at!: Date;
}

TrainingLogItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    log_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: TrainingLog,
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    exercise_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Exercise,
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    set_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    reps: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    completed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'training_log_items',
    timestamps: true,
    createdAt: 'completed_at',
    updatedAt: false
  }
);

TrainingLogItem.belongsTo(TrainingLog, { foreignKey: 'log_id' });
TrainingLogItem.belongsTo(Exercise, { foreignKey: 'exercise_id' });

export default TrainingLogItem;
