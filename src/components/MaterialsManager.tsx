import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getMaterials, addMaterial, updateMaterial, deleteMaterial } from '@/store';
import type { Material, PrintType } from '@/types';
import { useToast } from '@/hooks/use-toast';

const PRINT_TYPE_LABELS: Record<PrintType, string> = {
  fdm: 'FDM',
  sla: 'SLA',
  multicolor: 'Многоцветная',
};

export function MaterialsManager() {
  const [materials, setMaterials] = useState<Material[]>(getMaterials());
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const refreshMaterials = () => {
    setMaterials(getMaterials());
  };

  const handleAdd = () => {
    setEditingMaterial({
      id: Date.now().toString(),
      name: '',
      color: '',
      pricePerGram: 0,
      stockGrams: 0,
      usedGrams: 0,
      printType: 'fdm',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial({ ...material });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingMaterial) return;

    if (!editingMaterial.name || !editingMaterial.color) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и цвет материала',
        variant: 'destructive',
      });
      return;
    }

    const existing = materials.find(m => m.id === editingMaterial.id);
    if (existing) {
      updateMaterial(editingMaterial);
      toast({
        title: 'Обновлено',
        description: 'Материал успешно обновлен',
      });
    } else {
      addMaterial(editingMaterial);
      toast({
        title: 'Добавлено',
        description: 'Материал успешно добавлен',
      });
    }

    refreshMaterials();
    setIsDialogOpen(false);
    setEditingMaterial(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот материал?')) {
      deleteMaterial(id);
      refreshMaterials();
      toast({
        title: 'Удалено',
        description: 'Материал удален',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Управление материалами</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Добавить материал
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial && materials.find(m => m.id === editingMaterial.id)
                  ? 'Редактировать материал'
                  : 'Новый материал'}
              </DialogTitle>
            </DialogHeader>
            {editingMaterial && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Тип печати</Label>
                  <Select
                    value={editingMaterial.printType}
                    onValueChange={(value: PrintType) =>
                      setEditingMaterial({ ...editingMaterial, printType: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="fdm">FDM</SelectItem>
                      <SelectItem value="sla">SLA</SelectItem>
                      <SelectItem value="multicolor">Многоцветная</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input
                    value={editingMaterial.name}
                    onChange={(e) =>
                      setEditingMaterial({ ...editingMaterial, name: e.target.value })
                    }
                    className="bg-slate-700 border-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Цвет</Label>
                  <Input
                    value={editingMaterial.color}
                    onChange={(e) =>
                      setEditingMaterial({ ...editingMaterial, color: e.target.value })
                    }
                    className="bg-slate-700 border-slate-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Цена (₽/г)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editingMaterial.pricePerGram}
                      onChange={(e) =>
                        setEditingMaterial({
                          ...editingMaterial,
                          pricePerGram: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Остаток (г)</Label>
                    <Input
                      type="number"
                      value={editingMaterial.stockGrams}
                      onChange={(e) =>
                        setEditingMaterial({
                          ...editingMaterial,
                          stockGrams: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Использовано (г)</Label>
                    <Input
                      type="number"
                      value={editingMaterial.usedGrams}
                      disabled
                      className="bg-slate-700/50 border-slate-600 text-slate-400"
                    />
                  </div>
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
                <TableHead className="text-slate-400">Цвет</TableHead>
                <TableHead className="text-slate-400">Цена (₽/г)</TableHead>
                <TableHead className="text-slate-400">Остаток (г)</TableHead>
                <TableHead className="text-slate-400">Использовано (г)</TableHead>
                <TableHead className="text-slate-400 text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id} className="border-slate-700">
                  <TableCell className="text-slate-300">
                    {PRINT_TYPE_LABELS[material.printType]}
                  </TableCell>
                  <TableCell className="text-white font-medium">{material.name}</TableCell>
                  <TableCell className="text-slate-300">{material.color}</TableCell>
                  <TableCell className="text-slate-300">{material.pricePerGram.toFixed(2)}</TableCell>
                  <TableCell className="text-slate-300">
                    <span className={material.stockGrams < 100 ? 'text-red-400' : ''}>
                      {material.stockGrams}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-300">{material.usedGrams}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(material)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(material.id)}
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
