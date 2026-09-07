import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Eye, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Layers, 
  Search, 
  Sparkles, 
  CheckSquare, 
  Square,
  Copy,
  ChevronDown,
  ArrowLeft,
  LayoutDashboard,
  History,
  Undo2,
  X,
  Phone,
  LayoutList,
  Table
} from 'lucide-react';
import { ParcelItem, CourierType, SenderProfile, CustomerContact, BatchRecord } from '../types';
import { COURIER_CONFIGS, exportToExcel } from '../utils/excelExporter';

interface ScanResultViewProps {
  items: ParcelItem[];
  scannedImageUrl?: string | null;
  sender: SenderProfile;
  customers: CustomerContact[];
  batches?: BatchRecord[];
  activeBatchId?: string | null;
  activeBatchTitle?: string;
  onUpdateItems: (items: ParcelItem[]) => void;
  onEditItem: (item: ParcelItem) => void;
  onOpenBulkModal: (selectedCount: number) => void;
  onOpenExcelPreview: (courier: CourierType) => void;
  onReScan: () => void;
  onAddNewRow: () => void;
  onBackToList: () => void;
  onNavigateTab?: (tab: 'dashboard' | 'scan' | 'result' | 'history') => void;
  onSelectBatch?: (batch: BatchRecord) => void;
  onUpdateBatchCourier?: (batchId: string, courier: CourierType) => void;
}

export const ScanResultView: React.FC<ScanResultViewProps> = ({
  items,
  scannedImageUrl,
  sender,
  customers,
  batches = [],
  activeBatchId,
  activeBatchTitle,
  onUpdateItems,
  onEditItem,
  onOpenBulkModal,
  onOpenExcelPreview,
  onReScan,
  onAddNewRow,
  onBackToList,
  onNavigateTab,
  onSelectBatch,
  onUpdateBatchCourier,
}) => {
  const currentBatch = batches.find((b) => b.id === activeBatchId);
  const [selectedCourier, setSelectedCourier] = useState<CourierType>(
    currentBatch?.courier || sender.defaultCourier || 'cj'
  );
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'NEEDS_REVIEW' | 'ERROR'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [mobileViewMode, setMobileViewMode] = useState<'card' | 'table'>('card');
  const [deleteToast, setDeleteToast] = useState<{ message: string; backup: ParcelItem[] } | null>(null);
  const [isResolvingPostcodes, setIsResolvingPostcodes] = useState(false);

  // Sync courier when active batch or sender changes
  useEffect(() => {
    if (currentBatch?.courier) {
      setSelectedCourier(currentBatch.courier);
    } else if (sender.defaultCourier) {
      setSelectedCourier(sender.defaultCourier);
    }
  }, [activeBatchId, currentBatch?.courier, sender.defaultCourier]);

  // Auto dismiss delete toast after 6 seconds
  useEffect(() => {
    if (!deleteToast) return;
    const timer = setTimeout(() => {
      setDeleteToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [deleteToast]);

  // Batch resolve official Korean postcodes for all or missing addresses
  const handleBatchResolvePostcodes = async () => {
    const validAddresses = items.map((i) => i.address).filter((a) => a && a.trim().length > 0);
    if (validAddresses.length === 0) {
      alert('조회할 주소가 없습니다.');
      return;
    }

    setIsResolvingPostcodes(true);
    try {
      const res = await fetch('/api/resolve-postcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: validAddresses }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          const map = new Map<string, string>();
          data.results.forEach((r: any) => {
            if (r.query && r.zipCode) {
              map.set(r.query, r.zipCode);
            }
          });

          let updatedCount = 0;
          const newItems = items.map((item) => {
            const matchedZip = map.get(item.address);
            if (matchedZip && matchedZip !== item.zipCode) {
              updatedCount++;
              return {
                ...item,
                zipCode: matchedZip,
                validationNotes: `공식 우편번호(${matchedZip}) 정제 완료`,
              };
            }
            return item;
          });

          onUpdateItems(newItems);
          setDeleteToast({
            message: `${updatedCount > 0 ? updatedCount : items.length}건의 우편번호가 도로명주소 공식 DB와 100% 일치하도록 정제되었습니다.`,
            backup: items,
          });
        }
      }
    } catch (err) {
      console.error('Batch postcode resolve error:', err);
    } finally {
      setIsResolvingPostcodes(false);
    }
  };

  // Statistics
  const validCount = items.filter((i) => i.status === 'VALID').length;
  const reviewCount = items.filter((i) => i.status === 'NEEDS_REVIEW').length;
  const errorCount = items.filter((i) => i.status === 'ERROR').length;
  const totalBoxes = items.reduce((acc, cur) => acc + (cur.quantity || 1), 0);

  const selectedItems = items.filter((i) => i.selected);
  const isAllSelected = items.length > 0 && selectedItems.length === items.length;

  // Unify and standardize validation notes for visual consistency
  const normalizeValidationNote = (status?: string, note?: string) => {
    if (status === 'VALID') {
      if (!note || note.includes('확인됨') || note.includes('매칭') || note.includes('정상')) {
        return '주소 및 연락처 정상 확인됨';
      }
      return note;
    }
    return note || '';
  };

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchKeyword.trim() !== '') {
      const q = searchKeyword.toLowerCase();
      const matchName = item.recipientName.toLowerCase().includes(q);
      const matchPhone = item.phone.includes(q);
      const matchAddress = item.address.toLowerCase().includes(q) || item.detailAddress.toLowerCase().includes(q);
      const matchItem = item.itemName.toLowerCase().includes(q);
      return matchName || matchPhone || matchAddress || matchItem;
    }
    return true;
  });

  // Select/Deselect handlers
  const handleToggleSelectAll = () => {
    const nextVal = !isAllSelected;
    onUpdateItems(items.map((i) => ({ ...i, selected: nextVal })));
  };

  const handleToggleSelectItem = (id: string) => {
    onUpdateItems(
      items.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  };

  const handleDeleteItem = (id: string, name?: string) => {
    const currentBackup = [...items];
    const targetName = name || items.find((i) => i.id === id)?.recipientName || '배송지';
    const nextItems = items.filter((i) => i.id !== id);
    onUpdateItems(nextItems);
    setDeleteToast({
      message: `'${targetName}' 항목이 삭제되었습니다.`,
      backup: currentBackup,
    });
  };

  const handleDeleteSelected = () => {
    const count = selectedItems.length;
    if (count === 0) return;
    const currentBackup = [...items];
    const nextItems = items.filter((i) => !i.selected);
    onUpdateItems(nextItems);
    setDeleteToast({
      message: `선택한 ${count}건의 배송지 항목이 삭제되었습니다.`,
      backup: currentBackup,
    });
  };

  const handleUndoDelete = () => {
    if (deleteToast?.backup) {
      onUpdateItems(deleteToast.backup);
      setDeleteToast(null);
    }
  };

  const handleDuplicateItem = (item: ParcelItem) => {
    const newItem: ParcelItem = {
      ...item,
      id: `copy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cellNumber: items.length + 1,
      selected: false,
    };
    onUpdateItems([...items, newItem]);
  };

  const handleQuickDownload = () => {
    exportToExcel(items, selectedCourier, sender);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto py-2">
      {/* 1. Navigation Breadcrumb & Batch Switcher Bar */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Prominent Back to List & Breadcrumbs */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-back-to-batch-list"
            onClick={onBackToList}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs transition-all border border-slate-200/80 active:scale-95 shadow-2xs shrink-0 cursor-pointer"
            title="접수 이력 보관함 목록으로 돌아갑니다"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">접수 목록으로 돌아가기</span>
            <span className="sm:hidden">접수 목록</span>
          </button>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <button 
              onClick={() => onNavigateTab?.('dashboard')} 
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <LayoutDashboard className="w-3 h-3 text-slate-400" />
              <span>대시보드</span>
            </button>
            <span className="text-slate-300">›</span>
            <button 
              onClick={onBackToList} 
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <History className="w-3 h-3 text-slate-400" />
              <span>접수 이력 목록</span>
            </button>
            <span className="text-slate-300">›</span>
            <span className="font-bold text-slate-900 truncate max-w-[220px]">
              {activeBatchTitle || '현재 인식 결과'}
            </span>
          </nav>
        </div>

        {/* Right: Switch between different scanned batches */}
        {batches.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium hidden md:inline">다른 접수 회차:</span>
            <div className="relative">
              <select
                id="select-active-batch"
                value={activeBatchId || ''}
                onChange={(e) => {
                  const target = batches.find(b => b.id === e.target.value);
                  if (target && onSelectBatch) {
                    onSelectBatch(target);
                  }
                }}
                className="appearance-none pl-2.5 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs max-w-[150px] sm:max-w-none truncate"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.itemCount}건)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Top Header & Overview bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight break-keep">
                {activeBatchTitle ? `${activeBatchTitle} - 상세 확인` : '인식 결과 확인 및 수정'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                총 {items.length}건 ({totalBoxes}박스)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 break-keep">
              AI가 추출한 데이터를 확인하고, 필요한 경우 주소 검색이나 대량 일괄 적용을 진행하세요.
            </p>
          </div>

          {/* Quick Actions & Excel Download */}
          <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-2 sm:gap-2.5">
            {/* Row 1 on mobile: Courier Select + Auto Postcode */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Courier Selector */}
              <div className="relative flex-1 sm:flex-none">
                <select
                  id="select-courier"
                  value={selectedCourier}
                  onChange={(e) => {
                    const newCourier = e.target.value as CourierType;
                    setSelectedCourier(newCourier);
                    if (activeBatchId && onUpdateBatchCourier) {
                      onUpdateBatchCourier(activeBatchId, newCourier);
                    }
                  }}
                  className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                >
                  {Object.values(COURIER_CONFIGS).map((cfg) => (
                    <option key={cfg.id} value={cfg.id}>
                      {cfg.name} 양식
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Postal Code Auto-Refine Button */}
              <button
                id="btn-batch-resolve-postcodes"
                onClick={handleBatchResolvePostcodes}
                disabled={isResolvingPostcodes}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                title="도로명주소 공식 DB와 연동하여 모든 행의 5자리 우편번호를 정확히 검증/정제합니다"
              >
                <Sparkles className={`w-3.5 h-3.5 text-blue-600 ${isResolvingPostcodes ? 'animate-spin' : ''}`} />
                <span>{isResolvingPostcodes ? '정제 중...' : '우편번호 자동정제'}</span>
              </button>
            </div>

            {/* Row 2 on mobile: Preview + Download Excel + ReScan */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Excel Preview Button */}
              <button
                id="btn-open-excel-preview"
                onClick={() => onOpenExcelPreview(selectedCourier)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                <span>미리보기</span>
              </button>

              {/* Excel Direct Download Button */}
              <button
                id="btn-quick-download-excel"
                onClick={handleQuickDownload}
                className="flex-2 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>엑셀 다운로드 (.xlsx)</span>
              </button>

              {/* Re-Scan Button */}
              <button
                onClick={onReScan}
                className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors shrink-0 cursor-pointer"
                title="다른 사진 다시 인식"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Status Counter row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Status Badges Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체 {items.length}건
            </button>

            <button
              onClick={() => setStatusFilter('VALID')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === 'VALID'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>정상 {validCount}건</span>
            </button>

            <button
              onClick={() => setStatusFilter('NEEDS_REVIEW')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === 'NEEDS_REVIEW'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>수정필요 {reviewCount}건</span>
            </button>

            {errorCount > 0 && (
              <button
                onClick={() => setStatusFilter('ERROR')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === 'ERROR'
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>오류 {errorCount}건</span>
              </button>
            )}
          </div>

          {/* Search and Secondary Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="이름, 연락처, 주소 검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            {/* Add New Row */}
            <button
              id="btn-add-row"
              onClick={onAddNewRow}
              className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 transition-colors shrink-0 border border-blue-200 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>행 추가</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Full-Width Table for Maximum Usability) */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Action Sub-header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900 cursor-pointer select-none"
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>전체 선택 ({selectedItems.length}/{items.length})</span>
              </button>

              {/* View Mode Switcher (Card vs Table) */}
              <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setMobileViewMode('card')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    mobileViewMode === 'card'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="카드형 목록 보기 (모바일 가독성 최적화)"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>카드 뷰</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileViewMode('table')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    mobileViewMode === 'table'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="표 테이블 전체 보기"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>표 뷰</span>
                </button>
              </div>
            </div>

            {/* Bulk Edit Actions when items selected */}
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  id="btn-open-bulk-modal"
                  onClick={() => onOpenBulkModal(selectedItems.length)}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>선택 {selectedItems.length}건 일괄 수정</span>
                </button>

                <button
                  onClick={handleDeleteSelected}
                  className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>삭제</span>
                </button>
              </div>
            )}
          </div>

          {/* Table or Card List */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              조건에 일치하는 배송지 항목이 없습니다.
            </div>
          ) : (
            <>
              {/* 1. Mobile & Touch Optimized Card View */}
              {mobileViewMode === 'card' && (
                <div className="divide-y divide-slate-100 bg-slate-50/30">
                  {filteredItems.map((item, index) => {
                    const isSelected = !!item.selected;
                    const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 sm:p-4 bg-white hover:bg-blue-50/20 transition-all ${
                          isSelected ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        {/* Top: Selection, Index, Status Badge, and Row Actions */}
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectItem(item.id)}
                              className="cursor-pointer p-0.5"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                            </button>
                            <span className="font-mono font-bold text-slate-400 text-[11px]">
                              #{item.cellNumber || index + 1}
                            </span>
                            {/* Status Badge */}
                            {item.status === 'VALID' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                정상
                              </span>
                            ) : item.status === 'NEEDS_REVIEW' ? (
                              <button
                                type="button"
                                onClick={() => onEditItem(item)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                              >
                                <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                                수정필요
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onEditItem(item)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                              >
                                <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                                오류
                              </button>
                            )}
                          </div>

                          {/* Quick Actions (Edit, Copy, Delete) - Fixed at top right for 100% position consistency */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onEditItem(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100/80 rounded-lg transition-colors cursor-pointer"
                              title="수정"
                              aria-label="수정"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateItem(item)}
                              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="복사"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id, item.recipientName)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Middle: Recipient & Phone */}
                        <div className="pt-2.5 pb-2 flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base font-extrabold text-slate-900">
                                {item.recipientName || '(받는분 이름 없음)'}
                              </span>
                              {item.senderName && item.senderName !== sender.name && (
                                <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                  발송: {item.senderName}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Phone: Single line badge with direct click-to-call */}
                          {item.phone ? (
                            <a
                              href={`tel:${cleanPhone}`}
                              className="inline-flex items-center gap-1.5 font-mono font-bold text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl border border-blue-200/80 transition-colors whitespace-nowrap shrink-0 active:scale-95 shadow-2xs"
                              title="전화 걸기"
                            >
                              <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{item.phone}</span>
                            </a>
                          ) : (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 whitespace-nowrap shrink-0">
                              연락처 없음
                            </span>
                          )}
                        </div>

                        {/* Address Box */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-xs space-y-1 my-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-800 leading-snug">
                              {item.address || '(주소 미입력)'}
                            </span>
                            {item.zipCode ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                                <span className="text-[9px] text-blue-500 font-sans">우편</span>
                                <span>{item.zipCode}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/70 shrink-0 whitespace-nowrap">
                                우편번호 필요
                              </span>
                            )}
                          </div>
                          {item.detailAddress && (
                            <div className="text-slate-600 font-medium text-[11px]">
                              {item.detailAddress}
                            </div>
                          )}
                          {item.validationNotes && (
                            <div className="text-[10px] text-slate-500 pt-0.5">
                              {normalizeValidationNote(item.status, item.validationNotes)}
                            </div>
                          )}
                        </div>

                        {/* Item Info, Quantity & Memo */}
                        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                            {item.itemName || sender.defaultItem || '기본 상품'}
                          </span>
                          <span className="font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                            {item.quantity || 1}박스
                          </span>
                          {item.memo && (
                            <span className="text-slate-500 text-[11px] truncate max-w-[220px]">
                              💬 {item.memo}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. Full Table View */}
              {mobileViewMode === 'table' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="w-14 px-2 py-3 text-center whitespace-nowrap">선택</th>
                        <th className="w-12 px-2 py-3 text-center whitespace-nowrap">No</th>
                        <th className="w-20 px-3 py-3 text-center whitespace-nowrap">상태</th>
                        <th className="px-3 py-3 font-bold text-slate-800 whitespace-nowrap">받는분</th>
                        <th className="px-3 py-3 whitespace-nowrap">연락처</th>
                        <th className="px-3 py-3 whitespace-nowrap min-w-[220px]">주소(도로명) / 상세주소</th>
                        <th className="w-24 px-3 py-3 font-bold text-blue-900 whitespace-nowrap">상품명</th>
                        <th className="w-14 px-2 py-3 text-center whitespace-nowrap">수량</th>
                        <th className="px-3 py-3 whitespace-nowrap">배송메모</th>
                        <th className="w-20 px-3 py-3 text-right whitespace-nowrap">수정/관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredItems.map((item, index) => {
                        const isSelected = !!item.selected;
                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-blue-50/40 transition-colors group ${
                              isSelected ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleToggleSelectItem(item.id)}
                                className="text-slate-400 hover:text-blue-600 cursor-pointer"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>

                            {/* No / Cell # */}
                            <td className="px-2 py-3 text-center font-bold text-slate-400">
                              {item.cellNumber || index + 1}
                            </td>

                            {/* Status Badge */}
                            <td className="px-3 py-3 text-center">
                              {item.status === 'VALID' ? (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap"
                                  title={item.validationNotes || '정상 데이터'}
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  정상
                                </span>
                              ) : item.status === 'NEEDS_REVIEW' ? (
                                <button
                                  type="button"
                                  onClick={() => onEditItem(item)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors whitespace-nowrap cursor-pointer"
                                  title={item.validationNotes || '수정 필요'}
                                >
                                  <AlertCircle className="w-3 h-3 text-amber-500" />
                                  수정필요
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onEditItem(item)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors whitespace-nowrap cursor-pointer"
                                  title={item.validationNotes || '오류'}
                                >
                                  <AlertCircle className="w-3 h-3 text-red-500" />
                                  오류
                                </button>
                              )}
                            </td>

                            {/* Recipient Name */}
                            <td className="px-3 py-3">
                              <div className="font-extrabold text-slate-900 text-xs whitespace-nowrap">
                                {item.recipientName || '(이름 없음)'}
                              </div>
                              {item.senderName && item.senderName !== sender.name && (
                                <div className="text-[10px] text-blue-600 font-medium whitespace-nowrap mt-0.5">
                                  발송: {item.senderName}
                                </div>
                              )}
                            </td>

                            {/* Phone: guaranteed single line */}
                            <td className="px-3 py-3 font-mono text-slate-700 whitespace-nowrap font-medium">
                              {item.phone || '-'}
                            </td>

                            {/* Address */}
                            <td className="px-3 py-3">
                              <div className="font-semibold text-slate-800">
                                {item.address}
                              </div>
                              {item.detailAddress && (
                                <div className="text-[11px] text-slate-500">
                                  {item.detailAddress}
                                </div>
                              )}
                              {item.zipCode ? (
                                <div className="mt-1">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                    <span className="text-[9px] text-blue-500 font-sans font-normal">우편</span>
                                    <span>{item.zipCode}</span>
                                  </span>
                                </div>
                              ) : (
                                <div className="mt-1">
                                  <span className="inline-flex items-center text-[10px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded border border-amber-200/60">
                                    우편번호 미입력
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Item Name */}
                            <td className="px-3 py-3 font-bold text-blue-700 whitespace-nowrap">
                              {item.itemName || sender.defaultItem || '기본 상품'}
                            </td>

                            {/* Quantity */}
                            <td className="px-2 py-3 text-center whitespace-nowrap">
                              <span className="inline-block font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                                {item.quantity || 1}
                              </span>
                            </td>

                            {/* Memo */}
                            <td className="px-3 py-3 text-slate-500 text-[11px] max-w-[140px] truncate">
                              {item.memo || '-'}
                            </td>

                            {/* Actions */}
                            <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="inline-flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditItem(item);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-100/80 rounded-lg transition-colors cursor-pointer"
                                  title="수정"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateItem(item);
                                  }}
                                  className="p-1.5 text-slate-500 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
                                  title="복사"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  id={`btn-delete-item-${item.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(item.id, item.recipientName);
                                  }}
                                  className="p-1.5 text-red-500 hover:bg-red-100/90 rounded-lg transition-colors cursor-pointer"
                                  title="삭제"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
          </div>

          {/* Bottom Navigation & Action Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
            {/* Left Navigation Buttons: 2 columns on mobile */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                id="btn-bottom-back-list"
                onClick={onBackToList}
                className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200 shadow-2xs whitespace-nowrap cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600 shrink-0" />
                <span>접수 목록으로</span>
              </button>
              <button
                onClick={() => onNavigateTab?.('dashboard')}
                className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200/80 whitespace-nowrap cursor-pointer active:scale-95"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>대시보드로</span>
              </button>
            </div>
            
            {/* Right Action Buttons: 2 columns on mobile */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                onClick={onReScan}
                className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-blue-200/80 whitespace-nowrap active:scale-95"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>새 사진 촬영</span>
              </button>
              <button
                onClick={handleQuickDownload}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>엑셀 다운로드</span>
              </button>
            </div>
          </div>
        </div>

      {/* Floating Undo Delete Toast */}
      {deleteToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3.5 max-w-md">
            <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-xs text-slate-200 font-medium">{deleteToast.message}</span>
            <button
              type="button"
              onClick={handleUndoDelete}
              className="ml-auto px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 font-bold text-xs flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>실행 취소</span>
            </button>
            <button
              type="button"
              onClick={() => setDeleteToast(null)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-md transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
