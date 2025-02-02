'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Button,
  Stack,
  TextField,
  Box,
  FormControl,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TableFooter,
} from '@mui/material';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

// Define the type for a sticker
interface Sticker {
  _id: string;
  code: string;
  file_path: string;
}

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [stickers, setStickers] = useState<Sticker[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 4;

  useEffect(() => {
    fetchStickers().catch((error) => {
      console.error('Error fetching stickers:', error);
    });
  }, []);

  const fetchStickers = async (): Promise<void> => {
    try {
      const res = await axios.get<{ data: Sticker[] }>(`${API_BASE_URL}/stickers`);
      setStickers(res.data.data);
    } catch (error) {
      console.error('Error fetching stickers:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFile(event.target.files?.[0] ?? null);
  };

  const handleUpload = async (): Promise<void> => {
    if (!file) {
      toast.error('Please select a file before uploading.');
      return;
    }
    const formData = new FormData();
    formData.append('image', file);
    formData.append('code', code);
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/sticker`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Successfully Uploaded');
      await fetchStickers(); // Refresh table
    } catch (error) {
      console.error('Error uploading sticker:', error);
      toast.error('Failed to upload sticker');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/sticker/${id}`);
      toast.warn('Deleted successfully');
      setStickers((prevStickers) => prevStickers.filter((sticker) => sticker._id !== id));
    } catch (error) {
      console.error('Error deleting sticker:', error);
      toast.error('Failed to delete sticker');
    }
  };

  // Pagination Calculations
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = stickers.slice(indexOfFirstRow, indexOfLastRow);

  const nextPage = () => {
    if (currentPage < Math.ceil(stickers.length / rowsPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1); // Fixed: Use braces for clarity
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1); // Fixed: Use braces for clarity
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: '900px', mx: 'auto', p: 3 }}>
      <ToastContainer />
      <Typography variant="h4" component="h1" sx={{ textAlign: 'center', mt: 2 }}>
        Stickers
      </Typography>
      <Box display="flex" alignItems="center" gap={2} sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: 2, boxShadow: 1 }}>
        <FormControl fullWidth>
          <TextField label="Code Name" value={code} onChange={(e) => setCode(e.target.value)} fullWidth />
        </FormControl>
        <Button component="label" variant="contained" startIcon={<UploadIcon />}>
          Upload
          <VisuallyHiddenInput type="file" onChange={handleFileChange} />
        </Button>
        <Button variant="contained" color="primary" onClick={handleUpload} disabled={loading}>
          {loading ? 'Uploading...' : 'Submit'}
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1976d2' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Code</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Image</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRows.map((sticker, index) => (
              <TableRow key={sticker._id} hover>
                <TableCell>{indexOfFirstRow + index + 1}</TableCell>
                <TableCell>{sticker.code}</TableCell>
                <TableCell>
                  <img
                    src={`${process.env.NEXT_PUBLIC_APP_URL}/${sticker.file_path}`}
                    alt={sticker.code}
                    style={{ width: 50, height: 50 }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(sticker._id)} color="error">
                    <TrashIcon size={20} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Button onClick={prevPage} disabled={currentPage === 1} startIcon={<ArrowLeft />}>
                  Previous
                </Button>
                Page {currentPage} of {Math.ceil(stickers.length / rowsPerPage)}
                <Button
                  onClick={nextPage}
                  disabled={currentPage === Math.ceil(stickers.length / rowsPerPage)}
                  endIcon={<ArrowRight />}
                >
                  Next
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Stack>
  );
}
