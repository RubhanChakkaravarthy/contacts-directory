import React, { useEffect } from 'react';
import { 
  Box, Button, Typography, Paper, Grid, Container,
  Divider, List, ListItem, ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Contact } from '../../types/Contact';
import { contactService } from '../../services/contactService';
import Loading from 'components/common/Loading';
import Notification from 'components/common/Notification';
import { formatDate } from 'helpers/utils';

interface ContactDetailProps {
  contactId: number;
  onBackClick: () => void;
  onEditClick: (contactId: number) => void;
}

const ContactDetail: React.FC<ContactDetailProps> = ({ 
  contactId,
  onBackClick,
  onEditClick,
}) => {
  const [contact, setContact] = React.useState<Contact | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const fetchedContact = await contactService.getContactById(contactId);
        setContact(fetchedContact.data);
      } catch (error) {
        console.error('Failed to load contact:', error);
        setError('Failed to load contact. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (contactId) {
      fetchContact();
    }
  }, [contactId]);

  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBackClick}
          >
            Back to Contacts
          </Button>
          
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            onClick={() => onEditClick(contact!.id)}
            disabled={Boolean(!contact || error)}
          >
            Edit
          </Button>
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {contact ? (contact.prefix ? `${contact.prefix} ` : '') + contact.firstName + ' ' + contact.lastName : 'Contact Name'}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid size={{ xs:12, md: 6}}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <List disablePadding>
                <ListItem>
                  <ListItemText primary="Email" secondary={contact?.email ?? ''} />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText 
                    primary="Phone Number" 
                    secondary={contact?.contactNumber || 'N/A'}
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText 
                    primary="Alternative Phone" 
                    secondary={contact?.alternativeContactNumber || 'N/A'} 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText 
                    primary="Date of Birth" 
                    secondary={formatDate(contact?.dateOfBirth)} 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid size={{ xs:12, md: 6}}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <List disablePadding>
                <ListItem>
                  <ListItemText 
                    primary="Company" 
                    secondary={contact?.companyName || 'N/A'} 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText 
                    primary="Job Title" 
                    secondary={contact?.jobTitle || 'N/A'} 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText 
                    primary="Created On" 
                    secondary={formatDate(contact?.createdOn)} 
                  />
                </ListItem>
                
                {contact?.updatedOn && (
                  <>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="Updated On" 
                        secondary={formatDate(contact?.updatedOn)} 
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Home Address
        </Typography>
        
        {contact?.homeAddress ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography>
              {contact.homeAddress.address1}
              {contact.homeAddress.address2 && (
                <>
                  <br />
                  {contact.homeAddress.address2}
                </>
              )}
              {(contact.homeAddress.city || contact.homeAddress.state || contact.homeAddress.zipCode) && (
                <>
                  <br />
                  {contact.homeAddress.city}{contact.homeAddress.city && contact.homeAddress.state && ', '}
                  {contact.homeAddress.state} {contact.homeAddress.zipCode}
                </>
              )}
              {contact.homeAddress.country && (
                <>
                  <br />
                  {contact.homeAddress.country}
                </>
              )}
            </Typography>
          </Paper>
        ) : (
          <Typography color="text.secondary">No address provided</Typography>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" gutterBottom>
          Emergency Contacts
        </Typography>
        
        {contact?.emergencyContacts && contact.emergencyContacts.length > 0 ? (
          <Grid container spacing={2}>
            {contact.emergencyContacts.map((emergency, index) => (
              <Grid size={{ xs:12, md: 6}} key={index}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {emergency.name} ({emergency.relationship})
                  </Typography>
                  <List disablePadding>
                    <ListItem>
                      <ListItemText primary="Phone" secondary={emergency.phoneNumber} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary="Email" secondary={emergency.email} />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">No emergency contacts provided</Typography>
        )}
        
        {contact?.notes && (
          <>
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Notes
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography>
                {contact.notes}
              </Typography>
            </Paper>
          </>
        )}
      </Paper>

      <Loading loading={loading} />
      
      <Notification
        isOpen={Boolean(error)}
        message={error ?? ''}
        onClose={() => setError(null)}
        type="error"
        duration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Container>
  );
};

export default ContactDetail;