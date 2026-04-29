import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'

interface VideoAttributes {
  id?: string
  library_id: string
  filename: string
  path: string
  cover_image?: string
  size?: number
  duration?: number
  created_at?: Date
}

class Video extends Model<VideoAttributes> implements VideoAttributes {
  public id!: string
  public library_id!: string
  public filename!: string
  public path!: string
  public cover_image?: string
  public size?: number
  public duration?: number
  public created_at!: Date
}

Video.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    library_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'video_library',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    cover_image: {
      type: DataTypes.STRING(500),
    },
    size: {
      type: DataTypes.INTEGER,
    },
    duration: {
      type: DataTypes.FLOAT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'video_library_videos',
    timestamps: false,
  }
)

export default Video
