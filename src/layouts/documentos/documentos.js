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
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    titulo: '',
    usuarioCorreo: '',
    tipoDocumentoId: '',
    areaId: '',
    fechaInicio: '',
    fechaFin: '',
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    titulo: '',
    usuarioCorreo: '',
    tipoDocumentoId: '',
    areaId: '',
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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    titulo: '',
    descripcion: '',
    tipoDocumentoId: '',
    areaId: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [userEmails, setUserEmails] = useState([]); // Nuevo estado para correos electrónicos

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

      const response = await axios.get(
        'https://api-gd-senescyt-09b56187292c.herokuapp.com/documents',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );
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
    fetchAreas();
    fetchDocuments();
  }, [token, page, rowsPerPage, fetchDocuments]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          'https://api-gd-senescyt-09b56187292c.herokuapp.com/documents/notifications',
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

    const socket = io('https://api-gd-senescyt-09b56187292c.herokuapp.com');
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
        'https://api-gd-senescyt-09b56187292c.herokuapp.com/documents/types',
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

  const fetchAreas = async () => {
    try {
      const response = await axios.get(
        'https://api-gd-senescyt-09b56187292c.herokuapp.com/documents/areas',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAreas(response.data || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchUserEmails = async () => {
    try {
      const response = await axios.get(
        'https://api-gd-senescyt-09b56187292c.herokuapp.com/users',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.map(user => ({
        id: user.usuarioid,
        email: user.correoelectronico,
      }));
    } catch (error) {
      console.error('Error fetching user emails:', error);
      return [];
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

  const handleOpenShareDialog = async documentId => {
    console.log('Document to share:', documentId);
    setDocumentToShare(documentId);
    const emails = await fetchUserEmails();
    setUserEmails(emails);
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
        'https://api-gd-senescyt-09b56187292c.herokuapp.com/documents/share',
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

  const handleAddDocumentOpen = () => {
    setAddDialogOpen(true);
  };

  const handleAddDocumentClose = () => {
    setAddDialogOpen(false);
    setNewDocument({
      titulo: '',
      descripcion: '',
      tipoDocumentoId: '',
      areaId: '',
    });
    setSelectedFile(null);
  };

  const handleAddDocumentChange = e => {
    const { name, value } = e.target;
    setNewDocument(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = e => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAddDocument = async () => {
    const usuarioId = localStorage.getItem('usuarioID');
    const formData = new FormData();
    formData.append('titulo', newDocument.titulo);
    formData.append('descripcion', newDocument.descripcion);
    formData.append('tipoDocumentoId', newDocument.tipoDocumentoId);
    formData.append('areaId', newDocument.areaId);
    formData.append('usuarioId', usuarioId);
    formData.append('file', selectedFile);

    try {
      await axios.post(
        'https://api-gd-senescyt-09b56187292c.herokuapp.com/documents',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      alert('Documento añadido correctamente');
      fetchDocuments();
      handleAddDocumentClose();
    } catch (error) {
      console.error('Error adding document:', error);
      alert('Error al añadir el documento');
    }
  };

  return (
    <DashboardLayout>
      <MDBox py={3}>
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <MDButton color="primary" onClick={handleAddDocumentOpen}>
            + Agregar Documento
          </MDButton>
          <Button
            variant="text"
            color="primary"
            onClick={handleToggleFilters}
            startIcon={filterOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {filterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
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
                    Área
                  </InputLabel>
                  <Select
                    label="Área"
                    name="areaId"
                    value={filters.areaId}
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
                    <MenuItem value="">Seleccionar Área</MenuItem>
                    {areas.map(area => (
                      <MenuItem key={area.areaid} value={area.areaid}>
                        {area.descripcion}
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
                    Header: 'Área',
                    accessor: 'areanombre',
                    width: '10%',
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
                        areanombre: document.areanombre,
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

      <Dialog open={shareOpen} onClose={handleCloseShareDialog}>
        <DialogTitle>Compartir Documento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Seleccione el correo electrónico del destinatario.
          </DialogContentText>
          <FormControl fullWidth margin="dense">
            <InputLabel>Correo del Destinatario</InputLabel>
            <Select
              name="recipientUserId"
              value={shareDetails.recipientUserId}
              onChange={handleShareChange}
            >
              {userEmails.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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

      <Dialog open={addDialogOpen} onClose={handleAddDocumentClose}>
        <DialogTitle>Agregar Documento</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="titulo"
            label="Título"
            type="text"
            fullWidth
            value={newDocument.titulo}
            onChange={handleAddDocumentChange}
          />
          <TextField
            margin="dense"
            name="descripcion"
            label="Descripción"
            type="text"
            fullWidth
            value={newDocument.descripcion}
            onChange={handleAddDocumentChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo de Documento</InputLabel>
            <Select
              name="tipoDocumentoId"
              value={newDocument.tipoDocumentoId}
              onChange={handleAddDocumentChange}
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
          <FormControl fullWidth margin="dense">
            <InputLabel>Área</InputLabel>
            <Select
              name="areaId"
              value={newDocument.areaId}
              onChange={handleAddDocumentChange}
            >
              <MenuItem value="">Seleccionar Área</MenuItem>
              {areas.map(area => (
                <MenuItem key={area.areaid} value={area.areaid}>
                  {area.descripcion}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <input type="file" onChange={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDocumentClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleAddDocument} color="primary">
            Agregar
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
