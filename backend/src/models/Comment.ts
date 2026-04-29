import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Exercise from './Exercise';

class Comment extends Model {
  public id!: string;
  public user_id!: string;
  public exercise_id!: string;
  public content!: string;
  public rating!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

Comment.init({
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
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
}, {
  sequelize,
  tableName: 'comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// 关联关系
Comment.belongsTo(User, { foreignKey: 'user_id' });
Comment.belongsTo(Exercise, { foreignKey: 'exercise_id' });

User.hasMany(Comment, { foreignKey: 'user_id' });
Exercise.hasMany(Comment, { foreignKey: 'exercise_id' });

export default Comment;