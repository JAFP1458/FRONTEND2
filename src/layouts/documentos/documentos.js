import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CircularProgress,
  TextField,
  Collapse,
  Box,
  Grid,
  Paper,
  MenuItem,
  Button,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import DataTable from 'examples/Tables/DataTable';
import { isValid } from 'date-fns';
import { io } from 'socket.io-client';

const Documentos = ({ token }) => {
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    titulo: '',
    usuarioCorreo: '',
    tipoDocumentoId: '',
    fechaInicio: '',
    fechaFin: '',
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    titulo: '',
    usuarioCorreo: '',
    tipoDocumentoId: '',
    fechaInicio: '',
    fechaFin: '',
  });
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [documentToShare, setDocumentToShare] = useState(null);
  const [shareDetails, setShareDetails] = useState({
    recipientUserId: '',
    permissions: '',
  });
  const navigate = useNavigate();
  const theme = useTheme();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        _page: page + 1,
        _limit: rowsPerPage,
        ...searchFilters,
      };

      const response = await axios.get('http://localhost:5000/documents', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Error fetching documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage, searchFilters]);

  useEffect(() => {
    fetchDocumentTypes();
    fetchDocuments();
  }, [token, page, rowsPerPage, fetchDocuments]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/documents/notifications',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setNotifications(response.data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Si estás usando WebSockets para notificaciones en tiempo real
    const socket = io('http://localhost:5000');
    socket.on('notification', notification => {
      setNotifications(prevNotifications => [
        notification,
        ...prevNotifications,
      ]);
    });

    return () => socket.disconnect();
  }, [token]);

  const fetchDocumentTypes = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/documents/types',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDocumentTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleToggleFilters = () => {
    setFilterOpen(!filterOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/authentication/sign-in');
  };

  const handleViewDocument = documentId => {
    navigate(`/documents/${documentId}`);
  };

  const handleDownloadDocument = async url => {
    try {
      const response = await axios.post(
        'http://localhost:5000/documents/descargar',
        { documentUrl: url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );
      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = url.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error al descargar el documento');
    }
  };

  const handleDeleteDocument = async () => {
    try {
      await axios.delete('http://localhost:5000/documents/borrar', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          documentUrl: documentToDelete,
        },
      });
      alert('Documento eliminado correctamente');
      setConfirmOpen(false);
      setDocumentToDelete(null);
      fetchDocuments(); // Refrescar la lista de documentos
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error al eliminar el documento');
    }
  };

  const handleOpenConfirmDialog = documentUrl => {
    setDocumentToDelete(documentUrl);
    setConfirmOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmOpen(false);
    setDocumentToDelete(null);
  };

  const handleOpenShareDialog = documentId => {
    console.log('Document to share:', documentId); // Debugging
    setDocumentToShare(documentId);
    setShareOpen(true);
  };

  const handleCloseShareDialog = () => {
    setShareOpen(false);
    setDocumentToShare(null);
    setShareDetails({ recipientUserId: '', permissions: '' });
  };

  const handleShareChange = e => {
    const { name, value } = e.target;
    setShareDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleShareDocument = async () => {
    if (!documentToShare) {
      alert('No se ha seleccionado ningún documento para compartir.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/documents/share',
        {
          documentId: documentToShare,
          recipientUserId: shareDetails.recipientUserId,
          permissions: shareDetails.permissions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Documento compartido correctamente');
      setShareOpen(false);
      setDocumentToShare(null);
      setShareDetails({ recipientUserId: '', permissions: '' });
    } catch (error) {
      console.error('Error sharing document:', error);
      alert('Error al compartir el documento');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    setSearchFilters(filters);
  };

  return (
    <DashboardLayout>
      <MDBox>
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box display="flex" alignItems="center">
            <Button
              variant="text"
              color="primary"
              onClick={handleToggleFilters}
              startIcon={filterOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {filterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
          </Box>
        </MDBox>

        <Collapse in={filterOpen}>
          <Paper
            elevation={3}
            style={{
              padding: '16px',
              marginBottom: '16px',
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Título"
                  name="titulo"
                  value={filters.titulo}
                  onChange={handleFilterChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{
                    style: { color: theme.palette.text.primary },
                  }}
                  inputProps={{
                    style: { color: theme.palette.text.primary },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.palette.text.primary,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    color: theme.palette.text.primary,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Correo Electrónico"
                  name="usuarioCorreo"
                  value={filters.usuarioCorreo}
                  onChange={handleFilterChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{
                    style: { color: theme.palette.text.primary },
                  }}
                  inputProps={{
                    style: { color: theme.palette.text.primary },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.palette.text.primary,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    color: theme.palette.text.primary,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  sx={{ color: theme.palette.text.primary }}
                >
                  <InputLabel
                    style={{ color: theme.palette.text.primary }}
                    sx={{
                      '&.Mui-focused': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    Tipo de Documento
                  </InputLabel>
                  <Select
                    label="Tipo de Documento"
                    name="tipoDocumentoId"
                    value={filters.tipoDocumentoId}
                    onChange={handleFilterChange}
                    style={{ color: theme.palette.text.primary }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.palette.text.primary,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Seleccionar Tipo</MenuItem>
                    {documentTypes.map(type => (
                      <MenuItem
                        key={type.tipodocumentoid}
                        value={type.tipodocumentoid}
                      >
                        {type.descripcion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Fecha Inicio"
                  type="date"
                  name="fechaInicio"
                  value={filters.fechaInicio}
                  onChange={handleFilterChange}
                  InputLabelProps={{
                    shrink: true,
                    style: { color: theme.palette.text.primary },
                  }}
                  inputProps={{
                    style: { color: theme.palette.text.primary },
                  }}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.palette.text.primary,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    color: theme.palette.text.primary,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Fecha Fin"
                  type="date"
                  name="fechaFin"
                  value={filters.fechaFin}
                  onChange={handleFilterChange}
                  InputLabelProps={{
                    shrink: true,
                    style: { color: theme.palette.text.primary },
                  }}
                  inputProps={{
                    style: { color: theme.palette.text.primary },
                  }}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.palette.text.primary,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    color: theme.palette.text.primary,
                  }}
                />
              </Grid>
            </Grid>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button variant="contained" color="info" onClick={handleSearch}>
                Buscar
              </Button>
            </Box>
          </Paper>
        </Collapse>

        {loading ? (
          <MDBox display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </MDBox>
        ) : error ? (
          <MDBox display="flex" justifyContent="center" py={5}>
            <MDTypography variant="h6" color="error">
              {error}
            </MDTypography>
          </MDBox>
        ) : (
          <>
            <DataTable
              table={{
                columns: [
                  { Header: 'Título', accessor: 'titulo', width: '20%' },
                  {
                    Header: 'Descripción',
                    accessor: 'descripcion',
                    width: '20%',
                  },
                  {
                    Header: 'Usuario',
                    accessor: 'usuariocorreo',
                    width: '20%',
                  },
                  {
                    Header: 'Tipo de Documento',
                    accessor: 'tipodocumentonombre',
                    width: '20%',
                  },
                  {
                    Header: 'Fecha de Creación',
                    accessor: 'fechacreacion',
                    width: '10%',
                  },
                  { Header: 'Acciones', accessor: 'action', width: '10%' },
                ],
                rows: Array.isArray(documents)
                  ? documents.map(document => {
                      const date = new Date(document.fechacreacion);
                      return {
                        titulo: document.titulo,
                        descripcion: document.descripcion,
                        usuariocorreo: document.usuariocorreo,
                        tipodocumentonombre: document.tipodocumentonombre,
                        fechacreacion: isValid(date)
                          ? date.toLocaleString()
                          : 'Fecha no válida',
                        action: (
                          <>
                            <MDButton
                              color="info"
                              size="small"
                              onClick={() =>
                                handleViewDocument(document.documentoid)
                              }
                              style={{ marginRight: '10px' }}
                            >
                              Ver Detalles
                            </MDButton>
                            <MDButton
                              color="primary"
                              size="small"
                              onClick={() =>
                                handleDownloadDocument(document.url)
                              }
                              style={{ marginRight: '10px' }}
                            >
                              Descargar
                            </MDButton>
                            <MDButton
                              color="error"
                              size="small"
                              onClick={() =>
                                handleOpenConfirmDialog(document.url)
                              }
                              style={{ marginRight: '10px' }}
                            >
                              Eliminar
                            </MDButton>
                            <MDButton
                              color="secondary"
                              size="small"
                              onClick={() =>
                                handleOpenShareDialog(document.documentoid)
                              }
                              style={{ marginRight: '10px' }}
                            >
                              Compartir
                            </MDButton>
                          </>
                        ),
                      };
                    })
                  : [],
              }}
              entriesPerPage={false}
              showTotalEntries={false}
              noEndBorder
            />
            <TablePagination
              component="div"
              count={documents.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Documentos por página"
              rowsPerPageOptions={[10, 20, 50]}
            />
          </>
        )}
      </MDBox>

      <Dialog open={confirmOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este documento?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteDocument} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={shareOpen} onClose={handleCloseShareDialog}>
        <DialogTitle>Compartir Documento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Introduzca el ID del destinatario y los permisos para compartir el
            documento.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="recipientUserId"
            label="ID del Destinatario"
            type="text"
            fullWidth
            value={shareDetails.recipientUserId}
            onChange={handleShareChange}
          />
          <TextField
            margin="dense"
            name="permissions"
            label="Permisos"
            type="text"
            fullWidth
            value={shareDetails.permissions}
            onChange={handleShareChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleShareDocument} color="secondary">
            Compartir
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

Documentos.propTypes = {
  token: PropTypes.string.isRequired,
};

export default Documentos;
