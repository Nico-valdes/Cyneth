'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Package, TrendingUp, Users, ShoppingBag, Star, Eye, MessageCircle } from 'lucide-react';

interface StatisticsProps {
  products: any[];
}

const Statistics: React.FC<StatisticsProps> = ({ products }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalVisits: 15420, // Datos ficticios hasta implementar analytics real
    whatsappInquiries: 89, // Datos ficticios hasta implementar tracking real
    conversionRate: 3.2 // Datos ficticios
  });

  useEffect(() => {
    if (Array.isArray(products)) {
      const activeProducts = products.filter(p => p.active).length;
      const featuredProducts = products.filter(p => p.featured).length;
      const categories = new Set(products.map(p => p.category)).size;
      const brands = new Set(products.map(p => p.brand).filter(Boolean)).size;

      setStats(prev => ({
        ...prev,
        totalProducts: products.length,
        activeProducts,
        featuredProducts,
        totalCategories: categories,
        totalBrands: brands
      }));
    }
  }, [products]);

  const StatCard = ({ title, value, icon: Icon, color, description }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    description?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Estadísticas</h2>
          <p className="text-gray-600 mt-1">Resumen general del inventario y actividad</p>
        </div>
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleString('es-ES')}
        </div>
      </div>

      {/* Cards de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Productos"
          value={stats.totalProducts}
          icon={Package}
          color="bg-blue-500"
          description={`${stats.activeProducts} activos`}
        />
        <StatCard
          title="Productos Destacados"
          value={stats.featuredProducts}
          icon={Star}
          color="bg-yellow-500"
          description="En portada"
        />
        <StatCard
          title="Categorías"
          value={stats.totalCategories}
          icon={ShoppingBag}
          color="bg-green-500"
          description="Diferentes categorías"
        />
        <StatCard
          title="Marcas"
          value={stats.totalBrands}
          icon={TrendingUp}
          color="bg-purple-500"
          description="Marcas registradas"
        />
      </div>

      {/* Estadísticas de actividad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Visitas Totales"
          value={stats.totalVisits.toLocaleString()}
          icon={Eye}
          color="bg-indigo-500"
          description="Este mes"
        />
        <StatCard
          title="Consultas WhatsApp"
          value={stats.whatsappInquiries}
          icon={MessageCircle}
          color="bg-green-600"
          description="Pendientes de respuesta"
        />
        <StatCard
          title="Tasa de Conversión"
          value={`${stats.conversionRate}%`}
          icon={TrendingUp}
          color="bg-red-500"
          description="Visitas a consultas"
        />
      </div>

      {/* Gráficos y actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Categorías</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Gráfico de distribución</p>
              <p className="text-sm text-gray-400">{stats.totalCategories} categorías activas</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Nuevo producto agregado</span>
              <span className="text-xs text-gray-500 ml-auto">Hace 2h</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Consulta WhatsApp recibida</span>
              <span className="text-xs text-gray-500 ml-auto">Hace 4h</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Producto destacado actualizado</span>
              <span className="text-xs text-gray-500 ml-auto">Hace 6h</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Nueva categoría creada</span>
              <span className="text-xs text-gray-500 ml-auto">Hace 1d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de productos por estado */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Productos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.activeProducts}</div>
            <div className="text-sm text-green-700">Productos Activos</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.featuredProducts}</div>
            <div className="text-sm text-yellow-700">Productos Destacados</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{stats.totalProducts - stats.activeProducts}</div>
            <div className="text-sm text-gray-700">Productos Inactivos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;