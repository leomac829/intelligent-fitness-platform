import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface ChatMessageAttributes {
  id?: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  created_at?: Date;
  updated_at?: Date;
}

class ChatMessage extends Model<ChatMessageAttributes> implements ChatMessageAttributes {
  public id!: string;
  public userId!: string;
  public role!: 'user' | 'assistant';
  public content!: string;
  public timestamp!: Date;
  public created_at!: Date;
  public updated_at!: Date;
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant'),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    tableName: 'chat_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// 关联关系
User.hasMany(ChatMessage, {
  foreignKey: 'userId',
  as: 'chatMessages'
});

ChatMessage.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

export default ChatMessage;