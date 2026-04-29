import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import WorkoutPlan from './WorkoutPlan';
import Exercise from './Exercise';

interface WorkoutPlanItemAttributes {
  id?: string;
  plan_id: string;
  day: number;
  exercise_id: string;
  sets: number;
  reps: number;
  weight: number;
  rest_time: number;
}

class WorkoutPlanItem extends Model<WorkoutPlanItemAttributes> implements WorkoutPlanItemAttributes {
  public id!: string;
  public plan_id!: string;
  public day!: number;
  public exercise_id!: string;
  public sets!: number;
  public reps!: number;
  public weight!: number;
  public rest_time!: number;
}

WorkoutPlanItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: WorkoutPlan,
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    day: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
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
    sets: {
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
    rest_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    }
  },
  {
    sequelize,
    tableName: 'workout_plan_items',
    timestamps: false
  }
);

WorkoutPlanItem.belongsTo(WorkoutPlan, { foreignKey: 'plan_id' });
WorkoutPlanItem.belongsTo(Exercise, { foreignKey: 'exercise_id' });

export default WorkoutPlanItem;
