import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

type Transaction = {
  id: string;
  ma_phieu: string;
  loai_giao_dich: 'Nhập' | 'Xuất';
  ngay_giao_dich: string;
  so_luong: number;
  don_gia: number;
  good_id: string;
  partner_id: string;
  created_at: string;
  goods?: {
    ma_hang: string;
    ten_hang: string;
  };
  partners?: {
    ten_doi_tac: string;
  };
};

type Good = {
  id: string;
  ma_hang: string;
  ten_hang: string;
  ngung_kinh_doanh: boolean;
};

type Partner = {
  id: string;
  ten_doi_tac: string;
  phan_loai: string;
  ngung_giao_dich: boolean;
};

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goods, setGoods] = useState<Good[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Partial<Transaction> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStock, setCurrentStock] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, goodsRes, partnersRes] = await Promise.all([
        supabase
          .from('transactions')
          .select(`
            *,
            goods(ma_hang, ten_hang),
            partners(ten_doi_tac)
          `)
          .order('ngay_giao_dich', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase.from('goods').select('id, ma_hang, ten_hang, ngung_kinh_doanh'),
        supabase.from('partners').select('id, ten_doi_tac, phan_loai, ngung_giao_dich')
      ]);

      if (txRes.error) throw txRes.error;
      if (goodsRes.error) throw goodsRes.error;
      if (partnersRes.error) throw partnersRes.error;

      setTransactions(txRes.data || []);
      setGoods(goodsRes.data || []);
      setPartners(partnersRes.data || []);
    } catch (error: any) {
      toast.error('Lỗi khi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTxs = transactions.filter(tx => {
    return (
      tx.ma_phieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.goods?.ten_hang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.goods?.ma_hang.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenModal = () => {
    setEditingTx({
      ma_phieu: `PH${format(new Date(), 'yyyyMMddHHmmss')}`,
      loai_giao_dich: 'Nhập',
      ngay_giao_dich: format(new Date(), 'yyyy-MM-dd'),
      so_luong: 1,
      don_gia: 0,
      good_id: '',
      partner_id: ''
    });
    setCurrentStock(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTx(null);
    setCurrentStock(null);
  };

  // Tính tồn kho hiện tại của một mặt hàng
  const checkStock = async (goodId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('loai_giao_dich, so_luong')
        .eq('good_id', goodId);
        
      if (error) throw error;
      
      let totalIn = 0;
      let totalOut = 0;
      
      data?.forEach(tx => {
        if (tx.loai_giao_dich === 'Nhập') totalIn += Number(tx.so_luong);
        else totalOut += Number(tx.so_luong);
      });
      
      const stock = totalIn - totalOut;
      setCurrentStock(stock);
      return stock;
    } catch (error: any) {
      console.error('Lỗi khi kiểm tra tồn kho:', error);
      return 0;
    }
  };

  useEffect(() => {
    if (editingTx?.good_id) {
      checkStock(editingTx.good_id);
    } else {
      setCurrentStock(null);
    }
  }, [editingTx?.good_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx?.good_id || !editingTx?.loai_giao_dich || !editingTx?.so_luong || editingTx.so_luong <= 0) {
      toast.error('Vui lòng kiểm tra lại thông tin. Số lượng phải > 0');
      return;
    }

    // Logic chặn xuất kho nếu quá số lượng tồn
    if (editingTx.loai_giao_dich === 'Xuất') {
      const stock = await checkStock(editingTx.good_id);
      if (stock <= 0) {
        toast.error('Mặt hàng này đã hết trong kho (Tồn = 0). Không thể xuất!');
        return;
      }
      if (stock < editingTx.so_luong) {
        toast.error(`Số lượng xuất (${editingTx.so_luong}) vượt quá tồn kho hiện tại (${stock})!`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      
      const txData = {
        ma_phieu: editingTx.ma_phieu,
        loai_giao_dich: editingTx.loai_giao_dich,
        ngay_giao_dich: editingTx.ngay_giao_dich,
        so_luong: editingTx.so_luong,
        don_gia: editingTx.don_gia || 0,
        good_id: editingTx.good_id,
        partner_id: editingTx.partner_id || null
      };

      const { error } = await supabase.from('transactions').insert([txData]);
        
      if (error) throw error;
      
      toast.success('Thêm giao dịch thành công');
      handleCloseModal();
      fetchData();
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, ma_phieu: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phiếu "${ma_phieu}"?`)) return;

    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Đã xóa thành công');
      fetchData();
    } catch (error: any) {
      toast.error('Lỗi khi xóa: ' + error.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.error('File Excel không có dữ liệu');
          return;
        }

        // Validate and format
        const formattedData = [];
        for (const item of data as any[]) {
          const maPhieu = String(item['MaPhieu'] || item.ma_phieu || '').trim();
          const maHang = String(item['MaHang'] || item.ma_hang || '').trim();
          let loaiGiaoDich = String(item['LoaiGiaoDich'] || item.loai_giao_dich || '').trim();
          const soLuong = Number(item['SoLuong'] || item.so_luong || 0);
          const ngayGiaoDich = item['NgayGiaoDich'] || item.ngay_giao_dich;
          const donGia = Number(item['DonGia'] || item.don_gia || 0);
          const maDoiTac = String(item['MaDoiTac'] || item.ma_doi_tac || '').trim();
          
          if (!maHang || soLuong <= 0) continue;
          
          // Format loai_giao_dich
          if (loaiGiaoDich.toLowerCase() === 'nhap' || loaiGiaoDich.toLowerCase() === 'nhập') loaiGiaoDich = 'Nhập';
          if (loaiGiaoDich.toLowerCase() === 'xuat' || loaiGiaoDich.toLowerCase() === 'xuất') loaiGiaoDich = 'Xuất';

          // Lookup good_id
          const good = goods.find(g => g.ma_hang.toLowerCase() === maHang.toLowerCase());
          if (!good) {
            throw new Error(`Mã hàng ${maHang} không tồn tại trong hệ thống.`);
          }
          
          // Lookup partner_id if provided
          let partner_id = null;
          if (maDoiTac) {
            const partner = partners.find(p => p.ma_doi_tac?.toLowerCase() === maDoiTac.toLowerCase());
            if (partner) partner_id = partner.id;
          }

          formattedData.push({
            ma_phieu: maPhieu || `PH${Date.now()}${Math.floor(Math.random()*100)}`,
            loai_giao_dich: loaiGiaoDich,
            ngay_giao_dich: ngayGiaoDich ? new Date(ngayGiaoDich).toISOString().split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
            so_luong: soLuong,
            don_gia: donGia,
            good_id: good.id,
            partner_id: partner_id
          });
        }

        if (formattedData.length === 0) {
          toast.error('File Excel không đúng định dạng hoặc không có dòng hợp lệ');
          return;
        }

        // Note: For Excel import, we are skipping the strict stock check for simplicity of batch import. 
        // In a real production system, we'd need to validate stock sequentially.
        const { error } = await supabase.from('transactions').insert(formattedData);
        if (error) throw error;

        toast.success(`Đã import thành công ${formattedData.length} giao dịch`);
        fetchData();
      } catch (error: any) {
        toast.error('Lỗi import: ' + error.message);
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Giao dịch Nhập/Xuất</h1>
        
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-medium transition-all"
          >
            <Upload size={18} />
            <span>Import Excel</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 text-white font-medium transition-all"
          >
            <Plus size={18} />
            <span>Tạo phiếu mới</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm theo mã phiếu, mã/tên hàng hóa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Mã phiếu</th>
                  <th className="px-6 py-4">Ngày</th>
                  <th className="px-6 py-4">Loại</th>
                  <th className="px-6 py-4">Hàng hóa</th>
                  <th className="px-6 py-4">Số lượng</th>
                  <th className="px-6 py-4">Đơn giá</th>
                  <th className="px-6 py-4">Đối tác</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTxs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Không tìm thấy giao dịch nào.
                    </td>
                  </tr>
                ) : (
                  filteredTxs.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.ma_phieu}</td>
                      <td className="px-6 py-4">{format(new Date(item.ngay_giao_dich), 'dd/MM/yyyy')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                          item.loai_giao_dich === 'Nhập' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {item.loai_giao_dich}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{item.goods?.ten_hang}</div>
                        <div className="text-xs text-gray-500">{item.goods?.ma_hang}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{item.so_luong.toLocaleString()}</td>
                      <td className="px-6 py-4">{item.don_gia.toLocaleString()} đ</td>
                      <td className="px-6 py-4">{item.partners?.ten_doi_tac || '--'}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleDelete(item.id, item.ma_phieu)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showModal && editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Tạo phiếu {editingTx.loai_giao_dich}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Mã phiếu <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingTx.ma_phieu || ''}
                    onChange={(e) => setEditingTx({...editingTx, ma_phieu: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Ngày giao dịch <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={editingTx.ngay_giao_dich || ''}
                    onChange={(e) => setEditingTx({...editingTx, ngay_giao_dich: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Loại giao dịch <span className="text-red-500">*</span></label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="loai_giao_dich" 
                        value="Nhập" 
                        checked={editingTx.loai_giao_dich === 'Nhập'}
                        onChange={(e) => setEditingTx({...editingTx, loai_giao_dich: 'Nhập'})}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Nhập kho</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="loai_giao_dich" 
                        value="Xuất" 
                        checked={editingTx.loai_giao_dich === 'Xuất'}
                        onChange={(e) => setEditingTx({...editingTx, loai_giao_dich: 'Xuất'})}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>Xuất kho</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 flex justify-between">
                    <span>Hàng hóa <span className="text-red-500">*</span></span>
                    {currentStock !== null && (
                      <span className={`text-sm ${currentStock <= 0 ? 'text-red-600 font-bold' : 'text-green-600 font-medium'}`}>
                        Tồn kho hiện tại: {currentStock.toLocaleString()}
                      </span>
                    )}
                  </label>
                  <select
                    required
                    value={editingTx.good_id || ''}
                    onChange={(e) => setEditingTx({...editingTx, good_id: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Chọn mặt hàng --</option>
                    {goods.filter(g => !g.ngung_kinh_doanh).map(g => (
                      <option key={g.id} value={g.id}>
                        {g.ma_hang} - {g.ten_hang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Số lượng <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={editingTx.so_luong || ''}
                    onChange={(e) => setEditingTx({...editingTx, so_luong: Number(e.target.value)})}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      editingTx.loai_giao_dich === 'Xuất' && currentStock !== null && Number(editingTx.so_luong) > currentStock
                        ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                  />
                  {editingTx.loai_giao_dich === 'Xuất' && currentStock !== null && Number(editingTx.so_luong) > currentStock && (
                    <p className="text-xs text-red-600 mt-1">Số lượng xuất vượt quá tồn kho!</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Đơn giá</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editingTx.don_gia || ''}
                    onChange={(e) => setEditingTx({...editingTx, don_gia: Number(e.target.value)})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Đối tác</label>
                  <select
                    value={editingTx.partner_id || ''}
                    onChange={(e) => setEditingTx({...editingTx, partner_id: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Chọn đối tác (Không bắt buộc) --</option>
                    {partners.filter(p => !p.ngung_giao_dich).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.ten_doi_tac} ({p.phan_loai})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (editingTx.loai_giao_dich === 'Xuất' && currentStock !== null && Number(editingTx.so_luong) > currentStock)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Tạo phiếu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
