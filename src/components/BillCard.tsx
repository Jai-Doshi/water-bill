import React from 'react';
import type { Bill } from '../types';
import { format, parseISO } from 'date-fns';
import { Download, Edit2, Users, Trash2 } from 'lucide-react';
import './BillCard.css';

interface BillCardProps {
    bill: Bill;
    onEdit: (bill: Bill) => void;
    onDelete: (bill: Bill) => void;
    onDownloadPdf: (bill: Bill) => void;
}

const BillCard: React.FC<BillCardProps> = ({ bill, onEdit, onDelete, onDownloadPdf }) => {
    const formatDate = (dateStr: string) => {
        try {
            return format(parseISO(dateStr), 'MMM d, yyyy');
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="bill-card glass-card">
            <div className="bill-card-header">
                <div className="bill-amount">${bill.amount.toFixed(2)}</div>
                <div className="bill-dates">
                    {formatDate(bill.startDate)} - {formatDate(bill.endDate)}
                </div>
            </div>

            <div className="bill-card-body">
                <div className="bill-people-info">
                    <Users size={16} />
                    <span>{bill.peopleDetails.length} people split this bill</span>
                </div>

                <div className="bill-people-list">
                    {bill.peopleDetails.slice(0, 3).map((p) => (
                        <div key={p.personId} className="person-pill glass-panel">
                            {p.name}
                        </div>
                    ))}
                    {bill.peopleDetails.length > 3 && (
                        <div className="person-pill glass-panel">
                            +{bill.peopleDetails.length - 3}
                        </div>
                    )}
                </div>
            </div>

            <div className="bill-card-footer">
                <div className="footer-actions-left">
                    <button className="btn-icon" onClick={() => onEdit(bill)} title="Edit Bill">
                        <Edit2 size={18} />
                    </button>
                    <button className="btn-icon delete-btn" onClick={() => onDelete(bill)} title="Delete Bill">
                        <Trash2 size={18} color="var(--color-danger)" />
                    </button>
                </div>
                <div className="footer-actions-right">
                    <button className="btn-icon" onClick={() => onDownloadPdf(bill)} title="Download PDF">
                        <Download size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillCard;
