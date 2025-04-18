import React from 'react';
import { CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import ContactsPage from './components/contacts/ContactsPage';
import axios from 'axios';

axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            Contacts Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <ContactsPage />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
