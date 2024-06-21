import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

const Documentos = ({ token }) => {
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    titulo: "",
    usuarioId: "",
    tipoDocumentoId: "",
    fechaInicio: "",
    fechaFin: "",
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchDocumentTypes();
    fetchDocuments();
  }, [token, page, rowsPerPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDocuments();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchUserId, filters]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        _page: page + 1,
        _limit: rowsPerPage,
      };
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params[key] = filters[key];
      });

      if (searchQuery) {
        params.titulo = searchQuery;
      }

      if (searchUserId) {
        params.usuarioId = searchUserId;
      }

      const response = await axios.get("http://localhost:5000/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });
      setDocuments(response.data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError("Error fetching documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/documents/types", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDocumentTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching document types:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleToggleFilters = () => {
    setFilterOpen(!filterOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/authentication/sign-in");
  };

  const handleViewDocument = (documentId) => {
    navigate(`/documents/${documentId}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <Button
              variant="text"
              color="primary"
              onClick={handleToggleFilters}
              startIcon={filterOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {filterOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
            </Button>
          </Box>
        </MDBox>

        <Collapse in={filterOpen}>
          <Paper
            elevation={3}
            style={{
              padding: "16px",
              marginBottom: "16px",
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Título"
                  name="titulo"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{
                    style: { color: theme.palette.text.primary },
                  }}
                  inputProps={{
                    style: { color: theme.palette.text.primary },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: theme.palette.text.primary,
                      },
                      "&:hover fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    color: theme.palette.text.primary,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Usuario ID"
                  name="usuarioId"
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{
                    style: { color: theme.palette.text.primary },
                  }}
                  inputProps={{
                    style: { color: theme.palette.text.primary },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: theme.palette.text.primary,
                      },
                      "&:hover fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                      "&.Mui-focused fieldset": {
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
                      "&.Mui-focused": {
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
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: theme.palette.text.primary,
                        },
                        "&:hover fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Seleccionar Tipo</MenuItem>
                    {documentTypes.map((type) => (
                      <MenuItem key={type.tipodocumentoid} value={type.tipodocumentoid}>
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
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: theme.palette.text.primary,
                      },
                      "&:hover fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                      "&.Mui-focused fieldset": {
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
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: theme.palette.text.primary,
                      },
                      "&:hover fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    color: theme.palette.text.primary,
                  }}
                />
              </Grid>
            </Grid>
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
                  { Header: "Título", accessor: "titulo", width: "20%" },
                  { Header: "Descripción", accessor: "descripcion", width: "20%" },
                  { Header: "Usuario", accessor: "usuariocorreo", width: "20%" },
                  { Header: "Tipo de Documento", accessor: "tipodocumentonombre", width: "20%" },
                  { Header: "Fecha de Creación", accessor: "fechacreacion", width: "10%" },
                  { Header: "Acciones", accessor: "action", width: "10%" },
                ],
                rows: Array.isArray(documents)
                  ? documents.map((document) => ({
                      titulo: document.titulo,
                      descripcion: document.descripcion,
                      usuariocorreo: document.usuariocorreo,
                      tipodocumentonombre: document.tipodocumentonombre,
                      fechacreacion: document.fechacreacion,
                      action: (
                        <>
                          <MDButton
                            color="info"
                            size="small"
                            onClick={() => handleViewDocument(document.documentoid)}
                            style={{ marginRight: "10px" }}
                          >
                            Ver Detalles
                          </MDButton>
                          <MDButton
                            color="primary"
                            size="small"
                            onClick={() => handleDownloadDocument(document.url)}
                            style={{ marginRight: "10px" }}
                          >
                            Descargar
                          </MDButton>
                          <MDButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteDocument(document.documentoid)}
                          >
                            Eliminar
                          </MDButton>
                        </>
                      ),
                    }))
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
    </DashboardLayout>
  );
};

Documentos.propTypes = {
  token: PropTypes.string.isRequired,
};

export default Documentos;
