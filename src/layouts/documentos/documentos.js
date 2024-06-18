import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable"; // Import DataTable
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import { FormGroup, Label } from "reactstrap";

const Documentos = ({ token }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    titulo: "",
    descripcion: "",
    tipoDocumentoId: "",
  });
  const [file, setFile] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [versions, setVersions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDocuments(response.data.rows);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentVersions = async (documentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/documents/byId/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedDocument(response.data.documento);
      setVersions(response.data.versionesAnteriores);
    } catch (error) {
      console.error("Error fetching document versions:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDocument((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const addDocument = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("titulo", newDocument.titulo);
    formData.append("descripcion", newDocument.descripcion);
    formData.append("tipoDocumentoId", newDocument.tipoDocumentoId);

    try {
      await axios.post("http://localhost:5000/documents", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      fetchDocuments();
      setModalOpen(false);
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const downloadDocument = async (documentUrl) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/documents/descargar",
        { documentUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      const decodedFileName = decodeURIComponent(documentUrl.split("/").pop());
      link.href = url;
      link.setAttribute("download", decodedFileName);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("There was an error downloading the document!", error);
    }
  };

  const deleteDocument = async (documentUrl) => {
    try {
      await axios.delete("http://localhost:5000/documents/borrar", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { documentUrl },
      });
      fetchDocuments();
    } catch (error) {
      console.error("There was an error deleting the document!", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/authentication/sign-in");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6" component="div">
            Documentos
          </MDTypography>
          <MDButton color="secondary" onClick={handleLogout}>
            Logout
          </MDButton>
          <MDButton color="primary" onClick={() => setModalOpen(true)}>
            + Agregar Documento
          </MDButton>
        </MDBox>

        {loading ? (
          <MDBox display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </MDBox>
        ) : (
          <DataTable
            table={{
              columns: [
                { Header: "Título", accessor: "titulo", width: "30%" },
                { Header: "Descripción", accessor: "descripcion", width: "40%" },
                { Header: "Fecha de Creación", accessor: "fechacreacion", width: "20%" },
                { Header: "Acciones", accessor: "action", width: "10%" },
              ],
              rows: documents.map((document) => ({
                titulo: document.titulo,
                descripcion: document.descripcion,
                fechacreacion: document.fechacreacion,
                action: (
                  <>
                    <MDButton
                      color="info"
                      size="small"
                      onClick={() => fetchDocumentVersions(document.documentoid)}
                      style={{ marginRight: "10px" }}
                    >
                      Ver Versiones
                    </MDButton>
                    <MDButton
                      color="primary"
                      size="small"
                      onClick={() => downloadDocument(document.url)}
                      style={{ marginRight: "10px" }}
                    >
                      Descargar
                    </MDButton>
                    <MDButton
                      color="error"
                      size="small"
                      onClick={() => deleteDocument(document.url)}
                    >
                      Eliminar
                    </MDButton>
                  </>
                ),
              })),
            }}
            entriesPerPage={false}
            showTotalEntries={false}
            noEndBorder
          />
        )}
      </MDBox>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Agregar Documento</DialogTitle>
        <DialogContent>
          <FormGroup>
            <Label for="titulo">Título</Label>
            <TextField
              fullWidth
              type="text"
              name="titulo"
              id="titulo"
              value={newDocument.titulo}
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="descripcion">Descripción</Label>
            <TextField
              fullWidth
              type="text"
              name="descripcion"
              id="descripcion"
              value={newDocument.descripcion}
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="tipoDocumentoId">Tipo de Documento</Label>
            <TextField
              fullWidth
              select
              name="tipoDocumentoId"
              id="tipoDocumentoId"
              value={newDocument.tipoDocumentoId}
              onChange={handleInputChange}
            >
              <MenuItem value="">Seleccionar Tipo</MenuItem>
              <MenuItem value="1">Tipo 1</MenuItem>
              <MenuItem value="2">Tipo 2</MenuItem>
            </TextField>
          </FormGroup>
          <FormGroup>
            <Label for="file">Archivo</Label>
            <TextField
              fullWidth
              type="file"
              name="file"
              id="file"
              onChange={handleFileChange}
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={addDocument}>Agregar</MDButton>
          <MDButton onClick={() => setModalOpen(false)}>Cancelar</MDButton>
        </DialogActions>
      </Dialog>

      {selectedDocument && (
        <Dialog open={Boolean(selectedDocument)} onClose={() => setSelectedDocument(null)}>
          <DialogTitle>Versiones Anteriores</DialogTitle>
          <DialogContent>
            <MDTypography variant="h6">{selectedDocument.titulo}</MDTypography>
            <MDTypography>{selectedDocument.descripcion}</MDTypography>
            <MDBox mt={3}>
              <MDTypography variant="h6">Versiones Anteriores</MDTypography>
              {versions.map((version) => (
                <MDBox key={version.versiondocumentoid}>
                  <MDTypography>Fecha de Creación: {version.fechacreacion}</MDTypography>
                  <MDButton
                    color="primary"
                    size="small"
                    onClick={() => downloadDocument(version.url_s3)}
                    style={{ marginRight: "10px" }}
                  >
                    Descargar
                  </MDButton>
                </MDBox>
              ))}
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setSelectedDocument(null)}>Cerrar</MDButton>
          </DialogActions>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

Documentos.propTypes = {
  token: PropTypes.string.isRequired,
};

export default Documentos;
