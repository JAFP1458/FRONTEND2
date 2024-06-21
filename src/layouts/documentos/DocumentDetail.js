import React, { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Importa PropTypes
import { useParams } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { TextField, MenuItem } from "@mui/material";

const DocumentDetail = ({ token }) => {
  const { documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [versions, setVersions] = useState([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipoDocumentoId: "",
  });

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/documents/${documentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDocument(response.data.documento);
        setVersions(response.data.versionesAnteriores);
        setFormData({
          titulo: response.data.documento.titulo,
          descripcion: response.data.documento.descripcion,
          tipoDocumentoId: response.data.documento.tipodocumentoid,
        });
      } catch (error) {
        console.error("Error fetching document details:", error);
      }
    };

    fetchDocument();
  }, [documentId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/documents/${documentId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Documento actualizado correctamente");
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Error al actualizar el documento");
    }
  };

  const handleDownload = async (url) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/documents/download",
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" component="h1" gutterBottom>
          Detalles del Documento
        </MDTypography>
        {document && (
          <MDBox mb={3}>
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
            <MDButton onClick={handleUpdate} color="primary" variant="contained" fullWidth>
              Actualizar
            </MDButton>
            <MDButton
              onClick={() => handleDownload(document.url)}
              color="primary"
              variant="contained"
              fullWidth
            >
              Descargar Documento
            </MDButton>
          </MDBox>
        )}
        <MDBox>
          <MDTypography variant="h6" component="h2" gutterBottom>
            Versiones Anteriores
          </MDTypography>
          <ul>
            {versions.map((version) => (
              <li key={version.versiondocumentoid}>
                <a href="#" onClick={() => handleDownload(version.url_s3)}>
                  {version.fechacreacion}
                </a>
              </li>
            ))}
          </ul>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
};

DocumentDetail.propTypes = {
  token: PropTypes.string.isRequired,
};

export default DocumentDetail;
