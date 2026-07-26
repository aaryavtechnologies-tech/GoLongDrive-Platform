import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RegistrationStep = 
  | 'PERSONAL'
  | 'ADDRESS'
  | 'ACCOUNT'
  | 'VEHICLE_BASIC'
  | 'VEHICLE_SPECS'
  | 'DOCS_IDENTITY'
  | 'DOCS_VEHICLE'
  | 'PHOTO'
  | 'REVIEW';

export const STEPS: RegistrationStep[] = [
  'PERSONAL',
  'ADDRESS',
  'ACCOUNT',
  'VEHICLE_BASIC',
  'VEHICLE_SPECS',
  'DOCS_IDENTITY',
  'DOCS_VEHICLE',
  'PHOTO',
  'REVIEW',
];

export interface PersonalDetails {
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface AccountDetails {
  password?: string;
  termsAccepted: boolean;
}

export interface VehicleDetails {
  brand: string;
  model: string;
  vehicleNumber: string;
  vehicleType: string;
  fuelType: string;
  manufacturingYear: string;
  seatingCapacity: string;
  acAvailable: boolean;
}

export interface DocumentUploads {
  aadhaarFront?: string;
  aadhaarBack?: string;
  drivingLicenseFront?: string;
  drivingLicenseBack?: string;
  rcFront?: string;
  rcBack?: string;
  insuranceCertificate?: string;
  pucCertificate?: string;
}

export interface PhotoUploads {
  profilePhoto?: string;
  selfie?: string;
  vehicleFront?: string;
}

interface RegistrationState {
  currentStep: RegistrationStep;
  personalDetails: Partial<PersonalDetails>;
  accountDetails: Partial<AccountDetails>;
  vehicleDetails: Partial<VehicleDetails>;
  documents: Partial<DocumentUploads>;
  photos: Partial<PhotoUploads>;
  
  // Actions
  setStep: (step: RegistrationStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  updatePersonalDetails: (data: Partial<PersonalDetails>) => void;
  updateAccountDetails: (data: Partial<AccountDetails>) => void;
  updateVehicleDetails: (data: Partial<VehicleDetails>) => void;
  updateDocuments: (data: Partial<DocumentUploads>) => void;
  updatePhotos: (data: Partial<PhotoUploads>) => void;
  
  clearRegistration: () => void;
}

const initialState = {
  currentStep: 'PERSONAL' as RegistrationStep,
  personalDetails: {},
  accountDetails: { termsAccepted: false },
  vehicleDetails: {},
  documents: {},
  photos: {},
};

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setStep: (step) => set({ currentStep: step }),
      
      nextStep: () => {
        const { currentStep } = get();
        const currentIndex = STEPS.indexOf(currentStep);
        if (currentIndex < STEPS.length - 1) {
          set({ currentStep: STEPS[currentIndex + 1] });
        }
      },
      
      prevStep: () => {
        const { currentStep } = get();
        const currentIndex = STEPS.indexOf(currentStep);
        if (currentIndex > 0) {
          set({ currentStep: STEPS[currentIndex - 1] });
        }
      },
      
      updatePersonalDetails: (data) => 
        set((state) => ({ personalDetails: { ...state.personalDetails, ...data } })),
        
      updateAccountDetails: (data) => 
        set((state) => ({ accountDetails: { ...state.accountDetails, ...data } })),
        
      updateVehicleDetails: (data) => 
        set((state) => ({ vehicleDetails: { ...state.vehicleDetails, ...data } })),
        
      updateDocuments: (data) => 
        set((state) => ({ documents: { ...state.documents, ...data } })),
        
      updatePhotos: (data) => 
        set((state) => ({ photos: { ...state.photos, ...data } })),
        
      clearRegistration: () => set(initialState),
    }),
    {
      name: 'registration-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
