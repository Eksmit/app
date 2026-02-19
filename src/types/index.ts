// Типы печати
export type PrintType = 'fdm' | 'sla' | 'multicolor';

// Типы дополнительных услуг
export type AdditionalServiceType = 'postprocessing' | 'painting' | 'modeling';

// Статус заказа
export type OrderStatus = 'pending' | 'completed';

// Материал
export interface Material {
  id: string;
  name: string;
  color: string;
  pricePerGram: number;
  stockGrams: number;
  usedGrams: number;
  printType: PrintType;
}

// Дополнительная услуга
export interface AdditionalService {
  id: string;
  type: AdditionalServiceType;
  name: string;
  price: number;
}

// Параметры расчета (настройки)
export interface CalculationParams {
  // Электроэнергия
  electricityCostPerHour: number;
  
  // Ручная работа
  manualWorkCostPerHour: number;
  
  // Коэффициент риска (брак)
  riskCoefficient: number; // например, 1.15 = 15% на брак
  
  // Фиксированный расход на заказ
  fixedCostPerOrder: number;
  
  // Фонды
  developmentFundPercent: number; // процент на фонд развития
  discountFundPercent: number;    // процент на фонд скидок
  
  // Налог
  taxPercent: number;
  
  // Настройки печати
  printSettings: {
    fdm: {
      costPerHour: number;
      wasteCoefficient: number; // коэффициент отходов для многоцветной
    };
    sla: {
      costPerHour: number;
      wasteCoefficient: number;
    };
    multicolor: {
      costPerHour: number;
      wasteCoefficient: number; // для отходов при смене цвета
      colorChangeWasteGrams: number; // граммы отходов на смену цвета
    };
  };
}

// Расчет для одного цвета (многоцветная печать)
export interface ColorCalculation {
  materialId: string;
  materialName: string;
  color: string;
  grams: number;           // фактический расход на модель
  wasteGrams: number;      // отходы (для многоцветной)
  totalGrams: number;      // общий расход
  cost: number;            // стоимость фактического расхода
  wasteCost: number;       // стоимость отходов
  totalCost: number;       // общая стоимость материала
}

// Данные для расчета заказа
export interface OrderCalculationInput {
  printType: PrintType;
  materials: {
    materialId: string;
    grams: number;
    isWaste?: boolean; // для многоцветной - является ли отходами
  }[];
  printTimeHours: number;
  manualWorkHours: number;
  additionalServices: {
    serviceId: string;
    quantity: number;
  }[];
  deliveryCost: number;
  notes?: string;
}

// Результат расчета
export interface OrderCalculationResult {
  // Материалы
  materialCost: number;
  materialCostWithRisk: number;
  
  // Для многоцветной печати - детализация по цветам
  colorCalculations?: ColorCalculation[];
  
  // Печать
  printCost: number;
  printTimeCost: number;
  
  // Ручная работа
  manualWorkCost: number;
  
  // Доп услуги
  additionalServicesCost: number;
  
  // Фиксированный расход
  fixedCost: number;
  
  // Общий расход
  totalExpenses: number;
  totalExpensesWithRisk: number;
  
  // Фонды
  developmentFund: number;
  discountFund: number;
  
  // Прибыль
  profit: number;
  
  // Налоги
  builtInTax: number;
  actualTax: number;
  
  // Итоговые суммы
  totalOrderAmount: number;
  grossIncome: number;
  netIncome: number;
  
  // Рекомендуемая цена
  recommendedPrice: number;
}

// Заказ
export interface Order {
  id: string;
  orderNumber: number;
  orderCode: string;
  date: string;
  status: OrderStatus;
  
  // Входные данные
  input: OrderCalculationInput;
  
  // Результат расчета
  calculation: OrderCalculationResult;
  
  // Фактические данные (если отличаются от расчета)
  actualPrice?: number;
  actualDeliveryCost?: number;
  
  // Примечания
  notes?: string;
}

// Пользователь
export interface User {
  username: string;
  password: string;
  name: string;
}

// Состояние приложения
export interface AppState {
  materials: Material[];
  additionalServices: AdditionalService[];
  orders: Order[];
  params: CalculationParams;
  nextOrderNumber: number;
}
