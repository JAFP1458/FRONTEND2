import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, Link } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/Ibarra-Ecuador-transformed.jpeg";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Importación nombrada correcta

function Basic({ setToken }) {
  const [correoElectronico, setCorreoElectronico] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage("");

    axios
      .post("http://localhost:5000/login", { correoElectronico, contraseña })
      .then((response) => {
        const token = response.data.token;
        localStorage.setItem("token", token);
        setToken(token);
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.userRole;

        if (userRole === "Gestor") {
          navigate("/user-roles");
        } else if (userRole === "Operador") {
          navigate("/documentos");
        } else {
          navigate("/login");
        }
      })
      .catch((error) => {
        console.error("There was an error logging in!", error);
        if (error.response) {
          setErrorMessage(error.response.data.message || "Error en el inicio de sesión");
        } else if (error.request) {
          setErrorMessage("Error en el servidor. Inténtalo de nuevo más tarde.");
        } else {
          setErrorMessage("Error en el inicio de sesión");
        }
      });
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Iniciar sesión
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Correo Electrónico"
                fullWidth
                value={correoElectronico}
                onChange={(e) => setCorreoElectronico(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Contraseña"
                fullWidth
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Recordarme
              </MDTypography>
            </MDBox>
            {errorMessage && (
              <MDBox mt={2}>
                <MDTypography variant="caption" color="error">
                  {errorMessage}
                </MDTypography>
              </MDBox>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit">
                Iniciar sesión
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

Basic.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Basic;
