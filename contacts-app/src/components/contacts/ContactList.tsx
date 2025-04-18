import React, { useEffect, useMemo, useState } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, IconButton, Container, Grid,
  Stack,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Notification from '../common/Notification';
import { Contact, ContactListItem, ContactSearchCriteria } from '../../types/Contact';
import { contactService } from '../../services/contactService';
import { SortBy, SortOrder } from 'types/enums';
import { convertFieldToSortBy, formatDate, formatSearchFieldNames } from 'helpers/utils';
import MultiSearchField from 'components/common/MultiSearchField';

interface ContactListProps {
  onAddClick: () => void;
  onEditClick: (contactId: number) => void;
  onViewClick: (contactId: number) => void;
}

const defaultSearchCriteria = {
  email: '',
  name: '',
  company: '',
  jobTitle: '',
};

const defaultPaginationInfo = {
  currentPage: 1,
  pageSize: 10,
};

const defaultSortInfo = {
  sortBy: SortBy.NAME,
  sortOrder: SortOrder.ASCENDING,
};

const ContactList: React.FC<ContactListProps> = ({ onAddClick, onEditClick, onViewClick }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [paginationInfo, setPaginationInfo] = useState(defaultPaginationInfo);
  const [sortInfo, setSortInfo] = useState(defaultSortInfo);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const [localSearchField, setLocalSearchField] = useState<string>('');
  const [localSearchQuery, setLocalSearchQuery] = useState<string>('');

  const loadContacts = async () => {
    setLoading(true);
    try {
      // Combine the separate states into one request object
      const requestCriteria: ContactSearchCriteria = {
        ...searchCriteria,
        paginationInfo,
        sortInfo,
      };

      const response = await contactService.getContacts(requestCriteria);
      setContacts(response.data.items);
      setTotalCount(response.data.paginationInfo.totalRecords || response.data.items.length);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      setError('Failed to load contacts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Effect to load contacts when search criteria, pagination or sorting changes
  useEffect(() => {
    loadContacts();
  }, [searchCriteria, paginationInfo.currentPage, paginationInfo.pageSize, sortInfo.sortBy, sortInfo.sortOrder]);

  const availableSearchFields = () => {
    // Return fields that aren't currently being used for filtering
    return Object.keys(defaultSearchCriteria).filter(key => !searchCriteria[key as keyof typeof searchCriteria]).map(key => ({key: key, display: formatSearchFieldNames(key)}));
  };

  const selectedSearchFields = () => {
    // Return fields that are currently being used for filtering
    return Object.entries(searchCriteria)
      .filter(([_, value]) => value) // Include only fields with non-empty values
      .map(([key]) => key);
  };

  const handleAddSelectedSearchField = () => {
    if (!localSearchField || !localSearchQuery) return;
    
    setSearchCriteria((prev) => ({
      ...prev,
      [localSearchField]: localSearchQuery,
    }));

    // Clear local inputs after adding
    setLocalSearchQuery('');
    setLocalSearchField('');
  };

  const handleRemoveSelectedSearchField = (field: string) => {
    setSearchCriteria((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  // Handle deletion of a contact
  const handleDelete = async (contactId: number) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactService.deleteContact(contactId);
        // Refresh contact list without changing search criteria
        loadContacts();
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    }
  };

  // Close notification
  const handleNotificationClose = () => {
    setError('');
  };

  // Handle sorting change
  const handleSortModelChange = (sortModel: GridSortModel) => {
    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0];
      
      // Only update sort info, not the search criteria
      setSortInfo({
        sortBy: convertFieldToSortBy(field),
        sortOrder: sort === 'asc' ? SortOrder.ASCENDING : SortOrder.DESCENDING,
      });

      // Reset to first page when sorting changes
      setPaginationInfo(prev => ({
        ...prev,
        currentPage: 1,
      }));
    }
  };

  // Handle pagination model change
  const handlePaginationModelChange = (paginationModel: { pageSize: number; page: number }) => {
    let { page, pageSize } = paginationModel;

    setPaginationInfo((prev) => {
      if (prev.pageSize !== paginationModel.pageSize) {
        page = 0; // Reset to first page if page size changes
      }

      return {
        currentPage: page + 1, // DataGrid is 0-based, API is 1-based
        pageSize: pageSize,
      }
    });
  };

  // Define columns for the data grid
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'contactNumber', headerName: 'Phone', flex: 1 },
    { field: 'companyName', headerName: 'Company Name', flex: 1 },
    { field: 'jobTitle', headerName: 'Job Title', flex: 1 },
    { field: 'dateOfBirth', headerName: 'Date of Birth', flex: 1, valueFormatter: formatDate },
    { field: 'createdOn', headerName: 'Created On', flex: 1, valueFormatter: formatDate },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const contact = params.row as ContactListItem;
        return (
          <Box>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onViewClick(contact.id);
              }}
              size="small"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onEditClick(contact.id);
              }}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                if (contact.id) handleDelete(contact.id);
              }}
              size="small"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    }
  ];

  return (
    <Container maxWidth="xl">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between" mb={2}>
          <Grid size={{ xs:12, md: 6 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Contacts
            </Typography>
          </Grid>
          <Grid size={{ xs:12, md: 6}} display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={onAddClick}
            >
              Add Contact
            </Button>
          </Grid>
          
          <Grid size={{ xs:12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MultiSearchField 
                searchField={localSearchField} 
                searchFields={availableSearchFields()}
                searchQuery={localSearchQuery}
                onSearchFieldChange={(e) => setLocalSearchField(e.target.value)}
                onSearchQueryChange={(e) => setLocalSearchQuery(e.target.value)}
              />
              <IconButton 
                sx={{ ml: 1, color: '#3f51b5' }} 
                onClick={handleAddSelectedSearchField}
              >
                <AddCircleIcon />
              </IconButton>
            </Box>

            <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {selectedSearchFields().map((field) => (
                <Chip
                  key={field}
                  label={`${formatSearchFieldNames(field)} like '${searchCriteria[field as keyof typeof searchCriteria]}'`}
                  onDelete={() => handleRemoveSelectedSearchField(field)}
                  color="primary"
                />
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={contacts}
            columns={columns}
            loading={loading}
            paginationMode="server"
            sortingMode="server"
            rowCount={totalCount}
            pageSizeOptions={[10, 25, 50]}
            paginationModel={{
              page: paginationInfo.currentPage - 1, // DataGrid is 0-based, API is 1-based
              pageSize: paginationInfo.pageSize,
            }}
            onPaginationModelChange={handlePaginationModelChange}
            onSortModelChange={handleSortModelChange}
            initialState={{
              sorting: {
                sortModel: [{ field: sortInfo.sortBy, sort: sortInfo.sortOrder === SortOrder.ASCENDING ? 'asc' : 'desc' }],
              },
            }}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>

      <Notification
        isOpen={Boolean(error)}
        message={error}
        type="error"
        onClose={handleNotificationClose}
        duration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Container>
  );
};

export default ContactList;