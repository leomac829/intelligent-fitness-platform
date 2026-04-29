import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface BodyMeasurementAttributes {
  id: string;
  userId: string;
  date: Date;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  chest: number;
  waist: number;
  hips: number;
  biceps: number;
  thighs: number;
  notes?: string;
}

class BodyMeasurement extends Model<BodyMeasurementAttributes> implements BodyMeasurementAttributes {
  public id!: string;
  public userId!: string;
  public date!: Date;
  public weight!: number;
  public bodyFat!: number;
  public muscleMass!: number;
  public chest!: number;
  public waist!: number;
  public hips!: number;
  public biceps!: number;
  public thighs!: number;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BodyMeasurement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    bodyFat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    muscleMass: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    chest: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    waist: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hips: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    biceps: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    thighs: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'body_measurements',
    timestamps: true,
  }
);

export default BodyMeasurement;