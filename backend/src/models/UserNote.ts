import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Exercise from './Exercise';

interface UserNoteAttributes {
  id?: string;
  user_id: string;
  exercise_id: string;
  content: string;
  created_at?: Date;
  updated_at?: Date;
}

class UserNote extends Model<UserNoteAttributes> implements UserNoteAttributes {
  public id!: string;
  public user_id!: string;
  public exercise_id!: string;
  public content!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

UserNote.init(
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
    tableName: 'user_notes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

UserNote.belongsTo(User, { foreignKey: 'user_id' });
UserNote.belongsTo(Exercise, { foreignKey: 'exercise_id' });

export default UserNote;
