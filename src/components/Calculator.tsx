import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Calculator, Save, ArrowRight } from 'lucide-react';
import { useCalculator, useValidation } from '@/hooks/useCalculator';
import { getMaterials, getServices, addOrder, getNextOrderNumber, generateOrderCode, getParams } from '@/store';
import type { 
  PrintType, 
  Material, 
  OrderCalculationInput, 
  OrderCalculationResult
} from '@/types';
import { useToast } from '@/hooks/use-toast';

const PRINT_TYPE_LABELS: Record<PrintType, string> = {
  fdm: 'FDM печать',
  sla: 'SLA печать',
  multicolor: 'Многоцветная печать (MMU)',
};

interface MaterialInput {
  id: string;
  materialId: string;
  grams: number;
  isWaste: boolean;
}

interface ServiceInput {
  serviceId: string;
  quantity: number;
}

export function CalculatorPanel({ onSave }: { onSave: () => void }) {
  const [printType, setPrintType] = useState<PrintType>('fdm');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialInputs, setMaterialInputs] = useState<MaterialInput[]>([
    { id: '1', materialId: '', grams: 0, isWaste: false },
  ]);
  const [printTimeHours, setPrintTimeHours] = useState(0);
  const [manualWorkHours, setManualWorkHours] = useState(0);
  const [serviceInputs, setServiceInputs] = useState<ServiceInput[]>([]);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [notes, setNotes] = useState('');
  const [calculation, setCalculation] = useState<OrderCalculationResult | null>(null);
  
  const { calculate } = useCalculator();
  const { validateMaterials } = useValidation();
  const { toast } = useToast();

  useEffect(() => {
    setMaterials(getMaterials());
  }, []);

  // Фильтруем материалы по типу печати
  const availableMaterials = materials.filter(m => 
    printType === 'multicolor' 
      ? m.printType === 'fdm' // Для многоцветной используем FDM материалы
      : m.printType === printType
  );

  const addMaterialInput = () => {
    setMaterialInputs(prev => [
      ...prev,
      { id: Date.now().toString(), materialId: '', grams: 0, isWaste: false },
    ]);
  };

  const removeMaterialInput = (id: string) => {
    setMaterialInputs(prev => prev.filter(m => m.id !== id));
  };

  const updateMaterialInput = (id: string, field: keyof MaterialInput, value: any) => {
    setMaterialInputs(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const addServiceInput = () => {
    const services = getServices();
    if (services.length > 0) {
      setServiceInputs(prev => [
        ...prev,
        { serviceId: services[0].id, quantity: 1 },
      ]);
    }
  };

  const removeServiceInput = (index: number) => {
    setServiceInputs(prev => prev.filter((_, i) => i !== index));
  };

  const updateServiceInput = (index: number, field: keyof ServiceInput, value: any) => {
    setServiceInputs(prev =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleCalculate = () => {
    // Валидация
    const validMaterials = materialInputs.filter(m => m.materialId && m.grams > 0);
    if (validMaterials.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы один материал',
        variant: 'destructive',
      });
      return;
    }

    const validation = validateMaterials(
      validMaterials.map(m => ({ materialId: m.materialId, grams: m.grams })),
      printType
    );

    if (!validation.valid) {
      toast({
        title: 'Ошибка',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    const input: OrderCalculationInput = {
      printType,
      materials: validMaterials.map(m => ({
        materialId: m.materialId,
        grams: m.grams,
        isWaste: m.isWaste,
      })),
      printTimeHours,
      manualWorkHours,
      additionalServices: serviceInputs,
      deliveryCost,
      notes,
    };

    const result = calculate(input);
    setCalculation(result);

    toast({
      title: 'Расчет выполнен',
      description: `Рекомендуемая цена: ${result.recommendedPrice.toFixed(2)} ₽`,
    });
  };

  const handleSaveOrder = (status: 'pending' | 'completed') => {
    if (!calculation) return;

    const orderNumber = getNextOrderNumber();
    const orderCode = generateOrderCode(orderNumber);

    const order = {
      id: Date.now().toString(),
      orderNumber,
      orderCode,
      date: new Date().toISOString(),
      status,
      input: {
        printType,
        materials: materialInputs
          .filter(m => m.materialId && m.grams > 0)
          .map(m => ({
            materialId: m.materialId,
            grams: m.grams,
            isWaste: m.isWaste,
          })),
        printTimeHours,
        manualWorkHours,
        additionalServices: serviceInputs,
        deliveryCost,
        notes,
      },
      calculation,
    };

    addOrder(order);

    // Сброс формы
    setMaterialInputs([{ id: '1', materialId: '', grams: 0, isWaste: false }]);
    setPrintTimeHours(0);
    setManualWorkHours(0);
    setServiceInputs([]);
    setDeliveryCost(0);
    setNotes('');
    setCalculation(null);

    toast({
      title: 'Заказ сохранен',
      description: `Заказ ${orderCode} создан`,
    });

    onSave();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Калькулятор 3D печати</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая колонка - ввод данных */}
        <div className="space-y-6">
          {/* Тип печати */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Тип печати</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={printType} onValueChange={(v: PrintType) => setPrintType(v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="fdm">{PRINT_TYPE_LABELS.fdm}</SelectItem>
                  <SelectItem value="sla">{PRINT_TYPE_LABELS.sla}</SelectItem>
                  <SelectItem value="multicolor">{PRINT_TYPE_LABELS.multicolor}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Материалы */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Материалы</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={addMaterialInput}
                className="border-slate-600 text-slate-300"
              >
                <Plus className="w-4 h-4 mr-1" />
                Добавить
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {materialInputs.map((input) => (
                <div key={input.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select
                      value={input.materialId}
                      onValueChange={(v) => updateMaterialInput(input.id, 'materialId', v)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Выберите материал" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {availableMaterials.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name} {m.color} ({m.stockGrams}г) - {m.pricePerGram}₽/г
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="гр"
                      value={input.grams || ''}
                      onChange={(e) => updateMaterialInput(input.id, 'grams', parseFloat(e.target.value) || 0)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  {printType === 'multicolor' && (
                    <div className="flex items-center pt-2">
                      <Checkbox
                        checked={input.isWaste}
                        onCheckedChange={(v) => updateMaterialInput(input.id, 'isWaste', v)}
                        className="border-slate-600"
                      />
                      <span className="ml-2 text-xs text-slate-400">Отходы</span>
                    </div>
                  )}
                  {materialInputs.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMaterialInput(input.id)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Время и работа */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Время и работа</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Время печати (часов)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={printTimeHours || ''}
                  onChange={(e) => setPrintTimeHours(parseFloat(e.target.value) || 0)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Ручная работа (часов)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={manualWorkHours || ''}
                  onChange={(e) => setManualWorkHours(parseFloat(e.target.value) || 0)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Дополнительные услуги */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Дополнительные услуги</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={addServiceInput}
                className="border-slate-600 text-slate-300"
              >
                <Plus className="w-4 h-4 mr-1" />
                Добавить
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceInputs.length === 0 && (
                <p className="text-slate-500 text-sm">Нет дополнительных услуг</p>
              )}
              {serviceInputs.map((input, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Select
                      value={input.serviceId}
                      onValueChange={(v) => updateServiceInput(index, 'serviceId', v)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {getServices().map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} - {s.price}₽
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      min="1"
                      value={input.quantity}
                      onChange={(e) => updateServiceInput(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeServiceInput(index)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Доставка и примечания */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Стоимость доставки (₽)</Label>
                <Input
                  type="number"
                  value={deliveryCost || ''}
                  onChange={(e) => setDeliveryCost(parseFloat(e.target.value) || 0)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Примечания</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Дополнительная информация..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            size="lg"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Рассчитать стоимость
          </Button>
        </div>

        {/* Правая колонка - результаты */}
        <div>
          {calculation ? (
            <Card className="bg-slate-800/50 border-slate-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white">Результат расчета</CardTitle>
                <CardDescription className="text-slate-400">
                  Детальный разбор стоимости заказа
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Материалы */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Материалы</h4>
                  
                  {/* Для многоцветной печати - детализация по цветам */}
                  {calculation.colorCalculations && calculation.colorCalculations.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {calculation.colorCalculations.map((color, idx) => (
                        <div key={idx} className="bg-slate-700/30 rounded p-2 text-sm">
                          <div className="flex justify-between text-white">
                            <span>{color.materialName} {color.color}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-slate-400">
                            <div>Фактический: {color.grams}г × {color.cost / color.grams}₽ = {color.cost.toFixed(2)}₽</div>
                            {color.wasteGrams > 0 && (
                              <div>Отходы: {color.wasteGrams}г = {color.wasteCost.toFixed(2)}₽</div>
                            )}
                          </div>
                          <div className="text-right text-cyan-400 mt-1">
                            Всего: {color.totalCost.toFixed(2)}₽
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Стоимость материалов:</span>
                    <span className="text-white">{calculation.materialCost.toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">С учетом риска ({(getParams().riskCoefficient - 1) * 100}%):</span>
                    <span className="text-yellow-400">{calculation.materialCostWithRisk.toFixed(2)} ₽</span>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Печать */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Печать</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Стоимость времени печати:</span>
                    <span className="text-white">{calculation.printTimeCost.toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Электроэнергия:</span>
                    <span className="text-white">{(calculation.printCost - calculation.printTimeCost).toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Итого печать:</span>
                    <span className="text-white">{calculation.printCost.toFixed(2)} ₽</span>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Работа и услуги */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Работа и услуги</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Ручная работа:</span>
                    <span className="text-white">{calculation.manualWorkCost.toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Доп. услуги:</span>
                    <span className="text-white">{calculation.additionalServicesCost.toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Фиксированный расход:</span>
                    <span className="text-white">{calculation.fixedCost.toFixed(2)} ₽</span>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Расходы */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Общий расход</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Без риска:</span>
                    <span className="text-white">{calculation.totalExpenses.toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">С учетом риска:</span>
                    <span className="text-yellow-400 font-medium">{calculation.totalExpensesWithRisk.toFixed(2)} ₽</span>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Фонды */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Фонды</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Фонд развития:</span>
                    <span className="text-white">{calculation.developmentFund.toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Фонд скидок:</span>
                    <span className="text-white">{calculation.discountFund.toFixed(2)} ₽</span>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Итоги */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-lg p-4 border border-cyan-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300">Прибыль:</span>
                    <span className="text-green-400 font-medium">{calculation.profit.toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300">Налог:</span>
                    <span className="text-white">{calculation.builtInTax.toFixed(2)} ₽</span>
                  </div>
                  <Separator className="bg-slate-700 my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">Рекомендуемая цена:</span>
                    <span className="text-2xl font-bold text-cyan-400">{calculation.recommendedPrice.toFixed(2)} ₽</span>
                  </div>
                </div>

                {/* Доход */}
                <div className="text-sm space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Доход грязными:</span>
                    <span>{calculation.grossIncome.toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Налог фактический:</span>
                    <span>{calculation.actualTax.toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between text-green-400 font-medium">
                    <span>Доход чистыми:</span>
                    <span>{calculation.netIncome.toFixed(2)} ₽</span>
                  </div>
                </div>

                {/* Кнопки сохранения */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleSaveOrder('pending')}
                    className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    В ожидание
                  </Button>
                  <Button
                    onClick={() => handleSaveOrder('completed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Завершить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700 h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Calculator className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500">
                  Заполните параметры и нажмите "Рассчитать стоимость"
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
