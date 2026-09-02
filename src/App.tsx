import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { 
  ParcelItem, 
  BatchRecord, 
  CustomerContact, 
  SenderProfile, 
  CourierType 
} from './types';
import { 
  DEFAULT_SENDER, 
  INITIAL_CUSTOMERS, 
  SAMPLE_SCANNED_ITEMS,
  generateSampleA4ImageDataUrl 
} from './data/sampleTemplates';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { ScanUploadView } from './components/ScanUploadView';
import { ScanResultView } from './components/ScanResultView';
import { BatchHistoryView } from './components/BatchHistoryView';
import { EditItemModal } from './components/EditItemModal';
import { BulkApplyModal } from './components/BulkApplyModal';
import { ExcelPreviewModal } from './components/ExcelPreviewModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { MobileCameraCapture } from './components/MobileCameraCapture';
import { AdBanner } from './components/AdBanner';
import { NaverShoppingBanner } from './components/NaverShoppingBanner';
import { Footer } from './components/Footer';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsOfServiceModal } from './components/TermsOfServiceModal';
import { ContactModal } from './components/ContactModal';
import { exportToExcel } from './utils/excelExporter';

export default function App() {
  // Check for Mobile Camera Sync URL (?sync=SESSION_ID or ?mobileSync=SESSION_ID)
  const [mobileSyncSessionId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('sync') || params.get('mobileSync');
    }
    return null;
  });

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('parcelscan_logged_in');
    return saved !== null ? saved === 'true' : true;
  });

  const [userProfile, setUserProfile] = useState<{ name: string; email: string; businessName?: string }>(() => {
    const saved = localStorage.getItem('parcelscan_user_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: '평대취급소',
      email: '0192449625@naver.com',
      businessName: '평대취급소',
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Navigation (for logged in state: dashboard, scan, result, history)
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'scan' | 'result' | 'history'>('dashboard');

  // Persistence States
  const [sender, setSender] = useState<SenderProfile>(() => {
    const saved = localStorage.getItem('parcelscan_sender');
    if (saved) return JSON.parse(saved);
    return {
      name: '평대취급소',
      phone: '010-6663-9996',
      tel: '064-782-0001',
      address: '제주특별자치도 제주시 구좌읍 평대리',
      detailAddress: '평대취급소',
      zipCode: '63359',
      defaultItem: '제주 특산물/농산물',
      defaultCourier: 'cj',
      defaultMemo: '파손주의 / 안전배송 부탁드립니다',
    };
  });

  const [customers, setCustomers] = useState<CustomerContact[]>(() => {
    const saved = localStorage.getItem('parcelscan_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [batches, setBatches] = useState<BatchRecord[]>(() => {
    const saved = localStorage.getItem('parcelscan_batches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn('Failed to load saved batches:', e);
      }
    }
    return [
      {
        id: 'batch-initial-1',
        title: '2026-08-28 오후 접수 (주소 용지 4건)',
        createdAt: '2026-08-28 14:32',
        itemCount: 4,
        boxCount: 6,
        warningCount: 0,
        errorCount: 0,
        status: 'completed',
        courier: 'cj',
        items: SAMPLE_SCANNED_ITEMS.slice(0, 4),
        imageUrl: generateSampleA4ImageDataUrl(DEFAULT_SENDER),
      },
    ];
  });

  // Current Working Scanned Items - dynamically initialized from the latest batch
  const [currentItems, setCurrentItems] = useState<ParcelItem[]>(() => {
    const saved = localStorage.getItem('parcelscan_batches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0].items)) {
          return parsed[0].items;
        }
      } catch (e) {}
    }
    return SAMPLE_SCANNED_ITEMS.slice(0, 4);
  });

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(() => {
    const saved = localStorage.getItem('parcelscan_batches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].imageUrl) {
          return parsed[0].imageUrl;
        }
      } catch (e) {}
    }
    return generateSampleA4ImageDataUrl(sender);
  });

  const [activeBatchId, setActiveBatchId] = useState<string | null>(() => {
    const saved = localStorage.getItem('parcelscan_batches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].id;
        }
      } catch (e) {}
    }
    return 'batch-initial-1';
  });

  // Modals & Active Edit States
  const [editingItem, setEditingItem] = useState<ParcelItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedBulkCount, setSelectedBulkCount] = useState(0);
  const [isExcelPreviewOpen, setIsExcelPreviewOpen] = useState(false);
  const [previewCourier, setPreviewCourier] = useState<CourierType>('cj');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState('');
  const [scanError, setScanError] = useState<{ message: string; lastImage?: { base64: string; mime: string } } | null>(null);

  // Save to localStorage safely when state changes
  useEffect(() => {
    try {
      localStorage.setItem('parcelscan_logged_in', String(isLoggedIn));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    try {
      localStorage.setItem('parcelscan_user_profile', JSON.stringify(userProfile));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('parcelscan_sender', JSON.stringify(sender));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [sender]);

  useEffect(() => {
    try {
      localStorage.setItem('parcelscan_customers', JSON.stringify(customers));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      // Strip heavy image data to avoid browser QuotaExceededError
      const safeBatches = batches.map((b) => {
        if (b.imageUrl && b.imageUrl.length > 50000) {
          return { ...b, imageUrl: undefined };
        }
        return b;
      });
      localStorage.setItem('parcelscan_batches', JSON.stringify(safeBatches));
    } catch (e) {
      console.warn('LocalStorage save batches failed (QuotaExceeded):', e);
    }
  }, [batches]);

  // Auth Handlers
  const handleLoginSuccess = (info: { name: string; email: string; businessName?: string; isNewSignup?: boolean }) => {
    setUserProfile({
      name: info.name,
      email: info.email,
      businessName: info.businessName,
    });
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);

    if (info.email === 'test1@gmail.com') {
      // Demo 1: 제주바람농원
      setSender(DEFAULT_SENDER);
      setCustomers(INITIAL_CUSTOMERS);
      setBatches([
        {
          id: 'batch-initial-1',
          title: '2026-08-28 오후 접수 (주소 용지 6건)',
          createdAt: '2026-08-28 14:32',
          itemCount: 6,
          boxCount: 9,
          warningCount: 1,
          errorCount: 0,
          status: 'completed',
          courier: 'cj',
          items: SAMPLE_SCANNED_ITEMS,
          imageUrl: generateSampleA4ImageDataUrl(DEFAULT_SENDER),
        },
      ]);
      setCurrentItems(SAMPLE_SCANNED_ITEMS);
      setCurrentImageUrl(generateSampleA4ImageDataUrl(DEFAULT_SENDER));
      setActiveBatchId('batch-initial-1');
      setCurrentTab('dashboard');
      return;
    }

    if (info.email === 'test2@gmail.com') {
      // Demo 2: 온라인마켓 굿즈랩
      const goodsSender: SenderProfile = {
        name: '온라인마켓 굿즈랩 (이과장)',
        phone: '010-8888-7777',
        tel: '02-555-1234',
        address: '서울특별시 성동구 성수이로 88',
        detailAddress: '아트타워 4층 402호',
        zipCode: '04782',
        defaultItem: '핸드메이드 굿즈 세트',
        defaultCourier: 'lotte',
        defaultMemo: '부재 시 경비실 보관 부탁드립니다',
      };
      setSender(goodsSender);
      setCustomers(INITIAL_CUSTOMERS);
      setBatches([
        {
          id: 'batch-goods-1',
          title: '성수 팝업스토어 굿즈 배송건 (4건)',
          createdAt: '2026-08-30 11:15',
          itemCount: 4,
          boxCount: 5,
          warningCount: 0,
          errorCount: 0,
          status: 'completed',
          courier: 'lotte',
          items: SAMPLE_SCANNED_ITEMS.slice(0, 4),
          imageUrl: generateSampleA4ImageDataUrl(goodsSender),
        },
      ]);
      setCurrentItems(SAMPLE_SCANNED_ITEMS.slice(0, 4));
      setCurrentImageUrl(generateSampleA4ImageDataUrl(goodsSender));
      setActiveBatchId('batch-goods-1');
      setCurrentTab('dashboard');
      return;
    }

    if (info.isNewSignup) {
      // Clean workspace for fresh user registration (0 items, 0 batches, custom store name)
      const freshSender: SenderProfile = {
        name: info.businessName || info.name || (info.email === '0192449625@naver.com' ? '평대취급소' : '내 사업장/이름'),
        phone: info.email === '0192449625@naver.com' ? '010-6663-9996' : '',
        tel: '',
        address: info.email === '0192449625@naver.com' ? '제주특별자치도 제주시 구좌읍 평대리' : '',
        detailAddress: info.email === '0192449625@naver.com' ? '평대취급소' : '',
        zipCode: info.email === '0192449625@naver.com' ? '63359' : '',
        defaultItem: '상품/농산물',
        defaultCourier: 'cj',
        defaultMemo: '파손주의 / 안전배송 부탁드립니다',
      };
      setSender(freshSender);
      setCustomers([]);
      setBatches([]);
      setCurrentItems([]);
      setCurrentImageUrl(null);
      setActiveBatchId(null);
      setCurrentTab('dashboard');

      try {
        localStorage.setItem('parcelscan_sender', JSON.stringify(freshSender));
        localStorage.setItem('parcelscan_customers', JSON.stringify([]));
        localStorage.setItem('parcelscan_batches', JSON.stringify([]));
      } catch (e) {
        console.warn('LocalStorage reset error:', e);
      }
    } else {
      // Returning login (e.g. 0192449625@naver.com)
      if (info.businessName && info.businessName !== sender.name) {
        setSender(prev => ({ ...prev, name: info.businessName || prev.name }));
      }
      setCurrentTab('dashboard');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentTab('dashboard');
  };

  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleQuickDemoStart = () => {
    setUserProfile({
      name: '제주바람농원 (김대표)',
      email: 'test1@gmail.com',
      businessName: '제주바람농원',
    });
    setSender(DEFAULT_SENDER);
    setCustomers(INITIAL_CUSTOMERS);
    setBatches([
      {
        id: 'batch-initial-1',
        title: '2026-08-28 오후 접수 (주소 용지 6건)',
        createdAt: '2026-08-28 14:32',
        itemCount: 6,
        boxCount: 9,
        warningCount: 1,
        errorCount: 0,
        status: 'completed',
        courier: 'cj',
        items: SAMPLE_SCANNED_ITEMS,
        imageUrl: generateSampleA4ImageDataUrl(DEFAULT_SENDER),
      },
    ]);
    setCurrentItems(SAMPLE_SCANNED_ITEMS);
    setCurrentImageUrl(generateSampleA4ImageDataUrl(DEFAULT_SENDER));
    setActiveBatchId('batch-initial-1');
    setIsLoggedIn(true);
    setCurrentTab('dashboard');
  };

  // Today Statistics - computed directly from batches to prevent double counting or stale resets
  const allBatchItems = batches.flatMap((b) => b.items || []);
  const todayStats = {
    totalItems: batches.reduce((acc, b) => acc + (b.items ? b.items.length : (b.itemCount || 0)), 0),
    totalBoxes: batches.reduce(
      (acc, b) =>
        acc +
        (b.items
          ? b.items.reduce((sum, i) => sum + (i.quantity || 1), 0)
          : (b.boxCount || 0)),
      0
    ),
    warningCount: allBatchItems.filter((i) => i.status === 'NEEDS_REVIEW').length,
    errorCount: allBatchItems.filter((i) => i.status === 'ERROR').length,
  };

  // Perform AI Scanning via Server Endpoint
  const handleScanImage = async (base64Data: string, mimeType: string) => {
    setIsScanning(true);
    setScanStepText('1/3 이미지 영역 및 문자 분할 중...');

    try {
      setTimeout(() => {
        setScanStepText('2/3 AI 필기체 인식 및 도로명 주소 정제 중...');
      }, 1200);

      setTimeout(() => {
        setScanStepText('3/3 전화번호 포맷팅 및 주소 검증 중...');
      }, 2400);

      const response = await fetch('/api/scan-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'AI 주소 인식 실패');
      }

      const scannedResults: ParcelItem[] = resData.data.map((raw: any, idx: number) => {
        const matchedCust = customers.find(
          (c) =>
            c.name === raw.recipientName ||
            (raw.phone && c.phone.replace(/[^0-9]/g, '') === raw.phone.replace(/[^0-9]/g, ''))
        );

        let finalStatus: 'VALID' | 'NEEDS_REVIEW' | 'ERROR' = raw.status || 'VALID';
        let notes = raw.validationNotes || '';

        if (matchedCust) {
          notes = `기존 고객(${matchedCust.name}) 주소 정보와 일치`;
        }

        return {
          id: `scan-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          cellNumber: raw.cellNumber || idx + 1,
          recipientName: raw.recipientName || '',
          phone: raw.phone || '',
          address: raw.address || '',
          detailAddress: raw.detailAddress || '',
          zipCode: raw.zipCode || '63047',
          itemName: raw.itemName || sender.defaultItem || '과일/농산물',
          quantity: typeof raw.quantity === 'number' && raw.quantity > 0 ? raw.quantity : 1,
          memo: raw.memo || '문 앞 보관',
          status: finalStatus,
          validationNotes: notes,
          selected: false,
        };
      });

      // Save as new active items
      setCurrentItems(scannedResults);
      setCurrentImageUrl(base64Data);

      // Create new batch record
      const newBatch: BatchRecord = {
        id: `batch-${Date.now()}`,
        title: `${new Date().toLocaleDateString('ko-KR')} ${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 접수 (${scannedResults.length}건)`,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        itemCount: scannedResults.length,
        boxCount: scannedResults.reduce((acc, i) => acc + (i.quantity || 1), 0),
        warningCount: scannedResults.filter((i) => i.status === 'NEEDS_REVIEW').length,
        errorCount: scannedResults.filter((i) => i.status === 'ERROR').length,
        status: 'completed',
        courier: sender.defaultCourier || 'cj',
        items: scannedResults,
        imageUrl: base64Data,
      };

      setActiveBatchId(newBatch.id);
      setBatches((prev) => [newBatch, ...prev]);
      setScanError(null);
      setCurrentTab('result');
    } catch (err: any) {
      console.error('Scan Error:', err);
      const errMsg = err?.message || '인식 중 일시적 오류가 발생했습니다.';
      setScanError({
        message: errMsg,
        lastImage: { base64: base64Data, mime: mimeType },
      });
    } finally {
      setIsScanning(false);
      setScanStepText('');
    }
  };

  // Direct load sample data
  const handleLoadSampleData = () => {
    const sampleImg = generateSampleA4ImageDataUrl(sender);
    setCurrentItems(SAMPLE_SCANNED_ITEMS);
    setCurrentImageUrl(sampleImg);
    setActiveBatchId(batches[0]?.id || null);
    setCurrentTab('result');
  };

  // Sync batch updates when items change
  const handleUpdateItems = (newItems: ParcelItem[]) => {
    setCurrentItems(newItems);
    if (activeBatchId) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === activeBatchId
            ? {
                ...b,
                items: newItems,
                itemCount: newItems.length,
                boxCount: newItems.reduce((acc, i) => acc + (i.quantity || 1), 0),
                warningCount: newItems.filter((i) => i.status === 'NEEDS_REVIEW').length,
                errorCount: newItems.filter((i) => i.status === 'ERROR').length,
              }
            : b
        )
      );
    }
  };

  // Item Edit & Updates
  const handleOpenEditItem = (item: ParcelItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedItem = (updated: ParcelItem) => {
    const nextItems = currentItems.map((item) => (item.id === updated.id ? updated : item));
    handleUpdateItems(nextItems);
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    const nextItems = currentItems.filter((i) => i.id !== itemId);
    handleUpdateItems(nextItems);
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleAddNewRow = () => {
    const newItem: ParcelItem = {
      id: `manual-${Date.now()}`,
      cellNumber: currentItems.length + 1,
      recipientName: '',
      phone: '010-',
      address: '',
      detailAddress: '',
      zipCode: '',
      itemName: sender.defaultItem || '과일/농산물',
      quantity: 1,
      memo: '문 앞 보관',
      status: 'NEEDS_REVIEW',
      validationNotes: '새로 추가된 항목 (내용 입력 필요)',
      selected: false,
    };
    const nextItems = [...currentItems, newItem];
    handleUpdateItems(nextItems);
    setEditingItem(newItem);
    setIsEditModalOpen(true);
  };

  // Bulk Apply
  const handleOpenBulkModal = (count: number) => {
    setSelectedBulkCount(count);
    setIsBulkModalOpen(true);
  };

  const handleApplyBulkData = (data: {
    itemName?: string;
    quantity?: number;
    memo?: string;
    overrideItemName: boolean;
    overrideQuantity: boolean;
    overrideMemo: boolean;
  }) => {
    const nextItems = currentItems.map((item) => {
      if (!item.selected) return item;
      return {
        ...item,
        itemName: data.overrideItemName && data.itemName !== undefined ? data.itemName : item.itemName,
        quantity: data.overrideQuantity && data.quantity !== undefined ? data.quantity : item.quantity,
        memo: data.overrideMemo && data.memo !== undefined ? data.memo : item.memo,
      };
    });
    handleUpdateItems(nextItems);
  };

  // View past batch
  const handleViewBatch = (batch: BatchRecord) => {
    setActiveBatchId(batch.id);
    setCurrentItems(batch.items);
    setCurrentImageUrl(batch.imageUrl || null);
    setCurrentTab('result');
  };

  // Update specific batch courier on the fly
  const handleUpdateBatchCourier = (batchId: string, courier: CourierType) => {
    setBatches((prev) => {
      const updated = prev.map((b) =>
        b.id === batchId ? { ...b, courier } : b
      );
      try {
        localStorage.setItem('parcelscan_batches', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Save sender settings and sync default courier to batches if changed
  const handleSaveSender = (newProfile: SenderProfile) => {
    const prevCourier = sender.defaultCourier;
    setSender(newProfile);
    try {
      localStorage.setItem('parcelscan_sender', JSON.stringify(newProfile));
    } catch (e) {
      console.warn('Failed to save sender:', e);
    }

    if (newProfile.defaultCourier && newProfile.defaultCourier !== prevCourier) {
      setBatches((prev) => {
        const updated = prev.map((b) => ({
          ...b,
          courier: newProfile.defaultCourier,
        }));
        try {
          localStorage.setItem('parcelscan_batches', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  };

  // Quick export from dashboard
  const handleQuickExportBatch = (batch: BatchRecord, courier?: CourierType) => {
    const targetCourier = courier || batch.courier || sender.defaultCourier || 'cj';
    exportToExcel(batch.items, targetCourier, sender, `${batch.title}.xlsx`);
  };

  const handleDeleteBatch = (id: string) => {
    if (confirm('해당 접수 이력을 삭제하시겠습니까?')) {
      setBatches((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // If user opens the QR mobile sync URL on smartphone
  if (mobileSyncSessionId) {
    return <MobileCameraCapture sessionId={mobileSyncSessionId} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Navigation */}
      <Navbar
        isLoggedIn={isLoggedIn}
        userProfile={userProfile}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        sender={sender}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLogin={handleOpenLogin}
        onOpenSignup={handleOpenSignup}
        onLogout={handleLogout}
        activeItemCount={todayStats.totalItems}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isLoggedIn ? (
          /* Before Login: Landing & Value View */
          <LandingView
            onOpenLogin={handleOpenLogin}
            onOpenSignup={handleOpenSignup}
            onQuickDemoStart={handleQuickDemoStart}
          />
        ) : (
          /* After Login: Application Views */
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                batches={batches}
                todayStats={todayStats}
                sender={sender}
                userProfile={userProfile}
                onStartNewScan={() => setCurrentTab('scan')}
                onOpenSampleScan={handleLoadSampleData}
                onViewBatch={handleViewBatch}
                onQuickExport={handleQuickExportBatch}
                onUpdateBatchCourier={handleUpdateBatchCourier}
              />
            )}

            {currentTab === 'scan' && (
              <ScanUploadView
                onScanImage={handleScanImage}
                onLoadSample={handleLoadSampleData}
                isScanning={isScanning}
                scanStepText={scanStepText}
                scanError={scanError}
                onClearError={() => setScanError(null)}
              />
            )}

            {currentTab === 'result' && (
              <ScanResultView
                items={currentItems}
                scannedImageUrl={currentImageUrl}
                sender={sender}
                customers={customers}
                batches={batches}
                activeBatchId={activeBatchId}
                activeBatchTitle={batches.find((b) => b.id === activeBatchId)?.title}
                onUpdateItems={handleUpdateItems}
                onEditItem={handleOpenEditItem}
                onOpenBulkModal={handleOpenBulkModal}
                onOpenExcelPreview={(c) => {
                  setPreviewCourier(c);
                  setIsExcelPreviewOpen(true);
                }}
                onReScan={() => setCurrentTab('scan')}
                onAddNewRow={handleAddNewRow}
                onBackToList={() => setCurrentTab('history')}
                onNavigateTab={(t) => setCurrentTab(t)}
                onSelectBatch={handleViewBatch}
                onUpdateBatchCourier={handleUpdateBatchCourier}
              />
            )}

            {currentTab === 'history' && (
              <BatchHistoryView
                batches={batches}
                sender={sender}
                onViewBatch={handleViewBatch}
                onDeleteBatch={handleDeleteBatch}
                onStartNewScan={() => setCurrentTab('scan')}
                onUpdateBatchCourier={handleUpdateBatchCourier}
              />
            )}
          </>
        )}

        {/* Naver Shopping Connect Supplies Banner */}
        <div className="max-w-5xl mx-auto px-4 mt-8">
          <NaverShoppingBanner />
        </div>

        {/* Google AdSense Banner Area */}
        <div className="max-w-5xl mx-auto px-4 mt-4">
          <AdBanner />
        </div>
      </main>

      {/* Comprehensive Footer with Legal & Contact Modals */}
      <Footer
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <TermsOfServiceModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <EditItemModal
        isOpen={isEditModalOpen}
        item={editingItem}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveEditedItem}
        onDelete={handleDeleteItem}
        customers={customers}
      />

      <BulkApplyModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedCount={selectedBulkCount}
        onApply={handleApplyBulkData}
        defaultItemName={sender.defaultItem}
      />

      <ExcelPreviewModal
        isOpen={isExcelPreviewOpen}
        onClose={() => setIsExcelPreviewOpen(false)}
        items={currentItems}
        sender={sender}
        initialCourier={previewCourier}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sender={sender}
        onSaveSender={handleSaveSender}
      />

      {/* AI Scan Temporary Error & Retry Modal */}
      {scanError && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI 인식 일시 안내</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
                {scanError.message.includes('503') || scanError.message.includes('high demand')
                  ? 'AI 서버에 일시적으로 요청이 몰려 응답이 지연되었습니다.\n아래 [다시 시도하기]를 누르면 즉시 재실행됩니다.'
                  : scanError.message}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              {scanError.lastImage && (
                <button
                  type="button"
                  onClick={() => {
                    const img = scanError.lastImage;
                    setScanError(null);
                    if (img) {
                      handleScanImage(img.base64, img.mime);
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  다시 시도하기
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setScanError(null);
                  handleLoadSampleData();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                샘플 데이터 로드
              </button>
              <button
                type="button"
                onClick={() => setScanError(null)}
                className="w-full sm:w-auto px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-600 font-medium text-xs transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
