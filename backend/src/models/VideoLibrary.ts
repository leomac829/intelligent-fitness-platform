import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'

interface VideoLibraryAttributes {
  id?: string
  name: string
  description?: string
  category?: string
  difficulty?: string
  target_muscle?: string
  equipment?: string
  created_at?: Date
  updated_at?: Date
}

class VideoLibrary extends Model<VideoLibraryAttributes> implements VideoLibraryAttributes {
  public id!: string
  public name!: string
  public description?: string
  public category?: string
  public difficulty?: string
  public target_muscle?: string
  public equipment?: string
  public created_at!: Date
  public updated_at!: Date
}

VideoLibrary.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    category: {
      type: DataTypes.STRING(100),
    },
    difficulty: {
      type: DataTypes.STRING(50),
    },
    target_muscle: {
      type: DataTypes.STRING(100),
    },
    equipment: {
      type: DataTypes.STRING(100),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'video_library',
    timestamps: false,
  }
)

export default VideoLibrary
