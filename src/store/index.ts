import type { 
  AppState, 
  Material, 
  AdditionalService, 
  Order, 
  CalculationParams,
  PrintType 
} from '@/types';

const STORAGE_KEY = '3d-print-calculator-data';

// Начальные данные
const defaultParams: CalculationParams = {
  electricityCostPerHour: 5,
  manualWorkCostPerHour: 500,
  riskCoefficient: 1.15,
  fixedCostPerOrder: 50,
  developmentFundPercent: 10,
  discountFundPercent: 5,
  taxPercent: 7,
  printSettings: {
    fdm: {
      costPerHour: 100,
      wasteCoefficient: 1.1,
    },
    sla: {
      costPerHour: 150,
      wasteCoefficient: 1.05,
    },
    multicolor: {
      costPerHour: 120,
      wasteCoefficient: 1.2,
      colorChangeWasteGrams: 20,
    },
  },
};

const defaultMaterials: Material[] = [
  { id: '1', name: 'PLA', color: 'Красный', pricePerGram: 2, stockGrams: 1000, usedGrams: 0, printType: 'fdm' },
  { id: '2', name: 'PLA', color: 'Синий', pricePerGram: 2, stockGrams: 1000, usedGrams: 0, printType: 'fdm' },
  { id: '3', name: 'PLA', color: 'Черный', pricePerGram: 2, stockGrams: 1000, usedGrams: 0, printType: 'fdm' },
  { id: '4', name: 'PETG', color: 'Прозрачный', pricePerGram: 3, stockGrams: 1000, usedGrams: 0, printType: 'fdm' },
  { id: '5', name: 'ABS', color: 'Белый', pricePerGram: 2.5, stockGrams: 1000, usedGrams: 0, printType: 'fdm' },
  { id: '6', name: 'Фотополимер', color: 'Стандартный', pricePerGram: 8, stockGrams: 500, usedGrams: 0, printType: 'sla' },
  { id: '7', name: 'Фотополимер', color: 'Прозрачный', pricePerGram: 10, stockGrams: 500, usedGrams: 0, printType: 'sla' },
];

const defaultServices: AdditionalService[] = [
  { id: '1', type: 'postprocessing', name: 'Постобработка (удаление поддержек)', price: 200 },
  { id: '2', type: 'postprocessing', name: 'Шлифовка', price: 300 },
  { id: '3', type: 'painting', name: 'Покраска базовая', price: 500 },
  { id: '4', type: 'painting', name: 'Покраска детальная', price: 1000 },
  { id: '5', type: 'modeling', name: '3D моделирование (простое)', price: 1500 },
  { id: '6', type: 'modeling', name: '3D моделирование (сложное)', price: 3000 },
];

const defaultState: AppState = {
  materials: defaultMaterials,
  additionalServices: defaultServices,
  orders: [],
  params: defaultParams,
  nextOrderNumber: 1,
};

// Загрузка состояния из localStorage
export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultState, ...parsed };
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
  return defaultState;
}

// Сохранение состояния в localStorage
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

// Материалы
export function getMaterials(): Material[] {
  return loadState().materials;
}

export function addMaterial(material: Material): void {
  const state = loadState();
  state.materials.push(material);
  saveState(state);
}

export function updateMaterial(material: Material): void {
  const state = loadState();
  const index = state.materials.findIndex(m => m.id === material.id);
  if (index !== -1) {
    state.materials[index] = material;
    saveState(state);
  }
}

export function deleteMaterial(id: string): void {
  const state = loadState();
  state.materials = state.materials.filter(m => m.id !== id);
  saveState(state);
}

export function getMaterialsByType(type: PrintType): Material[] {
  return loadState().materials.filter(m => m.printType === type);
}

// Дополнительные услуги
export function getServices(): AdditionalService[] {
  return loadState().additionalServices;
}

export function addService(service: AdditionalService): void {
  const state = loadState();
  state.additionalServices.push(service);
  saveState(state);
}

export function updateService(service: AdditionalService): void {
  const state = loadState();
  const index = state.additionalServices.findIndex(s => s.id === service.id);
  if (index !== -1) {
    state.additionalServices[index] = service;
    saveState(state);
  }
}

export function deleteService(id: string): void {
  const state = loadState();
  state.additionalServices = state.additionalServices.filter(s => s.id !== id);
  saveState(state);
}

// Параметры
export function getParams(): CalculationParams {
  return loadState().params;
}

export function updateParams(params: CalculationParams): void {
  const state = loadState();
  state.params = params;
  saveState(state);
}

// Заказы
export function getOrders(): Order[] {
  return loadState().orders;
}

export function getPendingOrders(): Order[] {
  return loadState().orders.filter(o => o.status === 'pending');
}

export function getCompletedOrders(): Order[] {
  return loadState().orders.filter(o => o.status === 'completed');
}

export function addOrder(order: Order): void {
  const state = loadState();
  state.orders.push(order);
  state.nextOrderNumber++;
  
  // Обновляем остатки материалов
  order.input.materials.forEach(m => {
    const material = state.materials.find(mat => mat.id === m.materialId);
    if (material) {
      material.stockGrams -= m.grams;
      material.usedGrams += m.grams;
    }
  });
  
  saveState(state);
}

export function updateOrder(order: Order): void {
  const state = loadState();
  const index = state.orders.findIndex(o => o.id === order.id);
  if (index !== -1) {
    state.orders[index] = order;
    saveState(state);
  }
}

export function completeOrder(orderId: string): void {
  const state = loadState();
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'completed';
    saveState(state);
  }
}

export function deleteOrder(orderId: string): void {
  const state = loadState();
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    // Возвращаем материалы в остаток
    order.input.materials.forEach(m => {
      const material = state.materials.find(mat => mat.id === m.materialId);
      if (material) {
        material.stockGrams += m.grams;
        material.usedGrams -= m.grams;
      }
    });
    
    state.orders = state.orders.filter(o => o.id !== orderId);
    saveState(state);
  }
}

export function getNextOrderNumber(): number {
  return loadState().nextOrderNumber;
}

// Генерация кода заказа
export function generateOrderCode(orderNumber: number): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `3D-${year}${month}-${orderNumber.toString().padStart(4, '0')}`;
}

// Сброс данных
export function resetData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
