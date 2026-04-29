import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'

interface ExerciseAttributes {
  id: string
  name: string
  name_zh?: string
  equipment: string
  category: string
  target: string
  instructions: string
  muscle_group: string
  secondary_muscles: string
  image_url?: string
  gif_url?: string
  created_at?: Date
  instructions_zh?: string
}

class Exercise extends Model<ExerciseAttributes> implements ExerciseAttributes {
  public id!: string
  public name!: string
  public name_zh?: string
  public equipment!: string
  public category!: string
  public target!: string
  public instructions!: string
  public muscle_group!: string
  public secondary_muscles!: string
  public image_url?: string
  public gif_url?: string
  public created_at!: Date
  public instructions_zh?: string
}

Exercise.init(
  {
    id: {
      type: DataTypes.STRING(10),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name_zh: {
      type: DataTypes.STRING(255),
    },
    equipment: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    target: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    instructions_zh: {
      type: DataTypes.TEXT,
    },
    muscle_group: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    secondary_muscles: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(500),
    },
    gif_url: {
      type: DataTypes.STRING(500),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'exercise_library',
    timestamps: false,
  }
)

export default Exercise
