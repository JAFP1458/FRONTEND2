import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
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
import { Delete, CloudUpload } from '@mui/icons-material';

const DocumentDetail = ({ token }) => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState(null);

  useEffect(() => {
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
        setDocument(documento);
        setVersions(versionesAnteriores);
      } catch (error) {
        console.error('Error fetching document details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, token]);

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
      navigate('/documents'); // Navegar de regreso a la lista de documentos después de actualizar
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Error al actualizar el documento');
    }
  };

  const handleDownload = async url => {
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : document ? (
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
        ) : (
          <MDTypography variant="h6" color="error">
            No se encontró el documento
          </MDTypography>
        )}
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
                    onClick={() => handleDownload(version.url_s3)}
                    style={{ marginRight: '10px' }}
                  >
                    Descargar
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
      </MDBox>

      <Dialog open={confirmOpen} onClose={closeConfirmDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar esta versión del documento?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={closeConfirmDialog} color="primary">
            Cancelar
          </MDButton>
          <MDButton onClick={handleDeleteVersion} color="error">
            Eliminar
          </MDButton>
        </DialogActions>
      </Dialog>

      <Dialog open={updateOpen} onClose={closeUpdateDialog}>
        <DialogTitle>Actualizar Documento</DialogTitle>
        <DialogContent>
          <input type="file" onChange={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <MDButton onClick={closeUpdateDialog} color="primary">
            Cancelar
          </MDButton>
          <MDButton onClick={handleUpdate} color="primary">
            Actualizar
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

DocumentDetail.propTypes = {
  token: PropTypes.string.isRequired,
};

export default DocumentDetail;
