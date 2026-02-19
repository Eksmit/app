import { useCallback } from 'react';
import type { 
  OrderCalculationInput, 
  OrderCalculationResult, 
  CalculationParams,
  Material,
  ColorCalculation,
  PrintType 
} from '@/types';
import { getMaterials, getParams, getServices } from '@/store';

// Расчет стоимости материалов для обычной печати
function calculateSingleMaterial(
  materialId: string,
  grams: number,
  materials: Material[],
  params: CalculationParams
): { cost: number; costWithRisk: number } {
  const material = materials.find(m => m.id === materialId);
  if (!material) return { cost: 0, costWithRisk: 0 };
  
  const cost = grams * material.pricePerGram;
  const costWithRisk = cost * params.riskCoefficient;
  
  return { cost, costWithRisk };
}

// Расчет для многоцветной печати
function calculateMulticolorMaterials(
  materials: { materialId: string; grams: number; isWaste?: boolean }[],
  allMaterials: Material[],
  params: CalculationParams
): { 
  colorCalculations: ColorCalculation[]; 
  totalCost: number; 
  totalCostWithRisk: number;
  totalGrams: number;
} {
  const colorCalculations: ColorCalculation[] = [];
  let totalCost = 0;
  let totalCostWithRisk = 0;
  let totalGrams = 0;
  
  // Группируем по материалам (цветам)
  const materialGroups = new Map<string, { grams: number; wasteGrams: number }>();
  
  materials.forEach(m => {
    const existing = materialGroups.get(m.materialId);
    if (existing) {
      if (m.isWaste) {
        existing.wasteGrams += m.grams;
      } else {
        existing.grams += m.grams;
      }
    } else {
      materialGroups.set(m.materialId, {
        grams: m.isWaste ? 0 : m.grams,
        wasteGrams: m.isWaste ? m.grams : 0,
      });
    }
  });
  
  // Рассчитываем для каждого цвета
  materialGroups.forEach((data, materialId) => {
    const material = allMaterials.find(m => m.id === materialId);
    if (!material) return;
    
    const actualGrams = data.grams;
    const wasteGrams = data.wasteGrams;
    const totalColorGrams = actualGrams + wasteGrams;
    
    // Для отходов - отдельный расчет (коэффициент отходов)
    const wasteCost = wasteGrams * material.pricePerGram * params.printSettings.multicolor.wasteCoefficient;
    
    // Для фактического расхода - обычный расчет
    const actualCost = actualGrams * material.pricePerGram;
    
    // Общая стоимость
    const totalColorCost = wasteCost + actualCost;
    
    // С учетом риска
    const wasteCostWithRisk = wasteCost * params.riskCoefficient;
    const actualCostWithRisk = actualCost * params.riskCoefficient;
    const colorTotalCostWithRisk = wasteCostWithRisk + actualCostWithRisk;
    
    colorCalculations.push({
      materialId,
      materialName: material.name,
      color: material.color,
      grams: actualGrams,
      wasteGrams,
      totalGrams: totalColorGrams,
      cost: actualCost,
      wasteCost,
      totalCost: totalColorCost,
    });
    
    totalCost += totalColorCost;
    totalCostWithRisk += colorTotalCostWithRisk;
    totalGrams += totalColorGrams;
  });
  
  return { colorCalculations, totalCost, totalCostWithRisk, totalGrams };
}

// Основная функция расчета
export function useCalculator() {
  const calculate = useCallback((input: OrderCalculationInput): OrderCalculationResult => {
    const params = getParams();
    const materials = getMaterials();
    const services = getServices();
    
    let materialCost = 0;
    let materialCostWithRisk = 0;
    let colorCalculations: ColorCalculation[] | undefined;
    let totalMaterialGrams = 0;
    
    // Расчет материалов
    if (input.printType === 'multicolor') {
      // Многоцветная печать - особый расчет
      const multiResult = calculateMulticolorMaterials(
        input.materials,
        materials,
        params
      );
      colorCalculations = multiResult.colorCalculations;
      materialCost = multiResult.totalCost;
      materialCostWithRisk = multiResult.totalCostWithRisk;
      totalMaterialGrams = multiResult.totalGrams;
    } else {
      // Обычная печать
      input.materials.forEach(m => {
        const result = calculateSingleMaterial(
          m.materialId,
          m.grams,
          materials,
          params
        );
        materialCost += result.cost;
        materialCostWithRisk += result.costWithRisk;
        totalMaterialGrams += m.grams;
      });
    }
    
    // Расчет стоимости печати (время + электроэнергия)
    const printSettings = params.printSettings[input.printType];
    const printTimeCost = input.printTimeHours * printSettings.costPerHour;
    const electricityCost = input.printTimeHours * params.electricityCostPerHour;
    const printCost = printTimeCost + electricityCost;
    
    // Ручная работа
    const manualWorkCost = input.manualWorkHours * params.manualWorkCostPerHour;
    
    // Дополнительные услуги
    let additionalServicesCost = 0;
    input.additionalServices.forEach(s => {
      const service = services.find(srv => srv.id === s.serviceId);
      if (service) {
        additionalServicesCost += service.price * s.quantity;
      }
    });
    
    // Фиксированный расход
    const fixedCost = params.fixedCostPerOrder;
    
    // Общий расход
    const totalExpenses = materialCost + printCost + manualWorkCost + additionalServicesCost + fixedCost;
    const totalExpensesWithRisk = materialCostWithRisk + printCost + manualWorkCost + additionalServicesCost + fixedCost;
    
    // Фонды (считаем от расхода с учетом риска)
    const developmentFund = totalExpensesWithRisk * (params.developmentFundPercent / 100);
    const discountFund = totalExpensesWithRisk * (params.discountFundPercent / 100);
    
    // Базовая прибыль (можно настроить процент)
    const profitPercent = 30; // 30% прибыли
    const profit = totalExpensesWithRisk * (profitPercent / 100);
    
    // Налог встроенный (включен в цену)
    const builtInTax = totalExpensesWithRisk * (params.taxPercent / 100);
    
    // Итоговая сумма заказа
    const totalOrderAmount = totalExpensesWithRisk + developmentFund + discountFund + profit + builtInTax;
    
    // Доход грязными (без вычета налога)
    const grossIncome = totalOrderAmount - totalExpensesWithRisk;
    
    // Налог фактический (от дохода)
    const actualTax = grossIncome * (params.taxPercent / 100);
    
    // Доход чистыми
    const netIncome = grossIncome - actualTax;
    
    // Рекомендуемая цена (округляем до 10 рублей)
    const recommendedPrice = Math.ceil(totalOrderAmount / 10) * 10;
    
    return {
      materialCost,
      materialCostWithRisk,
      colorCalculations,
      printCost,
      printTimeCost,
      manualWorkCost,
      additionalServicesCost,
      fixedCost,
      totalExpenses,
      totalExpensesWithRisk,
      developmentFund,
      discountFund,
      profit,
      builtInTax,
      actualTax,
      totalOrderAmount,
      grossIncome,
      netIncome,
      recommendedPrice,
    };
  }, []);
  
  return { calculate };
}

// Хук для работы с валидаторами
export function useValidation() {
  const validateMaterials = useCallback((
    materials: { materialId: string; grams: number }[],
    printType: PrintType
  ): { valid: boolean; error?: string } => {
    const allMaterials = getMaterials();
    
    for (const m of materials) {
      const material = allMaterials.find(mat => mat.id === m.materialId);
      if (!material) {
        return { valid: false, error: 'Материал не найден' };
      }
      
      if (material.printType !== printType && printType !== 'multicolor') {
        return { valid: false, error: `Материал ${material.name} не подходит для выбранного типа печати` };
      }
      
      if (m.grams > material.stockGrams) {
        return { valid: false, error: `Недостаточно материала ${material.name} ${material.color}. Остаток: ${material.stockGrams}г` };
      }
      
      if (m.grams <= 0) {
        return { valid: false, error: 'Расход материала должен быть больше 0' };
      }
    }
    
    return { valid: true };
  }, []);
  
  return { validateMaterials };
}
