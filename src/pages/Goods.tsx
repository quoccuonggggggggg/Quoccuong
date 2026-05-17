import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Upload, Search, X } from 'lucide-react';
import * as XLSX from 'xlsx';

type Good = {
  id: string;
  ma_hang: string;
  ten_hang: string;
  nhom_hang: string;
  don_vi_tinh: string;
  quy_cach: string;
  vi_tri: string;
  ngung_kinh_doanh: boolean;
};

const Goods = () => {
  const [goods, setGoods] = useState<Good[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingGood, setEditingGood] = useState<Partial<Good> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGoods();
  }, []);

  const fetchGoods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goods')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoods(data || []);
    } catch (error: any) {
      toast.error('Lỗi khi tải danh sách hàng hóa: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredGoods = goods.filter(good => {
    const matchSearch = 
      good.ma_hang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      good.ten_hang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (good.nhom_hang && good.nhom_hang.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!showInactive && good.ngung_kinh_doanh) return false;
    return matchSearch;
  });

  const handleOpenModal = (good: Good | null = null) => {
    if (good) {
      setEditingGood(good);
    } else {
      setEditingGood({
        ma_hang: '',
        ten_hang: '',
        nhom_hang: '',
        don_vi_tinh: '',
        quy_cach: '',
        vi_tri: '',
        ngung_kinh_doanh: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGood(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGood?.ma_hang || !editingGood?.ten_hang) {
      toast.error('Vui lòng nhập mã và tên hàng hóa');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const goodData = {
        ma_hang: editingGood.ma_hang,
        ten_hang: editingGood.ten_hang,
        nhom_hang: editingGood.nhom_hang,
        don_vi_tinh: editingGood.don_vi_tinh,
        quy_cach: editingGood.quy_cach,
        vi_tri: editingGood.vi_tri,
        ngung_kinh_doanh: editingGood.ngung_kinh_doanh || false
      };

      if (editingGood.id) {
        // Cập nhật
        const { error } = await supabase
          .from('goods')
          .update(goodData)
          .eq('id', editingGood.id);
          
        if (error) throw error;
        toast.success('Cập nhật thành công');
      } else {
        // Thêm mới
        const { error } = await supabase
          .from('goods')
          .insert([goodData]);
          
        if (error) {
          if (error.code === '23505') throw new Error('Mã hàng hóa đã tồn tại');
          throw error;
        }
        toast.success('Thêm mới thành công');
      }

      handleCloseModal();
      fetchGoods();
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, ten_hang: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa mặt hàng "${ten_hang}"?`)) return;

    try {
      const { error } = await supabase.from('goods').delete().eq('id', id);
      if (error) {
        if (error.code === '23503') throw new Error('Không thể xóa mặt hàng đã có giao dịch nhập xuất');
        throw error;
      }
      toast.success('Đã xóa thành công');
      fetchGoods();
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

        const formattedData = data.map((item: any) => ({
          ma_hang: String(item['Mã hàng'] || item.ma_hang || '').trim(),
          ten_hang: String(item['Tên hàng'] || item.ten_hang || '').trim(),
          nhom_hang: String(item['Nhóm hàng'] || item.nhom_hang || '').trim(),
          don_vi_tinh: String(item['Đơn vị tính'] || item.don_vi_tinh || '').trim(),
          quy_cach: String(item['Quy cách'] || item.quy_cach || '').trim(),
          vi_tri: String(item['Vị trí'] || item.vi_tri || '').trim(),
          ngung_kinh_doanh: false
        })).filter(item => item.ma_hang && item.ten_hang);

        if (formattedData.length === 0) {
          toast.error('File Excel không đúng định dạng (cần cột Mã hàng, Tên hàng)');
          return;
        }

        const { error } = await supabase.from('goods').insert(formattedData);
        if (error) {
          if (error.code === '23505') throw new Error('Có mã hàng trong file bị trùng lặp với dữ liệu hiện tại');
          throw error;
        }

        toast.success(`Đã import thành công ${formattedData.length} mặt hàng`);
        fetchGoods();
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
        <h1 className="text-2xl font-bold text-gray-800">Danh mục Hàng hóa</h1>
        
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
            <span>Thêm mặt hàng</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm mã, tên, nhóm hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showInactive"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="showInactive" className="text-sm text-gray-600 cursor-pointer">
            Hiển thị hàng ngừng kinh doanh
          </label>
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
                  <th className="px-6 py-4">Mã hàng</th>
                  <th className="px-6 py-4">Tên hàng</th>
                  <th className="px-6 py-4">Nhóm hàng</th>
                  <th className="px-6 py-4">Đơn vị</th>
                  <th className="px-6 py-4">Quy cách</th>
                  <th className="px-6 py-4">Vị trí</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredGoods.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Không tìm thấy dữ liệu.
                    </td>
                  </tr>
                ) : (
                  filteredGoods.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.ma_hang}</td>
                      <td className="px-6 py-4">{item.ten_hang}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                          {item.nhom_hang || '--'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{item.don_vi_tinh}</td>
                      <td className="px-6 py-4 text-gray-500">{item.quy_cach || '--'}</td>
                      <td className="px-6 py-4">{item.vi_tri || '--'}</td>
                      <td className="px-6 py-4">
                        {item.ngung_kinh_doanh ? (
                          <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-100">
                            Ngừng KD
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium border border-green-100">
                            Đang KD
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(item)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id, item.ten_hang)}
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
      {showModal && editingGood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingGood.id ? 'Cập nhật hàng hóa' : 'Thêm hàng hóa mới'}
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
                  <label className="text-sm font-medium text-gray-700">Mã hàng hóa <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingGood.ma_hang || ''}
                    onChange={(e) => setEditingGood({...editingGood, ma_hang: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="VD: SP001"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Tên hàng hóa <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingGood.ten_hang || ''}
                    onChange={(e) => setEditingGood({...editingGood, ten_hang: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Nhập tên mặt hàng"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Nhóm hàng</label>
                  <input
                    type="text"
                    value={editingGood.nhom_hang || ''}
                    onChange={(e) => setEditingGood({...editingGood, nhom_hang: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="VD: Điện tử, Gia dụng..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Đơn vị tính</label>
                  <input
                    type="text"
                    value={editingGood.don_vi_tinh || ''}
                    onChange={(e) => setEditingGood({...editingGood, don_vi_tinh: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="VD: Cái, Hộp, Kg..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Quy cách / Thể tích</label>
                  <input
                    type="text"
                    value={editingGood.quy_cach || ''}
                    onChange={(e) => setEditingGood({...editingGood, quy_cach: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="VD: Hộp 12 cái"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Vị trí lưu kho (Khu vực/Kệ)</label>
                  <input
                    type="text"
                    value={editingGood.vi_tri || ''}
                    onChange={(e) => setEditingGood({...editingGood, vi_tri: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="VD: Kệ A1"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={editingGood.ngung_kinh_doanh || false}
                    onChange={(e) => setEditingGood({...editingGood, ngung_kinh_doanh: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-800">Ngừng kinh doanh</div>
                    <div className="text-sm text-gray-500">Đánh dấu không theo dõi hoặc không cho phép nhập xuất mặt hàng này nữa</div>
                  </div>
                </label>
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
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? 'Đang lưu...' : (editingGood.id ? 'Lưu thay đổi' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goods;
