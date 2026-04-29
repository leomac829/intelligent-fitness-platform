import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface WorkoutAttributes {
  id: string;
  userId: string;
  date: Date;
  duration: number;
  calories: number;
  notes?: string;
}

class Workout extends Model<WorkoutAttributes> implements WorkoutAttributes {
  public id!: string;
  public userId!: string;
  public date!: Date;
  public duration!: number;
  public calories!: number;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Workout.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    calories: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'workouts',
    timestamps: true,
  }
);

export default Workout;