import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getServices, addService, updateService, deleteService } from '@/store';
import type { AdditionalService, AdditionalServiceType } from '@/types';
import { useToast } from '@/hooks/use-toast';

const SERVICE_TYPE_LABELS: Record<AdditionalServiceType, string> = {
  postprocessing: 'Постобработка',
  painting: 'Покраска',
  modeling: 'Моделирование',
};

export function ServicesManager() {
  const [services, setServices] = useState<AdditionalService[]>(getServices());
  const [editingService, setEditingService] = useState<AdditionalService | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const refreshServices = () => {
    setServices(getServices());
  };

  const handleAdd = () => {
    setEditingService({
      id: Date.now().toString(),
      type: 'postprocessing',
      name: '',
      price: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (service: AdditionalService) => {
    setEditingService({ ...service });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingService) return;

    if (!editingService.name) {
      toast({
        title: 'Ошибка',
        description: 'Введите название услуги',
        variant: 'destructive',
      });
      return;
    }

    const existing = services.find(s => s.id === editingService.id);
    if (existing) {
      updateService(editingService);
      toast({
        title: 'Обновлено',
        description: 'Услуга успешно обновлена',
      });
    } else {
      addService(editingService);
      toast({
        title: 'Добавлено',
        description: 'Услуга успешно добавлена',
      });
    }

    refreshServices();
    setIsDialogOpen(false);
    setEditingService(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту услугу?')) {
      deleteService(id);
      refreshServices();
      toast({
        title: 'Удалено',
        description: 'Услуга удалена',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Дополнительные услуги</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Добавить услугу
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>
                {editingService && services.find(s => s.id === editingService.id)
                  ? 'Редактировать услугу'
                  : 'Новая услуга'}
              </DialogTitle>
            </DialogHeader>
            {editingService && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Тип услуги</Label>
                  <Select
                    value={editingService.type}
                    onValueChange={(value: AdditionalServiceType) =>
                      setEditingService({ ...editingService, type: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="postprocessing">Постобработка</SelectItem>
                      <SelectItem value="painting">Покраска</SelectItem>
                      <SelectItem value="modeling">Моделирование</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input
                    value={editingService.name}
                    onChange={(e) =>
                      setEditingService({ ...editingService, name: e.target.value })
                    }
                    className="bg-slate-700 border-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Стоимость (₽)</Label>
                  <Input
                    type="number"
                    value={editingService.price}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-slate-700 border-slate-600"
                  />
                </div>

                <Button onClick={handleSave} className="w-full bg-cyan-600 hover:bg-cyan-700">
                  Сохранить
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-400">Тип</TableHead>
                <TableHead className="text-slate-400">Название</TableHead>
                <TableHead className="text-slate-400">Стоимость (₽)</TableHead>
                <TableHead className="text-slate-400 text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id} className="border-slate-700">
                  <TableCell className="text-slate-300">
                    {SERVICE_TYPE_LABELS[service.type]}
                  </TableCell>
                  <TableCell className="text-white font-medium">{service.name}</TableCell>
                  <TableCell className="text-slate-300">{service.price}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
