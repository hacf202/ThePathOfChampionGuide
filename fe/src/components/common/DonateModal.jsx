import React from 'react';
import Modal from './modal';
import { Coffee } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const DonateModal = ({ isOpen, onClose }) => {
	const { tUI } = useTranslation();

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={tUI("nav.donateTitle")} maxWidth="max-w-sm">
			<div className="flex flex-col items-center justify-center text-text-primary">
				<div className="bg-primary-500/10 p-3 md:p-4 rounded-full mb-3 md:mb-4 text-primary-500">
					<Coffee className="w-8 h-8 md:w-10 md:h-10" />
				</div>
				<h3 className="text-lg md:text-xl font-bold mb-2 text-center">{tUI("nav.donateTitle")}</h3>
				<p className="text-center text-text-secondary mb-4 md:mb-6 text-sm px-2">
					{tUI("nav.donateDesc")}
				</p>
				
				<div className="bg-white p-2 rounded-xl shadow-inner mb-3 md:mb-4">
					<img 
						src="https://images.pocguide.top/guides/evinQR.webp" 
						alt="Donate QR Code" 
						className="w-40 h-40 md:w-48 md:h-48 object-contain"
					/>
				</div>
				<p className="text-xs md:text-sm font-medium text-text-secondary">{tUI("nav.donateQR")}</p>
				
				<div className="mt-3 md:mt-4 flex flex-col items-center gap-1 md:gap-1.5 text-xs md:text-sm bg-primary-500/5 px-4 md:px-6 py-2 md:py-3 rounded-lg border border-primary-500/20 w-full max-w-[280px]">
					<div className="flex w-full justify-between items-center gap-2 md:gap-4">
						<span className="text-text-secondary">{tUI("nav.bankName")}</span>
						<span className="font-bold">MB Bank</span>
					</div>
					<div className="flex w-full justify-between items-center gap-2 md:gap-4">
						<span className="text-text-secondary">{tUI("nav.accountNumber")}</span>
						<span className="font-bold font-mono tracking-wider">011220040126</span>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default DonateModal;
