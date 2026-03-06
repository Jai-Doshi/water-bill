import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Bill, BillPersonDetails } from '../types';
import { X, ArrowRight, ArrowLeft, Plus, Check } from 'lucide-react';
import { differenceInDays, parseISO, isValid } from 'date-fns';
import './AddBillModal.css';

interface AddBillModalProps {
    initialBill?: Bill;
    onClose: () => void;
}

const AddBillModal: React.FC<AddBillModalProps> = ({ initialBill, onClose }) => {
    const { state, addPerson, addBill, updateBill, showToast } = useAppContext();
    const [step, setStep] = useState(1);

    // Step 1 State
    const [amount, setAmount] = useState(initialBill ? initialBill.amount.toString() : '');
    const [startDate, setStartDate] = useState(initialBill ? initialBill.startDate : '');
    const [endDate, setEndDate] = useState(initialBill ? initialBill.endDate : '');

    // Step 2 State
    const [selectedPeopleIds, setSelectedPeopleIds] = useState<string[]>(
        initialBill ? initialBill.peopleDetails.map(p => p.personId) : []
    );
    const [newPersonName, setNewPersonName] = useState('');

    // Step 3 State
    const [personDates, setPersonDates] = useState<Record<string, { start: string; end: string }>>(() => {
        if (initialBill) {
            const dates: Record<string, { start: string; end: string }> = {};
            initialBill.peopleDetails.forEach(p => {
                dates[p.personId] = { start: p.startDate, end: p.endDate };
            });
            return dates;
        }
        return {};
    });

    const handleNextStep1 = () => {
        if (!amount || !startDate || !endDate) return alert('Please fill all fields');
        if (new Date(startDate) > new Date(endDate)) return alert('Start date must be before end date');

        // Initialize person dates based on bill dates
        const initDates: Record<string, { start: string; end: string }> = {};
        selectedPeopleIds.forEach(id => {
            initDates[id] = { start: startDate, end: endDate };
        });
        setPersonDates(prev => ({ ...initDates, ...prev }));

        setStep(2);
    };

    const handleAddPerson = () => {
        if (!newPersonName.trim()) return;
        const person = addPerson(newPersonName.trim());
        setSelectedPeopleIds(prev => [...prev, person.id]);
        setNewPersonName('');
    };

    const togglePersonSelection = (id: string) => {
        setSelectedPeopleIds(prev => {
            const isAdding = !prev.includes(id);
            if (isAdding) showToast('Person included in bill', 'info');
            return isAdding ? [...prev, id] : prev.filter(p => p !== id);
        });
    };

    const handleNextStep2 = () => {
        if (selectedPeopleIds.length === 0) return alert('Select at least one person');

        // Ensure all selected people have dates initialized
        const newPersonDates = { ...personDates };
        selectedPeopleIds.forEach(id => {
            if (!newPersonDates[id]) {
                newPersonDates[id] = { start: startDate, end: endDate };
            }
        });
        setPersonDates(newPersonDates);

        setStep(3);
    };

    const updatePersonDate = (id: string, field: 'start' | 'end', value: string) => {
        setPersonDates(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const calculateSplit = (): BillPersonDetails[] => {
        const totalAmount = parseFloat(amount);

        const details = selectedPeopleIds.map(id => {
            const person = state.people.find(p => p.id === id)!;
            const dates = personDates[id];
            const start = parseISO(dates.start);
            const end = parseISO(dates.end);
            let days = 0;

            if (isValid(start) && isValid(end)) {
                // +1 to include both start and end dates if they are the same
                days = differenceInDays(end, start) + 1;
                if (days < 0) days = 0;
            }

            return {
                personId: id,
                name: person.name,
                startDate: dates.start,
                endDate: dates.end,
                days,
                amountContributed: 0 // Will calculate next
            };
        });

        const totalDays = details.reduce((sum, d) => sum + d.days, 0);

        if (totalDays > 0) {
            details.forEach(d => {
                d.amountContributed = (d.days / totalDays) * totalAmount;
            });
        }

        return details;
    };

    const splitDetails = step === 4 ? calculateSplit() : [];

    const handleSave = () => {
        const newBill: Bill = {
            id: initialBill ? initialBill.id : crypto.randomUUID(),
            amount: parseFloat(amount),
            startDate,
            endDate,
            peopleDetails: splitDetails
        };
        if (initialBill) {
            updateBill(newBill);
            showToast('Bill updated successfully!', 'success');
        } else {
            addBill(newBill);
            showToast('Bill added successfully!', 'success');
        }
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{initialBill ? 'Edit Water Bill' : 'Add Water Bill'}</h2>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="step-indicator">
                    <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                    <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
                    <div className={`step-line ${step >= 4 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 4 ? 'active' : ''}`}>4</div>
                </div>

                <div className="modal-body">
                    {step === 1 && (
                        <div className="step-content animation-fade-in">
                            <h3>Bill Details</h3>
                            <div className="input-group">
                                <label className="input-label">Total Amount ($)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Start Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">End Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-primary w-full mt-4" onClick={handleNextStep1}>
                                Next <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-content animation-fade-in">
                            <h3>Who shares this bill?</h3>

                            <div className="people-list">
                                {state.people.map(person => (
                                    <label key={person.id} className="person-select-item glass-panel">
                                        <input
                                            type="checkbox"
                                            checked={selectedPeopleIds.includes(person.id)}
                                            onChange={() => togglePersonSelection(person.id)}
                                        />
                                        <span>{person.name}</span>
                                    </label>
                                ))}
                                {state.people.length === 0 && <p className="text-secondary text-center mb-4">No people added yet.</p>}
                            </div>

                            <div className="add-person-form">
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="New person name"
                                    value={newPersonName}
                                    onChange={e => setNewPersonName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddPerson()}
                                />
                                <button className="btn btn-secondary" onClick={handleAddPerson}>
                                    <Plus size={18} /> Add
                                </button>
                            </div>

                            <div className="modal-actions mt-4">
                                <button className="btn btn-secondary" onClick={() => setStep(1)}>
                                    <ArrowLeft size={18} /> Back
                                </button>
                                <button className="btn btn-primary" onClick={handleNextStep2}>
                                    Next <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-content animation-fade-in">
                            <h3>Adjust Stay Dates</h3>
                            <p className="text-secondary mb-4 text-sm">Defaults to bill dates. Adjust if someone stayed fewer days.</p>

                            <div className="person-dates-list">
                                {selectedPeopleIds.map(id => {
                                    const person = state.people.find(p => p.id === id)!;
                                    return (
                                        <div key={id} className="person-date-card glass-panel">
                                            <div className="font-semibold mb-2">{person.name}</div>
                                            <div className="date-inputs-row">
                                                <div className="input-group flex-1">
                                                    <label className="input-label" style={{ fontSize: '0.75rem' }}>Start</label>
                                                    <input
                                                        type="date"
                                                        className="input-field p-2 text-sm"
                                                        value={personDates[id]?.start || ''}
                                                        onChange={e => updatePersonDate(id, 'start', e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-group flex-1">
                                                    <label className="input-label" style={{ fontSize: '0.75rem' }}>End</label>
                                                    <input
                                                        type="date"
                                                        className="input-field p-2 text-sm"
                                                        value={personDates[id]?.end || ''}
                                                        onChange={e => updatePersonDate(id, 'end', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="modal-actions mt-4">
                                <button className="btn btn-secondary" onClick={() => setStep(2)}>
                                    <ArrowLeft size={18} /> Back
                                </button>
                                <button className="btn btn-primary" onClick={() => setStep(4)}>
                                    Review <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="step-content animation-fade-in">
                            <h3>Review & Split</h3>

                            <div className="review-summary glass-panel mb-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-secondary">Total Amount:</span>
                                    <span className="font-bold text-primary">${parseFloat(amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary">Total Days (Combined):</span>
                                    <span className="font-bold">{splitDetails.reduce((sum, d) => sum + d.days, 0)} days</span>
                                </div>
                            </div>

                            <div className="split-list">
                                {splitDetails.map(d => (
                                    <div key={d.personId} className="split-item glass-panel">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold">{d.name}</span>
                                            <span className="font-bold text-success">${d.amountContributed.toFixed(2)}</span>
                                        </div>
                                        <div className="text-xs text-secondary flex justify-between">
                                            <span>{d.days} days</span>
                                            <span>{d.startDate} to {d.endDate}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="modal-actions mt-4">
                                <button className="btn btn-secondary" onClick={() => setStep(3)}>
                                    <ArrowLeft size={18} /> Back
                                </button>
                                <button className="btn btn-primary" onClick={handleSave}>
                                    <Check size={18} /> Save Bill
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddBillModal;
