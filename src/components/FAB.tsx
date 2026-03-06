import React from 'react';
import { Plus } from 'lucide-react';

interface FABProps {
    onClick: () => void;
}

const FAB: React.FC<FABProps> = ({ onClick }) => {
    return (
        <button className="fab" onClick={onClick} aria-label="Add Bill">
            <Plus size={28} />
        </button>
    );
};

export default FAB;
