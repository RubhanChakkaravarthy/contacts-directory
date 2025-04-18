import { PaginationInfo, SortInfo } from "./Common";

export interface Address {
  id?: number;
  contactId?: number;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface EmergencyContact {
  id?: number;
  contactId?: number;
  name: string;
  relationship: string;
  phoneNumber: string;
  email: string;
}

export interface Contact {
  id: number;
  prefix?: string;
  firstName: string;
  lastName?: string;
  email: string;
  contactNumber?: string;
  alternativeContactNumber?: string;
  homeAddress?: Address;
  companyName?: string;
  jobTitle?: string;
  notes?: string;
  dateOfBirth?: string;
  emergencyContacts?: EmergencyContact[];
  createdOn?: string;
  updatedOn?: string;
}

// For search and filtering
export interface ContactSearchCriteria {
  email?: string;
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  company?: string;
  jobTitle?: string;
  paginationInfo?: PaginationInfo;
  sortInfo?: SortInfo
}

export interface ContactListItem {
  id: number;
  name: string;
  email: string;
  contactNumber?: string;
  companyName?: string;
  jobTitle?: string;
  dateOfBirth?: string;
  createdOn: Date;
  address?: Address;
}