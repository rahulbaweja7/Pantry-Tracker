'use client';
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography, IconButton, ThemeProvider, createTheme } from "@mui/material";
import { collection, deleteDoc, getDoc, getDocs, setDoc, doc } from "firebase/firestore";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import SearchIcon from '@mui/icons-material/Search';

// Define the dark mode theme with improved contrast
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212', // Dark background for the whole app
      paper: '#1e1e1e'   // Slightly lighter background for paper elements
    },
    text: {
      primary: '#e0e0e0', // Light text color
      secondary: '#b0b0b0' // Slightly muted text color
    },
    primary: {
      main: '#bb86fc' // Light purple for primary elements
    },
    secondary: {
      main: '#03dac6' // Light teal for secondary elements
    }
  },
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemCategory, setItemCategory] = useState('');
  const [itemExpiration, setItemExpiration] = useState('');

  const updateInventory = async () => {
    const snapshot = collection(firestore, 'inventory');
    const docs = await getDocs(snapshot);
    const inventoryList = [];

    docs.forEach((doc) => {
      inventoryList.push({ id: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  const updateItem = async (item) => {
    const docRef = doc(firestore, 'inventory', item.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { ...item, quantity: quantity + 1 });
      await updateInventory();
    }
  };
  
  const addItem = async () => {
    if (!itemName || itemQuantity <= 0) return; // Prevent adding items without a name or with invalid quantity

    const docRef = doc(collection(firestore, 'inventory'), itemName.toLowerCase());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { name: itemName, quantity: quantity + itemQuantity, category: itemCategory, expiration: itemExpiration });
    } else {
      await setDoc(docRef, { name: itemName, quantity: itemQuantity, category: itemCategory, expiration: itemExpiration });
    }
    await updateInventory();
    handleClose();
  };

  const removeItem = async (name) => {
    const docRef = doc(collection(firestore, 'inventory'), name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { name, quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  useEffect(() => {
    const filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredInventory(filtered);
  }, [searchQuery, inventory]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setItemName('');
    setItemQuantity(1);
    setItemCategory('');
    setItemExpiration('');
    setOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 2,
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Pantry Tracker
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            onClick={handleOpen}
            startIcon={<AddShoppingCartIcon />}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            Add new item
          </Button>
          <TextField
            variant="outlined"
            placeholder="Search items"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon position="start" />
              ),
            }}
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              '& .MuiInputBase-input': {
                color: 'text.primary',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'text.primary',
                },
                '&:hover fieldset': {
                  borderColor: 'text.primary',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'text.primary',
                },
              },
            }}
          />
        </Stack>
        <Box
          width="100%"
          mt={4}
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
        >
          {filteredInventory.map(({ id, name, quantity }) => (
            <Box
              key={id}
              sx={{
                width: '100%',
                maxWidth: 600,
                padding: 2,
                backgroundColor: 'background.paper',
                borderRadius: 1,
                boxShadow: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="h6" color="text.primary">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h6" color="text.primary">
                Quantity: {quantity}
              </Typography>
              <Stack direction="row" spacing={1}>
              <IconButton color="primary" onClick={() => updateItem({ id, name, quantity })}>
  <AddIcon />
</IconButton>

                <IconButton color="secondary" onClick={() => removeItem(id)}>
                  <RemoveIcon />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Box>
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="background.paper"
            border="2px solid #bb86fc"
            boxShadow={10}
            p={4}
            display="flex"
            flexDirection="column"
            sx={{
              transform: "translate(-50%, -50%)",
              borderRadius: 2
            }}
          >
            <Typography variant="h6" color="text.primary">
              Add Item
            </Typography>
            <Stack width="100%" spacing={2} mt={2}>
              <TextField
                variant="outlined"
                label="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                fullWidth
              />
              <TextField
                variant="outlined"
                label="Quantity"
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                fullWidth
              />
              <TextField
                variant="outlined"
                label="Category"
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                fullWidth
              />
              <TextField
                variant="outlined"
                label="Expiration Date"
                type="date"
                value={itemExpiration}
                onChange={(e) => setItemExpiration(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="contained"
                onClick={addItem}
                sx={{ bgcolor: 'primary.main' }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
}
