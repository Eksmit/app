import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Clock, Eye, Trash2, ArrowRight } from 'lucide-react';
import { getOrders, completeOrder, deleteOrder } from '@/store';
import type { Order, PrintType } from '@/types';
import { useToast } from '@/hooks/use-toast';

const PRINT_TYPE_LABELS: Record<PrintType, string> = {
  fdm: 'FDM',
  sla: 'SLA',
  multicolor: 'Многоцветная',
};

const STATUS_LABELS = {
  pending: { text: 'В ожидании', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
  completed: { text: 'Завершен', color: 'bg-green-500/20 text-green-400 border-green-500/50' },
};

export function OrdersList({ onUpdate }: { onUpdate: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const refreshOrders = () => {
    setOrders(getOrders());
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const handleComplete = (orderId: string) => {
    completeOrder(orderId);
    refreshOrders();
    onUpdate();
    toast({
      title: 'Заказ завершен',
      description: 'Заказ переведен в завершенные',
    });
  };

  const handleDelete = (orderId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот заказ? Материалы будут возвращены в остаток.')) {
      deleteOrder(orderId);
      refreshOrders();
      onUpdate();
      toast({
        title: 'Заказ удален',
        description: 'Заказ и материалы возвращены',
      });
    }
  };

  const viewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const OrderTable = ({ orders, showCompleteButton }: { orders: Order[]; showCompleteButton?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-700 hover:bg-transparent">
          <TableHead className="text-slate-400">Код</TableHead>
          <TableHead className="text-slate-400">Дата</TableHead>
          <TableHead className="text-slate-400">Тип</TableHead>
          <TableHead className="text-slate-400">Материалов</TableHead>
          <TableHead className="text-slate-400">Время печати</TableHead>
          <TableHead className="text-slate-400">Сумма</TableHead>
          <TableHead className="text-slate-400 text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 && (
          <TableRow className="border-slate-700">
            <TableCell colSpan={7} className="text-center text-slate-500 py-8">
              Нет заказов
            </TableCell>
          </TableRow>
        )}
        {orders.map((order) => (
          <TableRow key={order.id} className="border-slate-700">
            <TableCell className="font-mono text-cyan-400">{order.orderCode}</TableCell>
            <TableCell className="text-slate-300">
              {new Date(order.date).toLocaleDateString('ru-RU')}
            </TableCell>
            <TableCell className="text-slate-300">
              {PRINT_TYPE_LABELS[order.input.printType]}
            </TableCell>
            <TableCell className="text-slate-300">
              {order.input.materials.reduce((sum, m) => sum + m.grams, 0)}г
            </TableCell>
            <TableCell className="text-slate-300">{order.input.printTimeHours}ч</TableCell>
            <TableCell className="text-white font-medium">
              {order.calculation.recommendedPrice.toFixed(2)} ₽
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => viewOrder(order)}
                className="text-slate-400 hover:text-white"
              >
                <Eye className="w-4 h-4" />
              </Button>
              {showCompleteButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleComplete(order.id)}
                  className="text-slate-400 hover:text-green-400"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(order.id)}
                className="text-slate-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Заказы</h2>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="pending" className="data-[state=active]:bg-slate-700">
            <Clock className="w-4 h-4 mr-2" />
            В ожидании ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-slate-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Завершенные ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-0">
              <OrderTable orders={pendingOrders} showCompleteButton />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-0">
              <OrderTable orders={completedOrders} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог просмотра заказа */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>Заказ {selectedOrder?.orderCode}</span>
              {selectedOrder && (
                <Badge variant="outline" className={STATUS_LABELS[selectedOrder.status].color}>
                  {STATUS_LABELS[selectedOrder.status].text}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Основная информация */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Дата:</span>
                  <span className="ml-2 text-white">
                    {new Date(selectedOrder.date).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Тип печати:</span>
                  <span className="ml-2 text-white">
                    {PRINT_TYPE_LABELS[selectedOrder.input.printType]}
                  </span>
                </div>
              </div>

              {/* Материалы */}
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Материалы</h4>
                <div className="bg-slate-700/30 rounded p-3 space-y-1">
                  {selectedOrder.input.materials.map((m, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-300">
                        {m.grams}г {m.isWaste && '(отходы)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Время */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-sm">Время печати:</span>
                  <span className="ml-2 text-white">{selectedOrder.input.printTimeHours}ч</span>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Ручная работа:</span>
                  <span className="ml-2 text-white">{selectedOrder.input.manualWorkHours}ч</span>
                </div>
              </div>

              {/* Доп услуги */}
              {selectedOrder.input.additionalServices.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Дополнительные услуги</h4>
                  <div className="bg-slate-700/30 rounded p-3">
                    {selectedOrder.input.additionalServices.map((s, idx) => (
                      <div key={idx} className="text-sm text-slate-300">
                        {s.quantity} × услуга
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Финансы */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-lg p-4 border border-cyan-500/30">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Финансовый результат</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Материалы:</span>
                    <span className="text-white">{selectedOrder.calculation.materialCostWithRisk.toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Печать:</span>
                    <span className="text-white">{selectedOrder.calculation.printCost.toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Работа и услуги:</span>
                    <span className="text-white">
                      {(selectedOrder.calculation.manualWorkCost + selectedOrder.calculation.additionalServicesCost).toFixed(2)} ₽
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Общий расход:</span>
                    <span className="text-yellow-400">{selectedOrder.calculation.totalExpensesWithRisk.toFixed(2)} ₽</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Итоговая сумма:</span>
                      <span className="text-cyan-400">{selectedOrder.calculation.recommendedPrice.toFixed(2)} ₽</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Чистый доход:</span>
                    <span>{selectedOrder.calculation.netIncome.toFixed(2)} ₽</span>
                  </div>
                </div>
              </div>

              {/* Примечания */}
              {selectedOrder.input.notes && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Примечания</h4>
                  <p className="text-slate-300 text-sm bg-slate-700/30 rounded p-3">
                    {selectedOrder.input.notes}
                  </p>
                </div>
              )}

              {/* Кнопки действий */}
              {selectedOrder.status === 'pending' && (
                <Button
                  onClick={() => {
                    handleComplete(selectedOrder.id);
                    setIsDialogOpen(false);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Перевести в завершенные
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
