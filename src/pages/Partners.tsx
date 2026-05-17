import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';

type Partner = {
  id: string;
  ma_doi_tac: string;
  ten_doi_tac: string;
  phan_loai: 'Nhà cung cấp' | 'Khách hàng';
  so_dien_thoai: string;
  dia_chi: string;
  ma_so_thue: string;
  ngung_giao_dich: boolean;
};

const Partners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partial<Partner> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error: any) {
      toast.error('Lỗi khi tải danh sách đối tác: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchSearch = 
      partner.ma_doi_tac.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.ten_doi_tac.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (partner.so_dien_thoai && partner.so_dien_thoai.includes(searchTerm));
      
    const matchType = filterType === 'all' || partner.phan_loai === filterType;
    const matchStatus = showInactive ? true : !partner.ngung_giao_dich;
    
    return matchSearch && matchType && matchStatus;
  });

  const handleOpenModal = (partner: Partner | null = null) => {
    if (partner) {
      setEditingPartner(partner);
    } else {
      setEditingPartner({
        ma_doi_tac: '',
        ten_doi_tac: '',
        phan_loai: 'Nhà cung cấp',
        so_dien_thoai: '',
        dia_chi: '',
        ma_so_thue: '',
        ngung_giao_dich: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPartner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner?.ma_doi_tac || !editingPartner?.ten_doi_tac || !editingPartner?.phan_loai) {
      toast.error('Vui lòng nhập các thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const partnerData = {
        ma_doi_tac: editingPartner.ma_doi_tac,
        ten_doi_tac: editingPartner.ten_doi_tac,
        phan_loai: editingPartner.phan_loai,
        so_dien_thoai: editingPartner.so_dien_thoai,
        dia_chi: editingPartner.dia_chi,
        ma_so_thue: editingPartner.ma_so_thue,
        ngung_giao_dich: editingPartner.ngung_giao_dich || false
      };

      if (editingPartner.id) {
        // Cập nhật
        const { error } = await supabase
          .from('partners')
          .update(partnerData)
          .eq('id', editingPartner.id);
          
        if (error) throw error;
        toast.success('Cập nhật thành công');
      } else {
        // Thêm mới
        const { error } = await supabase
          .from('partners')
          .insert([partnerData]);
          
        if (error) {
          if (error.code === '23505') throw new Error('Mã đối tác đã tồn tại');
          throw error;
        }
        toast.success('Thêm mới thành công');
      }

      handleCloseModal();
      fetchPartners();
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa đối tác "${name}"?`)) return;

    try {
      const { error } = await supabase.from('partners').delete().eq('id', id);
      if (error) {
        if (error.code === '23503') throw new Error('Không thể xóa đối tác đã có giao dịch');
        throw error;
      }
      toast.success('Đã xóa thành công');
      fetchPartners();
    } catch (error: any) {
      toast.error('Lỗi khi xóa: ' + error.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Danh mục Đối tác</h1>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 text-white font-medium transition-all"
        >
          <Plus size={18} />
          <span>Thêm đối tác</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm mã, tên, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value="all">Tất cả phân loại</option>
            <option value="Nhà cung cấp">Nhà cung cấp</option>
            <option value="Khách hàng">Khách hàng</option>
          </select>
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
            Hiển thị ngừng giao dịch
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
                  <th className="px-6 py-4">Mã ĐT</th>
                  <th className="px-6 py-4">Tên đối tác</th>
                  <th className="px-6 py-4">Phân loại</th>
                  <th className="px-6 py-4">Số điện thoại</th>
                  <th className="px-6 py-4">Mã số thuế</th>
                  <th className="px-6 py-4">Địa chỉ</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Không tìm thấy dữ liệu.
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.ma_doi_tac}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{item.ten_doi_tac}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                          item.phan_loai === 'Nhà cung cấp' 
                            ? 'bg-purple-50 text-purple-700' 
                            : 'bg-orange-50 text-orange-700'
                        }`}>
                          {item.phan_loai}
                        </span>
                      </td>
                      <td className="px-6 py-4">{item.so_dien_thoai || '--'}</td>
                      <td className="px-6 py-4">{item.ma_so_thue || '--'}</td>
                      <td className="px-6 py-4 truncate max-w-[200px]" title={item.dia_chi}>{item.dia_chi || '--'}</td>
                      <td className="px-6 py-4">
                        {item.ngung_giao_dich ? (
                          <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-100">
                            Ngừng GD
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium border border-green-100">
                            Hoạt động
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
                            onClick={() => handleDelete(item.id, item.ten_doi_tac)}
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
      {showModal && editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingPartner.id ? 'Cập nhật Đối tác' : 'Thêm đối tác mới'}
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
                  <label className="text-sm font-medium text-gray-700">Mã đối tác <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingPartner.ma_doi_tac || ''}
                    onChange={(e) => setEditingPartner({...editingPartner, ma_doi_tac: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="VD: NCC001"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Tên đối tác <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingPartner.ten_doi_tac || ''}
                    onChange={(e) => setEditingPartner({...editingPartner, ten_doi_tac: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Nhập tên đối tác"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Phân loại <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={editingPartner.phan_loai || 'Nhà cung cấp'}
                    onChange={(e) => setEditingPartner({...editingPartner, phan_loai: e.target.value as any})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="Nhà cung cấp">Nhà cung cấp</option>
                    <option value="Khách hàng">Khách hàng</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input
                    type="text"
                    value={editingPartner.so_dien_thoai || ''}
                    onChange={(e) => setEditingPartner({...editingPartner, so_dien_thoai: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Mã số thuế</label>
                  <input
                    type="text"
                    value={editingPartner.ma_so_thue || ''}
                    onChange={(e) => setEditingPartner({...editingPartner, ma_so_thue: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Nhập mã số thuế"
                  />
                </div>
                
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
                  <input
                    type="text"
                    value={editingPartner.dia_chi || ''}
                    onChange={(e) => setEditingPartner({...editingPartner, dia_chi: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={editingPartner.ngung_giao_dich || false}
                    onChange={(e) => setEditingPartner({...editingPartner, ngung_giao_dich: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-800">Ngừng giao dịch</div>
                    <div className="text-sm text-gray-500">Đánh dấu không cho phép chọn đối tác này trong các giao dịch mới</div>
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
                  {isSubmitting ? 'Đang lưu...' : (editingPartner.id ? 'Lưu thay đổi' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
