import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Exercise from './Exercise';

interface ExerciseCommentAttributes {
  id?: string;
  user_id: string;
  exercise_id: string;
  content: string;
  rating: number;
  created_at?: Date;
  updated_at?: Date;
}

class ExerciseComment extends Model<ExerciseCommentAttributes> implements ExerciseCommentAttributes {
  public id!: string;
  public user_id!: string;
  public exercise_id!: string;
  public content!: string;
  public rating!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

ExerciseComment.init(
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
    exercise_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Exercise,
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
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
    tableName: 'exercise_comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

ExerciseComment.belongsTo(User, { foreignKey: 'user_id' });
ExerciseComment.belongsTo(Exercise, { foreignKey: 'exercise_id' });

export default ExerciseComment;
