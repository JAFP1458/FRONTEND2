import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  IconButton,
} from '@mui/material';
import { Delete } from '@mui/icons-material';

const DocumentDetail = ({ token }) => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/documents/byId/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { documento, versionesAnteriores } = response.data;
      setDocuments(documento[0]);
      setVersions(versionesAnteriores);
    } catch (error) {
      console.error('Error fetching document details:', error);
      if (error.response && error.response.status === 401) {
        navigate('/authentication/sign-in');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/documents/audit?documentId=${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAuditLogs(response.data);
      setAuditOpen(true);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [documentId, token, navigate]);

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleUpdate = async () => {
    if (!file) {
      alert('Por favor, seleccione un archivo para actualizar.');
      return;
    }

    const formDataWithFile = new FormData();
    formDataWithFile.append('file', file);

    try {
      await axios.put(
        `http://localhost:5000/documents/${documentId}`,
        formDataWithFile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      alert('Documento actualizado correctamente');
      closeUpdateDialog();
      fetchDocument();
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Error al actualizar el documento');
    }
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

      if (!response.data) {
        throw new Error('No data received');
      }

      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });

      const downloadLink = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadLink;
      const fileName = decodeURIComponent(url.split('/').pop());
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadLink);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error al descargar el documento');
    }
  };

  const handleDownloadVersion = async url => {
    try {
      const response = await axios.post(
        'http://localhost:5000/documents/descargarversion',
        { versionUrl: url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      if (!response.data) {
        throw new Error('No data received');
      }

      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });

      const downloadLink = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadLink;
      const fileName = decodeURIComponent(url.split('/').pop());
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadLink);
    } catch (error) {
      console.error('Error downloading document version:', error);
      alert('Error al descargar la versión del documento');
    }
  };

  const handleDeleteDocument = async () => {
    try {
      await axios.delete('http://localhost:5000/documents/borrar', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          documentUrl: documents.url,
        },
      });
      alert('Documento eliminado correctamente');
      navigate('/documents');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error al eliminar el documento');
    }
  };

  const handleDeleteVersion = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/documents/versions/${versionToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setVersions(
        versions.filter(
          version => version.versiondocumentoid !== versionToDelete
        )
      );
      setConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting document version:', error);
      alert('Error al eliminar la versión del documento');
    }
  };

  const openConfirmDialog = versionId => {
    setVersionToDelete(versionId);
    setConfirmOpen(true);
  };

  const closeConfirmDialog = () => {
    setConfirmOpen(false);
    setVersionToDelete(null);
  };

  const openUpdateDialog = () => {
    setUpdateOpen(true);
  };

  const closeUpdateDialog = () => {
    setUpdateOpen(false);
    setFile(null);
  };

  const openConfirmDeleteDocumentDialog = () => {
    setConfirmDeleteOpen(true);
  };

  const closeConfirmDeleteDocumentDialog = () => {
    setConfirmDeleteOpen(false);
  };

  return (
    <DashboardLayout>
      <MDBox py={3}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : documents ? (
          <>
            <MDBox mb={3}>
              <MDTypography variant="h4" component="h1" gutterBottom>
                Detalle del documento: {documents.titulo}
              </MDTypography>
            </MDBox>
            <MDBox mb={3}>
              <MDButton
                onClick={openUpdateDialog}
                color="primary"
                variant="contained"
                fullWidth
              >
                Actualizar Documento
              </MDButton>
            </MDBox>
            <MDBox mb={3}>
              <MDButton
                color="primary"
                size="small"
                onClick={() => handleDownloadDocument(documents.url)}
                style={{ marginRight: '10px' }}
              >
                Descargar
              </MDButton>
              <MDButton
                color="error"
                size="small"
                onClick={openConfirmDeleteDocumentDialog}
                style={{ marginRight: '10px' }}
              >
                Eliminar
              </MDButton>
              <MDButton color="info" size="small" onClick={fetchAuditLogs}>
                Ver Historial
              </MDButton>
            </MDBox>
            <MDBox>
              <MDTypography variant="h6" component="h2" gutterBottom>
                Versiones Anteriores
              </MDTypography>
              {versions.length > 0 ? (
                <MDBox>
                  {versions.map(version => (
                    <MDBox
                      key={version.versiondocumentoid}
                      display="flex"
                      alignItems="center"
                      mb={1}
                    >
                      <MDTypography variant="body2" mr={2}>
                        {new Date(version.fechacreacion).toLocaleString()}
                      </MDTypography>
                      <MDButton
                        color="info"
                        onClick={() => handleDownloadVersion(version.url_s3)}
                        style={{ marginRight: '10px' }}
                      >
                        Descargar Versión
                      </MDButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          openConfirmDialog(version.versiondocumentoid)
                        }
                      >
                        <Delete />
                      </IconButton>
                    </MDBox>
                  ))}
                </MDBox>
              ) : (
                <MDTypography>No hay versiones anteriores</MDTypography>
              )}
            </MDBox>
          </>
        ) : (
          <MDTypography variant="h6" color="error">
            No se encontró el documento
          </MDTypography>
        )}
      </MDBox>

      <Dialog open={confirmOpen} onClose={closeConfirmDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar esta versión del documento?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteVersion} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={updateOpen} onClose={closeUpdateDialog}>
        <DialogTitle>Actualizar Documento</DialogTitle>
        <DialogContent>
          <input type="file" onChange={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUpdateDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDeleteOpen}
        onClose={closeConfirmDeleteDocumentDialog}
      >
        <DialogTitle>Confirmar Eliminación del Documento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este documento?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDeleteDocumentDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteDocument} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={auditOpen} onClose={() => setAuditOpen(false)}>
        <DialogTitle>Historial de Auditoría</DialogTitle>
        <DialogContent>
          <MDBox>
            {auditLogs.map((log, index) => (
              <MDTypography key={index} variant="body2" mb={1}>
                {log.detalles}
              </MDTypography>
            ))}
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuditOpen(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

DocumentDetail.propTypes = {
  token: PropTypes.string.isRequired,
};

export default DocumentDetail;
