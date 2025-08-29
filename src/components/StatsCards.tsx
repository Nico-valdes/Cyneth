'use client';

import React from 'react';
import { Eye, MessageCircle, Package, Star, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalVisits: number;
    whatsappInquiries: number;
    totalProducts: number;
    featuredProducts: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Visitas Totales',
      value: stats.totalVisits.toLocaleString(),
      change: '+12%',
      changeType: 'increase' as const,
      icon: Eye,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-100',
      description: 'vs mes anterior'
    },
    {
      title: 'Consultas WhatsApp',
      value: stats.whatsappInquiries.toString(),
      change: '+8%',
      changeType: 'increase' as const,
      icon: MessageCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-100',
      description: 'Este mes'
    },
    {
      title: 'Total Productos',
      value: stats.totalProducts.toString(),
      change: '+5%',
      changeType: 'increase' as const,
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-100',
      description: 'En catálogo'
    },
    {
      title: 'Productos Destacados',
      value: stats.featuredProducts.toString(),
      change: '+2',
      changeType: 'increase' as const,
      icon: Star,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-100',
      description: 'En portada'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className={`bg-gradient-to-r ${card.color} text-white overflow-hidden shadow rounded-lg`}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <card.icon size={24} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium ${card.textColor} truncate`}>
                    {card.title}
                  </dt>
                  <dd className="text-2xl font-bold">{card.value}</dd>
                  <dd className={`text-sm ${card.textColor} flex items-center`}>
                    {card.changeType === 'increase' ? (
                      <TrendingUp size={14} className="mr-1" />
                    ) : (
                      <TrendingDown size={14} className="mr-1" />
                    )}
                    {card.change} {card.description}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
