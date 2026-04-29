import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface WorkoutExerciseAttributes {
  id: string;
  workoutId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
}

class WorkoutExercise extends Model<WorkoutExerciseAttributes> implements WorkoutExerciseAttributes {
  public id!: string;
  public workoutId!: string;
  public exerciseName!: string;
  public sets!: number;
  public reps!: number;
  public weight!: number;
  public restTime!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WorkoutExercise.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    workoutId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    exerciseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reps: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    restTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
    },
  },
  {
    sequelize,
    tableName: 'workout_exercises',
    timestamps: true,
  }
);

export default WorkoutExercise;