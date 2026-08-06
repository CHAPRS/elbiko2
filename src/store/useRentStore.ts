import { create } from 'zustand';
import { Bike } from '@/types';

interface RentState {
  selectedBike: Bike | null;
  rentDays: number;
  isAuthenticated: boolean;
  userPhone: string | null;
  isAuthModalOpen: boolean;
  isBookingModalOpen: boolean;
  isContactModalOpen: boolean;
  contactModalType: 'tariff' | 'business' | 'repair' | null;
  setRentDays: (days: number) => void;
  selectBike: (bike: Bike) => void;
  setAuthenticated: (phone: string) => void;
  logout: () => void;
  toggleAuthModal: (isOpen: boolean) => void;
  toggleBookingModal: (isOpen: boolean) => void;
  toggleContactModal: (isOpen: boolean, type?: 'tariff' | 'business' | 'repair') => void;
}

export const useRentStore = create<RentState>((set) => ({
  selectedBike: null,
  rentDays: 7,
  isAuthenticated: false,
  userPhone: null,
  isAuthModalOpen: false,
  isBookingModalOpen: false,
  isContactModalOpen: false,
  contactModalType: null,

  setRentDays: (days) => set({ rentDays: days }),
  selectBike: (bike) => set({ selectedBike: bike }),
  setAuthenticated: (phone) => set({ isAuthenticated: true, userPhone: phone, isAuthModalOpen: false }),
  logout: () => set({ isAuthenticated: false, userPhone: null }),
  toggleAuthModal: (isOpen) => set({ isAuthModalOpen: isOpen }),
  toggleBookingModal: (isOpen) => set({ isBookingModalOpen: isOpen }),
  toggleContactModal: (isOpen, type) => set({ isContactModalOpen: isOpen, contactModalType: type || null }),
}));
