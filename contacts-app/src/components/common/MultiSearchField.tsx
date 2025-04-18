import { Grid, FormControl, InputLabel, Select, MenuItem, TextField, SelectChangeEvent } from '@mui/material';
import React, { ChangeEvent } from 'react';

export interface MultiSearchFieldProps {
  searchField: string;
  searchFields: { key: string, display: string }[];
  searchQuery: string;
  onSearchFieldChange: (e: SelectChangeEvent<string>) => void;
  onSearchQueryChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const MultiSearchField: React.FC<MultiSearchFieldProps> = ({ searchField, searchFields, onSearchFieldChange, searchQuery, onSearchQueryChange }) => {
  return (
    <Grid container spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
        {/* Dropdown for selecting the search field */}
        <Grid size={{xs: 4}}>
            <FormControl fullWidth>
                <InputLabel>Search Field</InputLabel>
                <Select
                    value={searchField}
                    onChange={onSearchFieldChange}
                    label="Search Field"
                >
                    {searchFields.map((item) => (
                        <MenuItem key={item.key} value={item.key}>
                            {item.display}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>

        {/* Textbox for entering the search query */}
        <Grid size={{xs: 8}}>
            <TextField
                fullWidth
                label={`Search`}
                value={searchQuery}
                onChange={onSearchQueryChange}
                variant="outlined"
            />
        </Grid>
    </Grid>
  );
}

export default MultiSearchField;