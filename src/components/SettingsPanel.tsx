import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getParams, updateParams } from '@/store';
import type { CalculationParams } from '@/types';
import { Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SettingsPanel() {
  const [params, setParams] = useState<CalculationParams>(getParams());
  const { toast } = useToast();

  const handleSave = () => {
    updateParams(params);
    toast({
      title: 'Сохранено',
      description: 'Параметры расчета обновлены',
    });
  };

  const handleReset = () => {
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
    setParams(defaultParams);
    updateParams(defaultParams);
    toast({
      title: 'Сброшено',
      description: 'Параметры восстановлены по умолчанию',
    });
  };

  const updateField = (field: keyof CalculationParams, value: number) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const updatePrintSetting = (
    type: 'fdm' | 'sla' | 'multicolor',
    field: string,
    value: number
  ) => {
    setParams(prev => ({
      ...prev,
      printSettings: {
        ...prev.printSettings,
        [type]: {
          ...prev.printSettings[type],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Настройки расчета</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleReset} className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Сбросить
          </Button>
          <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700">
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="general" className="data-[state=active]:bg-slate-700">Общие</TabsTrigger>
          <TabsTrigger value="print" className="data-[state=active]:bg-slate-700">Печать</TabsTrigger>
          <TabsTrigger value="funds" className="data-[state=active]:bg-slate-700">Фонды и налоги</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Основные параметры</CardTitle>
              <CardDescription className="text-slate-400">
                Базовые настройки для расчета себестоимости
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Стоимость электроэнергии (₽/час)</Label>
                <Input
                  type="number"
                  value={params.electricityCostPerHour}
                  onChange={(e) => updateField('electricityCostPerHour', parseFloat(e.target.value) || 0)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Стоимость ручной работы (₽/час)</Label>
                <Input
                  type="number"
                  value={params.manualWorkCostPerHour}
                  onChange={(e) => updateField('manualWorkCostPerHour', parseFloat(e.target.value) || 0)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Коэффициент риска (брак)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={params.riskCoefficient}
                  onChange={(e) => updateField('riskCoefficient', parseFloat(e.target.value) || 1)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-500">1.15 = 15% на брак</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Фиксированный расход на заказ (₽)</Label>
                <Input
                  type="number"
                  value={params.fixedCostPerOrder}
                  onChange={(e) => updateField('fixedCostPerOrder', parseFloat(e.target.value) || 0)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="print" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">FDM печать</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Стоимость печати (₽/час)</Label>
                <Input
                  type="number"
                  value={params.printSettings.fdm.costPerHour}
                  onChange={(e) => updatePrintSetting('fdm', 'costPerHour', parseFloat(e.target.value) || 0)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Коэффициент отходов</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={params.printSettings.fdm.wasteCoefficient}
                  onChange={(e) => updatePrintSetting('fdm', 'wasteCoefficient', parseFloat(e.target.value) || 1)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">SLA печать</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Стоимость печати (₽/час)</Label>
                <Input
                  type="number"
                  value={params.printSettings.sla.costPerHour}
                  onChange={(e) => updatePrintSetting('sla', 'costPerHour', parseFloat(e.target.value) || 0)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Коэффициент отходов</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={params.printSettings.sla.wasteCoefficient}
                  onChange={(e) => updatePrintSetting('sla', 'wasteCoefficient', parseFloat(e.target.value) || 1)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Многоцветная печать</CardTitle>
              <CardDescription className="text-slate-400">
                Особые настройки для многоцветной печати (MMU)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Стоимость печати (₽/час)</Label>
                <Input
                  type="number"
                  value={params.printSettings.multicolor.costPerHour}
                  onChange={(e) => updatePrintSetting('multicolor', 'costPerHour', parseFloat(e.target.value) || 0)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Коэффициент отходов</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={params.printSettings.multicolor.wasteCoefficient}
                  onChange={(e) => updatePrintSetting('multicolor', 'wasteCoefficient', parseFloat(e.target.value) || 1)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Отходы на смену цвета (г)</Label>
                <Input
                  type="number"
                  value={params.printSettings.multicolor.colorChangeWasteGrams}
                  onChange={(e) => updatePrintSetting('multicolor', 'colorChangeWasteGrams', parseFloat(e.target.value) || 0)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funds" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Фонды и налоги</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Фонд развития (%)</Label>
                <Input
                  type="number"
                  value={params.developmentFundPercent}
                  onChange={(e) => updateField('developmentFundPercent', parseFloat(e.target.value) || 0)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Фонд скидок (%)</Label>
                <Input
                  type="number"
                  value={params.discountFundPercent}
                  onChange={(e) => updateField('discountFundPercent', parseFloat(e.target.value) || 0)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Налог (%)</Label>
                <Input
                  type="number"
                  value={params.taxPercent}
                  onChange={(e) => updateField('taxPercent', parseFloat(e.target.value) || 0)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
