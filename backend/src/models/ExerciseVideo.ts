import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Exercise from './Exercise';

interface ExerciseVideoAttributes {
  id?: string;
  exercise_id: string;
  filename: string;
  path: string;
  cover_image?: string;
  duration?: number;
  size?: number;
  created_at?: Date;
  updated_at?: Date;
}

class ExerciseVideo extends Model<ExerciseVideoAttributes> implements ExerciseVideoAttributes {
  public id!: string;
  public exercise_id!: string;
  public filename!: string;
  public path!: string;
  public cover_image?: string;
  public duration?: number;
  public size?: number;
  public created_at!: Date;
  public updated_at!: Date;
}

ExerciseVideo.init(
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
      }
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    cover_image: {
      type: DataTypes.STRING(255)
    },
    duration: {
      type: DataTypes.INTEGER
    },
    size: {
      type: DataTypes.BIGINT
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
    tableName: 'exercise_videos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// 关联关系
Exercise.hasMany(ExerciseVideo, {
  foreignKey: 'exercise_id',
  as: 'videos'
});

ExerciseVideo.belongsTo(Exercise, {
  foreignKey: 'exercise_id',
  as: 'exercise'
});

export default ExerciseVideo;
