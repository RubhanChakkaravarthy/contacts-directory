import axios from 'axios';
import { Contact, ContactSearchCriteria } from '../types/Contact';
import { PaginatedDto, ResponseDto } from '../types/Common';
import { API_URL } from 'env';
import * as jsonpatch from 'fast-json-patch';

const CONTACT_API = API_URL + '/contact'; // Base url for the contact API

const patchHeaders = {
  "Content-Type": "application/json-patch+json"
};

export const contactService = {
  // Get paginated contacts with search and filtering
  getContacts: async (searchCriteria: ContactSearchCriteria): Promise<ResponseDto<PaginatedDto<Contact>>> => {    
    try {
      const response = await axios.post<ResponseDto<PaginatedDto<Contact>>>(`${CONTACT_API}/search`, searchCriteria);
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },

  // Get contact by ID
  getContactById: async (id: number): Promise<ResponseDto<Contact>> => {
    try {
      const response = await axios.get<ResponseDto<Contact>>(`${CONTACT_API}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error);
      throw error;
    }
  },

  // Create new contact
  createContact: async (contact: Contact): Promise<ResponseDto<Contact>> => {
    try {
      const response = await axios.post<ResponseDto<Contact>>(`${CONTACT_API}`, contact);
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },

  // Update existing contact
  updateContact: async (id: number, contact: jsonpatch.Operation[]): Promise<ResponseDto<Contact>> => {
    if (!id) {
      throw new Error('Invalid Contact Id');
    }
    
    try {
      const response = await axios.patch<ResponseDto<Contact>>(`${CONTACT_API}/${id}`, contact, { headers: patchHeaders });
      return response.data;
    } catch (error) {
      console.error(`Error updating contact ${id}:`, error);
      throw error;
    }
  },

  // Delete contact
  deleteContact: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${CONTACT_API}/${id}`);
    } catch (error) {
      console.error(`Error deleting contact ${id}:`, error);
      throw error;
    }
  }
};