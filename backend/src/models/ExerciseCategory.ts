import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface ExerciseCategoryAttributes {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
}

class ExerciseCategory extends Model<ExerciseCategoryAttributes> implements ExerciseCategoryAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public created_at!: Date;
}

ExerciseCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'exercise_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

export default ExerciseCategory;
