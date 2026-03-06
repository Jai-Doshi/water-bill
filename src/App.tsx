import { useState } from 'react';
import Splash from './components/Splash';
import FAB from './components/FAB';
import BillCard from './components/BillCard';
import AddBillModal from './components/AddBillModal';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';
import { useAppContext } from './context/AppContext';
import { generatePdf } from './utils/pdf';
import type { Bill } from './types';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billToEdit, setBillToEdit] = useState<Bill | undefined>(undefined);
  const [billToDelete, setBillToDelete] = useState<Bill | undefined>(undefined);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { state, toasts, removeBill, showToast, removeToast } = useAppContext();

  const handleEditBill = (bill: Bill) => {
    setBillToEdit(bill);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (bill: Bill) => {
    setBillToDelete(bill);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (billToDelete) {
      removeBill(billToDelete.id);
      showToast('Bill deleted successfully', 'success');
      setBillToDelete(undefined);
      setIsConfirmOpen(false);
    }
  };

  const cancelDelete = () => {
    setBillToDelete(undefined);
    setIsConfirmOpen(false);
  };

  const handleDownloadPdf = (bill: Bill) => {
    generatePdf(bill);
    showToast('PDF downloaded successfully', 'info');
  };

  const handleCloseModal = () => {
    setBillToEdit(undefined);
    setIsModalOpen(false);
  };

  return (
    <div className="app-container">
      {showSplash && <Splash onFinish={() => setShowSplash(false)} />}

      {!showSplash && (
        <>
          <header className="app-header glass-panel">
            <h1>Water Bill Splitter</h1>
            <div className="header-subtitle">Harisumiran</div>
          </header>

          <main className="app-main">
            {state.bills.length === 0 ? (
              <div className="empty-state glass-card">
                <div className="empty-icon">💧</div>
                <h2>No Bills Yet</h2>
                <p>Tap the + button to add your first water bill and start splitting fairly.</p>
              </div>
            ) : (
              <div className="bills-list">
                {/* Bill Cards will go here */}
                {state.bills.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    onEdit={handleEditBill}
                    onDelete={handleDeleteRequest}
                    onDownloadPdf={handleDownloadPdf}
                  />
                ))}
              </div>
            )}
          </main>

          <FAB onClick={() => setIsModalOpen(true)} />

          {isModalOpen && <AddBillModal initialBill={billToEdit} onClose={handleCloseModal} />}

          <ConfirmModal
            isOpen={isConfirmOpen}
            title="Delete Bill"
            message={`Are you sure you want to delete this bill for $${billToDelete?.amount.toFixed(2)}? This action cannot be undone.`}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />

          <div className="toast-container">
            {toasts.map(toast => (
              <Toast key={toast.id} {...toast} onClose={removeToast} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
