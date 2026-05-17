import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Users, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalGoods: 0,
    totalPartners: 0,
    importsThisMonth: 0,
    exportsThisMonth: 0,
  });
  
  const [lowStockGoods, setLowStockGoods] = useState<{ma_hang: string, ten_hang: string, ton_kho: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // 1. Lấy tổng số hàng hóa
      const { count: goodsCount } = await supabase
        .from('goods')
        .select('*', { count: 'exact', head: true })
        .eq('ngung_kinh_doanh', false);

      // 2. Lấy tổng số đối tác
      const { count: partnersCount } = await supabase
        .from('partners')
        .select('*', { count: 'exact', head: true })
        .eq('ngung_giao_dich', false);

      // 3. Lấy giao dịch trong tháng
      const { data: txData } = await supabase
        .from('transactions')
        .select('loai_giao_dich, so_luong, good_id, don_gia')
        .gte('ngay_giao_dich', firstDayOfMonth);

      let imports = 0;
      let exports = 0;
      
      txData?.forEach(tx => {
        if (tx.loai_giao_dich === 'Nhập') imports++;
        else exports++;
      });

      setStats({
        totalGoods: goodsCount || 0,
        totalPartners: partnersCount || 0,
        importsThisMonth: imports,
        exportsThisMonth: exports,
      });

      // 4. Lấy hàng hóa sắp hết (Tồn kho <= 5)
      // Để tính tồn kho nhanh, lấy toàn bộ giao dịch
      const [allGoodsRes, allTxRes] = await Promise.all([
        supabase.from('goods').select('id, ma_hang, ten_hang').eq('ngung_kinh_doanh', false),
        supabase.from('transactions').select('good_id, loai_giao_dich, so_luong')
      ]);

      if (allGoodsRes.data && allTxRes.data) {
        const stockMap = new Map<string, number>();
        allTxRes.data.forEach(tx => {
          const current = stockMap.get(tx.good_id) || 0;
          if (tx.loai_giao_dich === 'Nhập') {
            stockMap.set(tx.good_id, current + Number(tx.so_luong));
          } else {
            stockMap.set(tx.good_id, current - Number(tx.so_luong));
          }
        });

        const lowStock = allGoodsRes.data
          .map(g => ({
            ma_hang: g.ma_hang,
            ten_hang: g.ten_hang,
            ton_kho: stockMap.get(g.id) || 0
          }))
          .filter(g => g.ton_kho <= 5) // Ngưỡng cảnh báo là 5
          .sort((a, b) => a.ton_kho - b.ton_kho)
          .slice(0, 5); // Lấy top 5

        setLowStockGoods(lowStock);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Tổng hàng hóa', value: stats.totalGoods, icon: <Package size={24} className="text-blue-600" />, bg: 'bg-blue-50', link: '/goods' },
    { title: 'Tổng đối tác', value: stats.totalPartners, icon: <Users size={24} className="text-purple-600" />, bg: 'bg-purple-50', link: '/partners' },
    { title: 'Phiếu Nhập (tháng này)', value: stats.importsThisMonth, icon: <ArrowDownToLine size={24} className="text-green-600" />, bg: 'bg-green-50', link: '/transactions' },
    { title: 'Phiếu Xuất (tháng này)', value: stats.exportsThisMonth, icon: <ArrowUpFromLine size={24} className="text-red-600" />, bg: 'bg-red-50', link: '/transactions' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
          <p className="text-sm text-gray-500 mt-1">Hoạt động kho hàng tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Làm mới"
        >
          <Activity size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Link key={index} to={card.link} className="block transition-transform hover:-translate-y-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{card.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  {card.icon}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Hoạt động gần đây</h3>
            <Link to="/transactions" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Xem tất cả</Link>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Activity className="h-12 w-12 text-gray-200 mb-3" />
            <p>Truy cập mục Nhập/Xuất để xem chi tiết lịch sử giao dịch.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} />
              Sắp hết hàng
            </h3>
            <Link to="/reports" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Kho</Link>
          </div>
          
          <div className="space-y-4">
            {lowStockGoods.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Tất cả hàng hóa đều còn đủ số lượng.</p>
            ) : (
              lowStockGoods.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.ten_hang}</p>
                    <p className="text-xs text-gray-500">{item.ma_hang}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    item.ton_kho <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.ton_kho}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
