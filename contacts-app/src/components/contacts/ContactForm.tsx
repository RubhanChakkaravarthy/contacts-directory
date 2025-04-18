import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, Grid, Container,
  Divider, IconButton, FormHelperText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Contact, Address, EmergencyContact } from '../../types/Contact';
import { contactService } from 'services/contactService';
import { 
  contactSchema, 
  validateWithJoi, 
  validateContact
} from '../../helpers/utils';
import Joi from 'joi';
import * as jsonpatch from 'fast-json-patch'

interface ContactFormProps {
  contactId?: number;
  onSubmit: (contact: Contact | jsonpatch.Operation[]) => void;
  onCancel: () => void;
}

// Initial empty contact
const emptyContact: Contact = {
  id: 0,
  firstName: '',
  email: '',
  lastName: '',
  prefix: '',
  contactNumber: '',
  alternativeContactNumber: '',
  companyName: '',
  jobTitle: '',
  notes: '',
  dateOfBirth: '',
  homeAddress: {
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  },
  emergencyContacts: [],
};

const ContactForm: React.FC<ContactFormProps> = ({ 
  contactId = 0, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<Contact>(emptyContact);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [homeAddress, setHomeAddress] = useState<Address>(emptyContact.homeAddress!);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(
    emptyContact.emergencyContacts!
  );
  const originalContactData = useRef<Contact | null>(null);
  
  const isEditMode = Boolean(contactId);

  useEffect(() => {
    // If in edit mode, fetch the contact data from API
    async function fetchContactData() {
      if (isEditMode) {
        try {
          const contactDataResponse = await contactService.getContactById(contactId);
          originalContactData.current = contactDataResponse.data;
          setFormData(contactDataResponse.data);
          setHomeAddress(contactDataResponse.data.homeAddress ?? emptyContact.homeAddress!);
          setEmergencyContacts(contactDataResponse.data.emergencyContacts ?? emptyContact.emergencyContacts!);
        } catch (error) {
          console.error('Error fetching contact data:', error);
        }
      }
    }
    fetchContactData();
  }, [contactId])

  // Keeping form data in localStorage to prevent data loss
  useEffect(() => {
    const savedData = localStorage.getItem('contactFormData');
    if (savedData && !isEditMode) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error('Error parsing saved contact data:', e);
        localStorage.removeItem('contactFormData');
      }
    }
  }, [isEditMode]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (!isEditMode) {
      localStorage.setItem('contactFormData', JSON.stringify(formData));
    }
  }, [formData, isEditMode]);

  // Validate a single field using Joi
  const validateField = (name: string, value: string): string => {
    // Get the appropriate schema for this field
    const schema = contactSchema[name as keyof typeof contactSchema];
    if (!schema) return '';
    
    return validateWithJoi(value, schema as Joi.Schema);
  };

  // Handle change for basic contact fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validate the field
    const error = validateField(name, value);
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle change for home address fields
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHomeAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    setFormData(prev => ({
      ...prev,
      homeAddress: {
        ...prev.homeAddress,
        [name]: value
      }
    }));
  };

  // Handle emergency contact changes
  const handleEmergencyContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    const newEmergencyContacts = [...emergencyContacts];
    newEmergencyContacts[index] = {
      ...newEmergencyContacts[index],
      [field]: value
    };
    
    setEmergencyContacts(newEmergencyContacts);
    
    setFormData(prev => ({
      ...prev,
      emergencyContacts: newEmergencyContacts
    }));
    
    // Validate emergency contact fields
    const validationResult = validateContact(newEmergencyContacts[index]);
    setErrors(prev => ({
      ...prev,
      [`emergencyContact_${index}_${field}`]: validationResult[field] || ''
    }));
  };

  // Add new emergency contact
  const addEmergencyContact = () => {
    if (emergencyContacts.length < 3) {
      const newEmergencyContact: EmergencyContact = {
        name: '',
        relationship: '',
        phoneNumber: '',
        email: ''
      };
      
      setEmergencyContacts([...emergencyContacts, newEmergencyContact]);
      
      setFormData(prev => ({
        ...prev,
        emergencyContacts: [...(prev.emergencyContacts || []), newEmergencyContact]
      }));
    }
  };

  // Remove emergency contact
  const removeEmergencyContact = (index: number) => {
    const newEmergencyContacts = [...emergencyContacts];
    newEmergencyContacts.splice(index, 1);
    
    setEmergencyContacts(newEmergencyContacts);
    
    setFormData(prev => ({
      ...prev,
      emergencyContacts: newEmergencyContacts
    }));
    
    // Remove related errors
    const updatedErrors = { ...errors };
    Object.keys(updatedErrors).forEach(key => {
      if (key.startsWith(`emergencyContact_${index}_`)) {
        delete updatedErrors[key];
      }
    });
    setErrors(updatedErrors);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare complete contact object with all data
    const completeContact: Contact = {
      ...formData,
      homeAddress,
      emergencyContacts
    };
    
    // Validate all fields using Joi
    const validationErrors = validateContact(completeContact);
    setErrors(validationErrors);
    
    // Submit if no errors
    if (Object.keys(validationErrors).length === 0) {
      if (!completeContact.contactNumber) {
        completeContact.contactNumber = undefined;
      }

      if (!completeContact.alternativeContactNumber) {
        completeContact.alternativeContactNumber = undefined;
      }

      if (completeContact.homeAddress) {
        if (Object.keys(completeContact.homeAddress).every((key) => !completeContact.homeAddress![key as keyof Address]))
          completeContact.homeAddress = undefined;
      }

      if (completeContact.emergencyContacts) {
        completeContact.emergencyContacts = completeContact.emergencyContacts.filter((contact) => {
          return Object.keys(contact).some((key) => contact[key as keyof EmergencyContact]);
        });

        if (completeContact.emergencyContacts.length === 0) {
          completeContact.emergencyContacts = undefined;
        }
      }

      if (isEditMode) {
        const patch = jsonpatch.compare(originalContactData.current!, completeContact);
        onSubmit(patch);
      } else {
        onSubmit(completeContact);
      }

      
      // After submit clear the contact from localStorage
      if (!isEditMode) {
        localStorage.removeItem('contactFormData');
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {isEditMode ? 'Edit Contact' : 'Add New Contact'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid size={{ xs:12, sm: 3 }}>
              <TextField
                name="prefix"
                label="Prefix"
                fullWidth
                variant="outlined"
                value={formData.prefix || ''}
                error={Boolean(errors.prefix)}
                onChange={handleChange}
                placeholder="Mr./Ms./Dr."
                slotProps={{htmlInput: { maxLength: 5 }}}
              />
            </Grid>
            
            <Grid size={{ xs:12, sm: 4.5 }}>
              <TextField
                name="firstName"
                label="First Name"
                fullWidth
                required
                variant="outlined"
                value={formData.firstName || ''}
                onChange={handleChange}
                error={Boolean(errors.firstName)}
                helperText={errors.firstName}
                slotProps={{htmlInput: { maxLength: 50 }}}
              />
            </Grid>
            
            <Grid size={{ xs:12, sm: 4.5 }}>
              <TextField
                name="lastName"
                label="Last Name"
                fullWidth
                variant="outlined"
                value={formData.lastName || ''}
                error={Boolean(errors.lastName)}
                onChange={handleChange}
                slotProps={{htmlInput: { maxLength: 50 }}}
              />
            </Grid>
            
            <Grid size={{ xs:12, sm: 6 }}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                required
                variant="outlined"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                error={Boolean(errors.email)}
                helperText={errors.email}
                disabled={isEditMode}
                slotProps={{htmlInput: { maxLength: 50 }}}
              />
            </Grid>
            
            <Grid size={{ xs:12, sm: 6 }}>
              <TextField
                name="contactNumber"
                label="Phone Number"
                fullWidth
                variant="outlined"
                value={formData.contactNumber || ''}
                onChange={handleChange}
                error={Boolean(errors.contactNumber)}
                helperText={errors.contactNumber}
              />
            </Grid>
            
            <Grid size={{ xs:12 }}>
              <TextField
                name="alternativeContactNumber"
                label="Alternative Phone Number"
                fullWidth
                variant="outlined"
                value={formData.alternativeContactNumber || ''}
                onChange={handleChange}
                error={Boolean(errors.alternativeContactNumber)}
                helperText={errors.alternativeContactNumber}
              />
            </Grid>
            
            <Grid size={{ xs:12, sm: 6 }}>
              <TextField
                name="companyName"
                label="Company Name"
                fullWidth
                variant="outlined"
                value={formData.companyName || ''}
                onChange={handleChange}
                error={Boolean(errors.companyName)}
                slotProps={{htmlInput: { maxLength: 50 }}}
              />
            </Grid>
            
            <Grid size={{ xs:12, sm: 6 }}>
              <TextField
                name="jobTitle"
                label="Job Title"
                fullWidth
                variant="outlined"
                value={formData.jobTitle || ''}
                onChange={handleChange}
                error={Boolean(errors.jobTitle)}
                slotProps={{htmlInput: { maxLength: 50 }}}
              />
            </Grid>
            
            <Grid size={{ xs:12 }}>
              <TextField
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                fullWidth
                variant="outlined"
                placeholder='MM/DD/YYYY'
                slotProps={{htmlInput: { shrink: true }, inputLabel: { shrink: true }}}
                value={formData.dateOfBirth}
                error={Boolean(errors.dateOfBirth)}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Home Address
          </Typography>
          
          <Grid container spacing={2}>
            <Grid size={{ xs:12 }}>
              <TextField
                name="address1"
                label="Address Line 1"
                fullWidth
                variant="outlined"
                value={homeAddress?.address1 || ''}
                onChange={handleAddressChange}
                error={Boolean(errors['homeAddress_address1'])}
                slotProps={{htmlInput: { maxLength: 50 }}}
              />
            </Grid>
            
            <Grid size={{ xs:12 }}>
              <TextField
                name="address2"
                label="Address Line 2"
                fullWidth
                variant="outlined"
                value={homeAddress?.address2 || ''}
                onChange={handleAddressChange}
                error={Boolean(errors['homeAddress_address2'])}
                slotProps={{htmlInput: { maxLength: 100 }}}
              />
            </Grid>
            
            <Grid size={{ xs:12, sm: 6 }}>
              <TextField
                name="city"
                label="City"
                fullWidth
                variant="outlined"
                value={homeAddress?.city || ''}
                onChange={handleAddressChange}
                error={Boolean(errors['homeAddress_city'])}
                slotProps={{htmlInput: { maxLength: 30 }}}
              />
            </Grid>
            
            <Grid size={{ xs:12, md: 6 }}>
              <TextField
                name="state"
                label="State"
                fullWidth
                variant="outlined"
                value={homeAddress?.state || ''}
                onChange={handleAddressChange}
                error={Boolean(errors['homeAddress_state'])}
                slotProps={{htmlInput: { maxLength: 30 }}}
              />
            </Grid>
            
            <Grid size={{ xs:12, sm: 6 }}>
              <TextField
                name="zipCode"
                label="Zip Code"
                fullWidth
                variant="outlined"
                value={homeAddress?.zipCode || ''}
                onChange={handleAddressChange}
                error={Boolean(errors['homeAddress_zipCode'])}
                slotProps={{htmlInput: { maxLength: 10 }}}
              />
            </Grid>
            
            <Grid size={{ xs:12, sm: 6 }}>
              <TextField
                name="country"
                label="Country"
                fullWidth
                variant="outlined"
                value={homeAddress?.country || ''}
                onChange={handleAddressChange}
                error={Boolean(errors['homeAddress_country'])}
                slotProps={{htmlInput: { maxLength: 30 }}}
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Emergency Contacts
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addEmergencyContact}
              disabled={emergencyContacts.length >= 3}
            >
              Add Emergency Contact
            </Button>
          </Box>
          
          {emergencyContacts.length === 0 && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No emergency contacts added.
            </Typography>
          )}
          
          {emergencyContacts.map((contact, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">
                  Emergency Contact #{index + 1}
                </Typography>
                
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => removeEmergencyContact(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              
              <Grid container spacing={2}>
                <Grid size={{ xs:12, sm: 6 }}>
                  <TextField
                    label="Name"
                    required
                    fullWidth
                    variant="outlined"
                    value={contact.name || ''}
                    onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                    error={Boolean(errors[`emergencyContact_${index}_name`])}
                    helperText={errors[`emergencyContact_${index}_name`]}
                    slotProps={{htmlInput: { maxLength: 100 }}}
                  />
                </Grid>
                
                <Grid size={{ xs:12, sm: 6 }}>
                  <TextField
                    label="Relationship"
                    required
                    fullWidth
                    variant="outlined"
                    value={contact.relationship || ''}
                    onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                    error={Boolean(errors[`emergencyContact_${index}_relationship`])}
                    helperText={errors[`emergencyContact_${index}_relationship`]}
                    slotProps={{htmlInput: { maxLength: 100 }}}
                  />
                </Grid>
                
                <Grid size={{ xs:12, sm: 6 }}>
                  <TextField
                    label="Phone Number"
                    required
                    fullWidth
                    variant="outlined"
                    value={contact.phoneNumber || ''}
                    onChange={(e) => handleEmergencyContactChange(index, 'phoneNumber', e.target.value)}
                    error={Boolean(errors[`emergencyContact_${index}_phoneNumber`])}
                    helperText={errors[`emergencyContact_${index}_phoneNumber`]}
                  />
                </Grid>
                
                <Grid size={{ xs:12, sm: 6 }}>
                  <TextField
                    label="Email"
                    required
                    fullWidth
                    variant="outlined"
                    type="email"
                    value={contact.email || ''}
                    onChange={(e) => handleEmergencyContactChange(index, 'email', e.target.value)}
                    error={Boolean(errors[`emergencyContact_${index}_email`])}
                    helperText={errors[`emergencyContact_${index}_email`]}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Notes
          </Typography>
          
          <TextField
            name="notes"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.notes || ''}
            onChange={handleChange}
            slotProps={{htmlInput: { maxLength: 500 }}}
            error={Boolean(errors.notes)}
            sx={{ mb: 3 }}
          />
          
          <FormHelperText sx={{ mb: 2 }}>
            * Required fields
          </FormHelperText>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              type="submit"
              color="primary"
            >
              {isEditMode ? 'Update Contact' : 'Save Contact'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ContactForm;