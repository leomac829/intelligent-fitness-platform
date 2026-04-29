import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Exercise from './Exercise';

interface UserFavoriteAttributes {
  id?: string;
  user_id: string;
  exercise_id: string;
  created_at?: Date;
}

class UserFavorite extends Model<UserFavoriteAttributes> implements UserFavoriteAttributes {
  public id!: string;
  public user_id!: string;
  public exercise_id!: string;
  public created_at!: Date;
}

UserFavorite.init(
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'user_favorites',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'exercise_id']
      }
    ]
  }
);

UserFavorite.belongsTo(User, { foreignKey: 'user_id' });
UserFavorite.belongsTo(Exercise, { foreignKey: 'exercise_id' });

export default UserFavorite;
