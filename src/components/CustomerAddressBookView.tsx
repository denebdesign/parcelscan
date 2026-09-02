import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  Phone, 
  MapPin, 
  Package, 
  Clock, 
  Check, 
  X,
  UserPlus,
  Save,
  Building
} from 'lucide-react';
import { CustomerContact } from '../types';

interface CustomerAddressBookViewProps {
  customers: CustomerContact[];
  onAddCustomer: (customer: CustomerContact) => void;
  onUpdateCustomer: (customer: CustomerContact) => void;
  onDeleteCustomer: (id: string) => void;
}

export const CustomerAddressBookView: React.FC<CustomerAddressBookViewProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerContact | null>(null);

  // New customer form state
  const [newCust, setNewCust] = useState<Partial<CustomerContact>>({
    name: '',
    phone: '',
    address: '',
    detailAddress: '',
    zipCode: '',
    defaultItem: '',
    memo: '',
  });

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.defaultItem && c.defaultItem.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.phone || !newCust.address) {
      alert('성명, 연락처, 주소는 필수 입력 항목입니다.');
      return;
    }
    const customer: CustomerContact = {
      id: `cust-${Date.now()}`,
      name: newCust.name.trim(),
      phone: newCust.phone.trim(),
      address: newCust.address.trim(),
      detailAddress: newCust.detailAddress?.trim() || '',
      zipCode: newCust.zipCode?.trim() || '63047',
      defaultItem: newCust.defaultItem?.trim() || '',
      memo: newCust.memo?.trim() || '',
      orderCount: 1,
      lastOrderedAt: new Date().toISOString().slice(0, 10),
    };
    onAddCustomer(customer);
    setIsAdding(false);
    setNewCust({
      name: '',
      phone: '',
      address: '',
      detailAddress: '',
      zipCode: '',
      defaultItem: '',
      memo: '',
    });
  };

  const handleStartEdit = (cust: CustomerContact) => {
    setEditingCustomer({ ...cust });
    setIsAdding(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!editingCustomer.name || !editingCustomer.phone || !editingCustomer.address) {
      alert('성명, 연락처, 주소는 필수 입력 항목입니다.');
      return;
    }
    onUpdateCustomer(editingCustomer);
    setEditingCustomer(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shadow-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">단골 주소록 관리</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              총 {customers.length}명
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            자주 주문하는 단골 고객의 주소 및 선호 상품을 등록·수정해두면, 사진 인식 시 자동으로 매칭되어 주소 오류가 방지됩니다.
          </p>
        </div>

        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingCustomer(null);
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ 신규 고객 등록</span>
        </button>
      </div>

      {/* Add New Customer Panel */}
      {isAdding && (
        <form onSubmit={handleCreateCustomer} className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between font-bold text-indigo-900 text-sm">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>신규 단골 고객 등록</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">고객명 (성명) *</label>
              <input
                type="text"
                required
                value={newCust.name}
                onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                placeholder="예: 홍길동"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">연락처 *</label>
              <input
                type="text"
                required
                value={newCust.phone}
                onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                placeholder="010-0000-0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">자주 주문하는 상품명</label>
              <input
                type="text"
                value={newCust.defaultItem}
                onChange={(e) => setNewCust({ ...newCust, defaultItem: e.target.value })}
                placeholder="예: 제주 햇감자 10kg"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">기본 도로명 주소 *</label>
              <input
                type="text"
                required
                value={newCust.address}
                onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                placeholder="예: 제주시 구좌읍 세화로 123"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">상세주소 (동·호수)</label>
              <input
                type="text"
                value={newCust.detailAddress}
                onChange={(e) => setNewCust({ ...newCust, detailAddress: e.target.value })}
                placeholder="101동 101호"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">우편번호</label>
              <input
                type="text"
                value={newCust.zipCode}
                onChange={(e) => setNewCust({ ...newCust, zipCode: e.target.value })}
                placeholder="63047"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">특이사항 / 단골 메모</label>
            <input
              type="text"
              value={newCust.memo}
              onChange={(e) => setNewCust({ ...newCust, memo: e.target.value })}
              placeholder="예: 부재 시 경비실 보관, 현관문 비번 등"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
            >
              등록하기
            </button>
          </div>
        </form>
      )}

      {/* Edit Customer Panel */}
      {editingCustomer && (
        <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl border-2 border-indigo-500 p-5 shadow-md space-y-4 text-xs">
          <div className="flex items-center justify-between font-bold text-indigo-900 text-sm">
            <div className="flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-indigo-600" />
              <span>단골 고객 정보 수정: <span className="text-slate-900">{editingCustomer.name}</span></span>
            </div>
            <button
              type="button"
              onClick={() => setEditingCustomer(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">고객명 (성명) *</label>
              <input
                type="text"
                required
                value={editingCustomer.name}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">연락처 *</label>
              <input
                type="text"
                required
                value={editingCustomer.phone}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">자주 주문하는 상품명</label>
              <input
                type="text"
                value={editingCustomer.defaultItem || ''}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, defaultItem: e.target.value })}
                placeholder="예: 제주 햇감자 10kg"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">기본 도로명 주소 *</label>
              <input
                type="text"
                required
                value={editingCustomer.address}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">상세주소 (동·호수)</label>
              <input
                type="text"
                value={editingCustomer.detailAddress || ''}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, detailAddress: e.target.value })}
                placeholder="101동 101호"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">우편번호</label>
              <input
                type="text"
                value={editingCustomer.zipCode || ''}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, zipCode: e.target.value })}
                placeholder="63047"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">특이사항 / 단골 메모</label>
              <input
                type="text"
                value={editingCustomer.memo || ''}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, memo: e.target.value })}
                placeholder="예: 부재 시 경비실 보관 등"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">누적 주문 횟수</label>
              <input
                type="number"
                min="1"
                value={editingCustomer.orderCount || 1}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, orderCount: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingCustomer(null)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              수정사항 저장
            </button>
          </div>
        </form>
      )}

      {/* Customer List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="고객명, 전화번호, 주소, 선호상품 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            검색 결과 <span className="font-bold text-slate-800">{filtered.length}</span>건 / 총 {customers.length}건
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">고객명</th>
                <th className="px-4 py-3">연락처</th>
                <th className="px-4 py-3">배송지 주소</th>
                <th className="px-4 py-3">자주 찾는 상품</th>
                <th className="px-4 py-3 text-center">주문 횟수</th>
                <th className="px-4 py-3 text-center">최근 주문일</th>
                <th className="px-5 py-3 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    등록된 고객이 없거나 검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((cust) => {
                  const isBeingEdited = editingCustomer?.id === cust.id;
                  return (
                    <tr 
                      key={cust.id} 
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isBeingEdited ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {cust.name}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {cust.phone}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="text-slate-800 font-medium truncate">{cust.address}</div>
                        {cust.detailAddress && (
                          <div className="text-slate-500 text-[11px] truncate">{cust.detailAddress}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-indigo-700 font-semibold">
                        {cust.defaultItem || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700">
                          {cust.orderCount || 1}회
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-500 font-mono">
                        {cust.lastOrderedAt || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(cust)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
                            title="고객 정보 편집/수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteCustomer(cust.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 hover:border-red-200"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
