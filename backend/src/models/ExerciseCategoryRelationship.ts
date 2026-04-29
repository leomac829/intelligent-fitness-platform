import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Exercise from './Exercise';
import ExerciseCategory from './ExerciseCategory';

interface ExerciseCategoryRelationshipAttributes {
  id?: string;
  exercise_id: string;
  category_id: string;
}

class ExerciseCategoryRelationship extends Model<ExerciseCategoryRelationshipAttributes> implements ExerciseCategoryRelationshipAttributes {
  public id!: string;
  public exercise_id!: string;
  public category_id!: string;
}

ExerciseCategoryRelationship.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ExerciseCategory,
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  },
  {
    sequelize,
    tableName: 'exercise_category_relationships',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['exercise_id', 'category_id']
      }
    ]
  }
);

ExerciseCategoryRelationship.belongsTo(Exercise, { foreignKey: 'exercise_id' });
ExerciseCategoryRelationship.belongsTo(ExerciseCategory, { foreignKey: 'category_id' });

export default ExerciseCategoryRelationship;
