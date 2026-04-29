import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface FoodNutritionAttributes {
  id?: string;
  food_code: string;
  food_name: string;
  category: string;
  subcategory: string;
  edible: number;
  water: number | null;
  energy_kcal: number | null;
  energy_kj: number | null;
  protein: number | null;
  fat: number | null;
  carbohydrate: number | null;
  dietary_fiber: number | null;
  cholesterol: number | null;
  ash: number | null;
  vitamin_a: number | null;
  carotene: number | null;
  retinol: number | null;
  thiamin: number | null;
  riboflavin: number | null;
  niacin: number | null;
  vitamin_c: number | null;
  vitamin_e_total: number | null;
  calcium: number | null;
  phosphorus: number | null;
  potassium: number | null;
  sodium: number | null;
  magnesium: number | null;
  iron: number | null;
  zinc: number | null;
  selenium: number | null;
  copper: number | null;
  manganese: number | null;
  remark: string | null;
  created_at?: Date;
  updated_at?: Date;
}

class FoodNutrition extends Model<FoodNutritionAttributes> implements FoodNutritionAttributes {
  public id!: string;
  public food_code!: string;
  public food_name!: string;
  public category!: string;
  public subcategory!: string;
  public edible!: number;
  public water!: number | null;
  public energy_kcal!: number | null;
  public energy_kj!: number | null;
  public protein!: number | null;
  public fat!: number | null;
  public carbohydrate!: number | null;
  public dietary_fiber!: number | null;
  public cholesterol!: number | null;
  public ash!: number | null;
  public vitamin_a!: number | null;
  public carotene!: number | null;
  public retinol!: number | null;
  public thiamin!: number | null;
  public riboflavin!: number | null;
  public niacin!: number | null;
  public vitamin_c!: number | null;
  public vitamin_e_total!: number | null;
  public calcium!: number | null;
  public phosphorus!: number | null;
  public potassium!: number | null;
  public sodium!: number | null;
  public magnesium!: number | null;
  public iron!: number | null;
  public zinc!: number | null;
  public selenium!: number | null;
  public copper!: number | null;
  public manganese!: number | null;
  public remark!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
}

FoodNutrition.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    food_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    food_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    subcategory: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    edible: {
      type: DataTypes.DECIMAL(5, 1),
      allowNull: false,
      comment: '可食部百分比'
    },
    water: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: '水分 (g/100g)'
    },
    energy_kcal: {
      type: DataTypes.DECIMAL(7, 1),
      allowNull: true,
      comment: '能量 kcal/100g'
    },
    energy_kj: {
      type: DataTypes.DECIMAL(7, 1),
      allowNull: true,
      comment: '能量 kJ/100g'
    },
    protein: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: '蛋白质 (g/100g)'
    },
    fat: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: '脂肪 (g/100g)'
    },
    carbohydrate: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: '碳水化合物 (g/100g)'
    },
    dietary_fiber: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: '膳食纤维 (g/100g)'
    },
    cholesterol: {
      type: DataTypes.DECIMAL(6, 1),
      allowNull: true,
      comment: '胆固醇 (mg/100g)'
    },
    ash: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '灰分 (g/100g)'
    },
    vitamin_a: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: '维生素A (μgRE/100g)'
    },
    carotene: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: '胡萝卜素 (μg/100g)'
    },
    retinol: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: '视黄醇 (μg/100g)'
    },
    thiamin: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: '硫胺素/维B1 (mg/100g)'
    },
    riboflavin: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: '核黄素/维B2 (mg/100g)'
    },
    niacin: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: '烟酸/维B3 (mg/100g)'
    },
    vitamin_c: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: '维生素C (mg/100g)'
    },
    vitamin_e_total: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: '维生素E总量 (mg/100g)'
    },
    calcium: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: '钙 (mg/100g)'
    },
    phosphorus: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: '磷 (mg/100g)'
    },
    potassium: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: '钾 (mg/100g)'
    },
    sodium: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: '钠 (mg/100g)'
    },
    magnesium: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: '镁 (mg/100g)'
    },
    iron: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: '铁 (mg/100g)'
    },
    zinc: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: '锌 (mg/100g)'
    },
    selenium: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: '硒 (μg/100g)'
    },
    copper: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: '铜 (mg/100g)'
    },
    manganese: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: '锰 (mg/100g)'
    },
    remark: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '备注（产地等）'
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
    tableName: 'food_nutrition',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['food_code'], unique: true },
      { fields: ['food_name'] },
      { fields: ['category'] },
      { fields: ['subcategory'] },
      { fields: ['energy_kcal'] },
      { fields: ['protein'] },
      { fields: ['fat'] },
      { fields: ['carbohydrate'] }
    ]
  }
);

export default FoodNutrition;
