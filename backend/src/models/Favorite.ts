import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Exercise from './Exercise';

class Favorite extends Model {
  public id!: string;
  public user_id!: string;
  public exercise_id!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Favorite.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  exercise_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Exercise,
      key: 'id',
    },
  },
}, {
  sequelize,
  tableName: 'favorites',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// 关联关系
Favorite.belongsTo(User, { foreignKey: 'user_id' });
Favorite.belongsTo(Exercise, { foreignKey: 'exercise_id' });

User.hasMany(Favorite, { foreignKey: 'user_id' });
Exercise.hasMany(Favorite, { foreignKey: 'exercise_id' });

export default Favorite;