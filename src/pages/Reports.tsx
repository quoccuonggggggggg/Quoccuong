import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Search, FileText, ArrowRightLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';

type InventoryItem = {
  good_id: string;
  ma_hang: string;
  ten_hang: string;
  nhom_hang: string;
  don_vi_tinh: string;
  tong_nhap: number;
  tong_xuat: number;
  ton_kho: number;
};

type Good = {
  id: string;
  ma_hang: string;
  ten_hang: string;
};

type Transaction = {
  id: string;
  ma_phieu: string;
  loai_giao_dich: string;
  ngay_giao_dich: string;
  so_luong: number;
  don_gia: number;
  partners?: {
    ten_doi_tac: string;
  };
};

const Reports = () => {
  const [activeTab, setActiveTab] = useState<'ton_kho' | 'the_kho'>('ton_kho');
  
  // Tồn kho state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInv, setLoadingInv] = useState(true);
  const [searchInv, setSearchInv] = useState('');
  
  // Thẻ kho state
  const [goods, setGoods] = useState<Good[]>([]);
  const [selectedGood, setSelectedGood] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchGoodsList();
  }, []);

  const fetchGoodsList = async () => {
    try {
      const { data, error } = await supabase.from('goods').select('id, ma_hang, ten_hang').order('ma_hang');
      if (error) throw error;
      setGoods(data || []);
    } catch (error: any) {
      toast.error('Lỗi tải danh sách hàng hóa: ' + error.message);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoadingInv(true);
      // Fetch goods and transactions to calculate inventory
      const [goodsRes, txRes] = await Promise.all([
        supabase.from('goods').select('*'),
        supabase.from('transactions').select('good_id, loai_giao_dich, so_luong')
      ]);

      if (goodsRes.error) throw goodsRes.error;
      if (txRes.error) throw txRes.error;

      const txMap = new Map();
      txRes.data?.forEach(tx => {
        if (!txMap.has(tx.good_id)) {
          txMap.set(tx.good_id, { nhap: 0, xuat: 0 });
        }
        const current = txMap.get(tx.good_id);
        if (tx.loai_giao_dich === 'Nhập') {
          current.nhap += Number(tx.so_luong);
        } else {
          current.xuat += Number(tx.so_luong);
        }
      });

      const invData: InventoryItem[] = (goodsRes.data || []).map(good => {
        const stats = txMap.get(good.id) || { nhap: 0, xuat: 0 };
        return {
          good_id: good.id,
          ma_hang: good.ma_hang,
          ten_hang: good.ten_hang,
          nhom_hang: good.nhom_hang,
          don_vi_tinh: good.don_vi_tinh,
          tong_nhap: stats.nhap,
          tong_xuat: stats.xuat,
          ton_kho: stats.nhap - stats.xuat
        };
      });

      setInventory(invData);
    } catch (error: any) {
      toast.error('Lỗi tính tồn kho: ' + error.message);
    } finally {
      setLoadingInv(false);
    }
  };

  const fetchStockCard = async (goodId: string, month: string) => {
    if (!goodId) return;
    try {
      setLoadingTx(true);
      
      let query = supabase
        .from('transactions')
        .select(`
          id, ma_phieu, loai_giao_dich, ngay_giao_dich, so_luong, don_gia,
          partners(ten_doi_tac)
        `)
        .eq('good_id', goodId)
        .order('ngay_giao_dich', { ascending: true })
        .order('created_at', { ascending: true });

      if (month) {
        // month is in YYYY-MM format
        const startDate = `${month}-01`;
        // Lấy ngày cuối tháng
        const date = new Date(month + '-01');
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
        
        query = query.gte('ngay_giao_dich', startDate).lte('ngay_giao_dich', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error: any) {
      toast.error('Lỗi tải thẻ kho: ' + error.message);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'the_kho' && selectedGood) {
      fetchStockCard(selectedGood, selectedMonth);
    }
  }, [selectedGood, selectedMonth, activeTab]);

  const filteredInventory = inventory.filter(inv => 
    inv.ma_hang.toLowerCase().includes(searchInv.toLowerCase()) ||
    inv.ten_hang.toLowerCase().includes(searchInv.toLowerCase()) ||
    (inv.nhom_hang && inv.nhom_hang.toLowerCase().includes(searchInv.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Báo cáo & Thẻ kho</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('ton_kho')}
            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
              activeTab === 'ton_kho' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-center items-center gap-2">
              <FileText size={18} />
              <span>Báo cáo Tồn kho</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('the_kho')}
            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
              activeTab === 'the_kho' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-center items-center gap-2">
              <ArrowRightLeft size={18} />
              <span>Lịch sử Thẻ kho</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'ton_kho' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm theo mã, tên, nhóm hàng..."
                    value={searchInv}
                    onChange={(e) => setSearchInv(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <button
                  onClick={fetchInventory}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Làm mới
                </button>
              </div>

              {loadingInv ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Mã hàng</th>
                        <th className="px-6 py-4">Tên hàng hóa</th>
                        <th className="px-6 py-4">Nhóm</th>
                        <th className="px-6 py-4">ĐVT</th>
                        <th className="px-6 py-4 text-right text-blue-600">Tổng nhập</th>
                        <th className="px-6 py-4 text-right text-red-600">Tổng xuất</th>
                        <th className="px-6 py-4 text-right text-green-600 font-bold">Tồn kho cuối</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredInventory.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            Không có dữ liệu tồn kho.
                          </td>
                        </tr>
                      ) : (
                        filteredInventory.map((item) => (
                          <tr key={item.good_id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{item.ma_hang}</td>
                            <td className="px-6 py-4 font-medium text-gray-800">{item.ten_hang}</td>
                            <td className="px-6 py-4">{item.nhom_hang || '--'}</td>
                            <td className="px-6 py-4">{item.don_vi_tinh}</td>
                            <td className="px-6 py-4 text-right font-medium text-blue-600">{item.tong_nhap.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right font-medium text-red-600">{item.tong_xuat.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right font-bold text-green-600 text-base">{item.ton_kho.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'the_kho' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Chọn mặt hàng <span className="text-red-500">*</span></label>
                  <select
                    value={selectedGood}
                    onChange={(e) => setSelectedGood(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Chọn mặt hàng để xem thẻ kho --</option>
                    {goods.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.ma_hang} - {g.ten_hang}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-64 space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Tháng (Tùy chọn)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {!selectedGood ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <ArrowRightLeft className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p>Vui lòng chọn một mặt hàng để xem chi tiết thẻ kho.</p>
                </div>
              ) : loadingTx ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Ngày giao dịch</th>
                        <th className="px-6 py-4">Mã phiếu</th>
                        <th className="px-6 py-4">Diễn giải / Đối tác</th>
                        <th className="px-6 py-4 text-center">Loại GD</th>
                        <th className="px-6 py-4 text-right text-blue-600">Nhập</th>
                        <th className="px-6 py-4 text-right text-red-600">Xuất</th>
                        <th className="px-6 py-4 text-right text-green-600 font-bold">Tồn sau GD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            Không có giao dịch nào trong khoảng thời gian này.
                          </td>
                        </tr>
                      ) : (
                        (() => {
                          let runningStock = 0;
                          return transactions.map((tx) => {
                            if (tx.loai_giao_dich === 'Nhập') {
                              runningStock += Number(tx.so_luong);
                            } else {
                              runningStock -= Number(tx.so_luong);
                            }
                            
                            return (
                              <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">{format(new Date(tx.ngay_giao_dich), 'dd/MM/yyyy')}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{tx.ma_phieu}</td>
                                <td className="px-6 py-4">{tx.partners?.ten_doi_tac || 'Nội bộ'}</td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                                    tx.loai_giao_dich === 'Nhập' 
                                      ? 'bg-blue-50 text-blue-700' 
                                      : 'bg-red-50 text-red-700'
                                  }`}>
                                    {tx.loai_giao_dich}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right text-blue-600 font-medium">
                                  {tx.loai_giao_dich === 'Nhập' ? tx.so_luong.toLocaleString() : ''}
                                </td>
                                <td className="px-6 py-4 text-right text-red-600 font-medium">
                                  {tx.loai_giao_dich === 'Xuất' ? tx.so_luong.toLocaleString() : ''}
                                </td>
                                <td className="px-6 py-4 text-right text-green-600 font-bold bg-green-50/10">
                                  {runningStock.toLocaleString()}
                                </td>
                              </tr>
                            );
                          });
                        })()
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
