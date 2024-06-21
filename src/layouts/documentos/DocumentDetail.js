import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { TextField, MenuItem, Box, CircularProgress } from "@mui/material";

const DocumentDetail = ({ token }) => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateFields, setShowUpdateFields] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipoDocumentoId: "",
    file: null,
  });
  const [usuarioId, setUsuarioId] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsuarioId(response.data.usuarioID);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    const fetchDocument = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/documents/byId/${documentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { documento, versionesAnteriores } = response.data;
        setDocument(documento);
        setVersions(versionesAnteriores);
        setFormData({
          titulo: documento.titulo,
          descripcion: documento.descripcion,
          tipoDocumentoId: documento.tipodocumentoid,
        });
      } catch (error) {
        console.error("Error fetching document details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchDocument();
  }, [documentId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const formDataWithFile = new FormData();
    formDataWithFile.append("titulo", formData.titulo);
    formDataWithFile.append("descripcion", formData.descripcion);
    formDataWithFile.append("tipoDocumentoId", formData.tipoDocumentoId);
    formDataWithFile.append("usuarioId", usuarioId); // Incluir el usuarioId
    if (formData.file) {
      formDataWithFile.append("file", formData.file);
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/documents/${documentId}`,
        formDataWithFile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Documento actualizado correctamente");
      setShowUpdateFields(false);
      navigate("/documents"); // Navegar de regreso a la lista de documentos después de actualizar
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Error al actualizar el documento");
    }
  };

  const handleDownload = async (url) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/documents/descargar",
        { documentUrl: url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = url.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Error al descargar el documento");
    }
  };

  const handleDeleteVersion = async (versionId) => {
    try {
      await axios.delete(`http://localhost:5000/documents/versions/${versionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Versión eliminada correctamente");
      setVersions((prevVersions) =>
        prevVersions.filter((version) => version.versiondocumentoid !== versionId)
      );
    } catch (error) {
      console.error("Error deleting version:", error);
      alert("Error al eliminar la versión");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" component="h1" gutterBottom>
          Detalles del Documento
        </MDTypography>
        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : document ? (
          <MDBox mb={3}>
            {!showUpdateFields ? (
              <MDButton
                onClick={() => setShowUpdateFields(true)}
                color="primary"
                variant="contained"
                fullWidth
              >
                Actualizar Documento
              </MDButton>
            ) : (
              <>
                <TextField
                  label="Título"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  select
                  label="Tipo de Documento"
                  name="tipoDocumentoId"
                  value={formData.tipoDocumentoId}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="">Seleccionar Tipo</MenuItem>
                  <MenuItem value="1">Tipo 1</MenuItem>
                  <MenuItem value="2">Tipo 2</MenuItem>
                </TextField>
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                />
                <MDButton onClick={handleUpdate} color="primary" variant="contained" fullWidth>
                  Guardar Cambios
                </MDButton>
                <MDButton
                  onClick={() => setShowUpdateFields(false)}
                  color="secondary"
                  variant="contained"
                  fullWidth
                >
                  Cancelar
                </MDButton>
              </>
            )}
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
            <ul>
              {versions.map((version) => (
                <li key={version.versiondocumentoid}>
                  <a href="#" onClick={() => handleDownload(version.url_s3)}>
                    {new Date(version.fechacreacion).toLocaleString()}
                  </a>
                  <MDButton
                    onClick={() => handleDeleteVersion(version.versiondocumentoid)}
                    color="error"
                    size="small"
                  >
                    Eliminar
                  </MDButton>
                </li>
              ))}
            </ul>
          ) : (
            <MDTypography>No hay versiones anteriores</MDTypography>
          )}
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
};

DocumentDetail.propTypes = {
  token: PropTypes.string.isRequired,
};

export default DocumentDetail;
