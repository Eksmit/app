import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/LoginForm';
import { CalculatorPanel } from '@/components/Calculator';
import { OrdersList } from '@/components/OrdersList';
import { MaterialsManager } from '@/components/MaterialsManager';
import { ServicesManager } from '@/components/ServicesManager';
import { SettingsPanel } from '@/components/SettingsPanel';
import { 
  Calculator, 
  List, 
  Package, 
  Wrench, 
  Settings, 
  LogOut,
  User,
  Printer
} from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, logout } = useAuth();

  const handleDataUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">3D Print Calculator</h1>
                <p className="text-xs text-slate-400">Калькулятор стоимости печати</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400">
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-slate-400 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1 mb-8 flex flex-wrap gap-1">
            <TabsTrigger 
              value="calculator" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Калькулятор
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <List className="w-4 h-4 mr-2" />
              Заказы
            </TabsTrigger>
            <TabsTrigger 
              value="materials"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Package className="w-4 h-4 mr-2" />
              Материалы
            </TabsTrigger>
            <TabsTrigger 
              value="services"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Услуги
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="mt-0">
            <CalculatorPanel onSave={handleDataUpdate} />
          </TabsContent>

          <TabsContent value="orders" className="mt-0">
            <OrdersList key={refreshKey} onUpdate={handleDataUpdate} />
          </TabsContent>

          <TabsContent value="materials" className="mt-0">
            <MaterialsManager />
          </TabsContent>

          <TabsContent value="services" className="mt-0">
            <ServicesManager />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-slate-500 text-sm">
            3D Print Calculator © {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <MainApp /> : <LoginForm />;
}

export default App;
