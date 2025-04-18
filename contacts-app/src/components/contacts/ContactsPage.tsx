import React, { useState } from 'react';
import ContactList from './ContactList';
import ContactForm from './ContactForm';
import ContactDetail from './ContactDetail';
import { Contact } from '../../types/Contact';
import { contactService } from '../../services/contactService';
import { Box } from '@mui/material';
import Notification from '../common/Notification';
import * as jsonpatch from 'fast-json-patch';

enum ContactView {
  LIST = 'list',
  CREATE = 'create',
  EDIT = 'edit',
  VIEW = 'view',
}

const ContactsPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ContactView>(ContactView.LIST);
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleAddClick = () => {
    setSelectedContact(null);
    setCurrentView(ContactView.CREATE);
  };

  const handleEditClick = (contactId: number) => {
    setSelectedContact(contactId);
    setCurrentView(ContactView.EDIT);
  };

  const handleViewClick = (contactId: number) => {
    setSelectedContact(contactId);
    setCurrentView(ContactView.VIEW);
  };

  const handleBackToList = () => {
    setCurrentView(ContactView.LIST);
    setSelectedContact(null);
  };


  const handleContactSubmit = async (contact: Contact | jsonpatch.Operation[]) => {
    try {
      if (currentView === ContactView.CREATE) {
        await contactService.createContact(contact as Contact);
        showNotification('Contact created successfully!', 'success');
      } else {
        await contactService.updateContact(selectedContact!, contact as jsonpatch.Operation[]);
        showNotification('Contact updated successfully!', 'success');
      }
      
      handleBackToList();
    } catch (error) {
      console.error('Error saving contact:', error);
      showNotification('Error saving contact. Please try again.', 'error');
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      {currentView === ContactView.LIST && (
        <ContactList
          onAddClick={handleAddClick}
          onEditClick={handleEditClick}
          onViewClick={handleViewClick}
        />
      )}

      {(currentView === ContactView.CREATE || currentView === ContactView.EDIT) && (
        <ContactForm
          contactId={currentView === ContactView.EDIT && selectedContact ? selectedContact : undefined}
          onSubmit={handleContactSubmit}
          onCancel={handleBackToList}
        />
      )}

      {currentView === ContactView.VIEW && selectedContact && (
        <ContactDetail
          contactId={selectedContact}
          onBackClick={handleBackToList}
          onEditClick={handleEditClick}
        />
      )}

        <Notification
          isOpen={Boolean(notification)}
          message={notification?.message || ''}
          type={notification?.type || 'success'}
          onClose={handleCloseNotification}
          duration={6000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} 
        />
    </Box>
  );
};

export default ContactsPage;