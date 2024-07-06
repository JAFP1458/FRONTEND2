import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import Avatar from '@mui/material/Avatar';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import breakpoints from 'assets/theme/base/breakpoints';
import backgroundImage from 'assets/images/bg-profile.jpeg';
import axios from 'axios';

function Header({ children }) {
  const [tabsOrientation, setTabsOrientation] = useState('horizontal');
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation('vertical')
        : setTabsOrientation('horizontal');
    }

    window.addEventListener('resize', handleTabsOrientation);
    handleTabsOrientation();

    return () => window.removeEventListener('resize', handleTabsOrientation);
  }, [tabsOrientation]);

  useEffect(() => {
    const fetchUserData = async () => {
      const usuarioID = localStorage.getItem('usuarioID');
      const token = localStorage.getItem('token');
      if (usuarioID && token) {
        try {
          const response = await axios.get(
            `http://localhost:5000/users/details/${usuarioID}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUserData(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleSetTabValue = (event, newValue) => setTabValue(newValue);

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="25rem" // Aumentar la altura mínima
        borderRadius="xl"
        sx={{
          backgroundImage: ({
            functions: { rgba, linearGradient },
            palette: { gradients },
          }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden',
        }}
      />
      <Card
        sx={{
          position: 'relative',
          mt: -8,
          mx: 3,
          py: 2,
          px: 2,
          width: '90%', // Aumentar el ancho del Card
          mx: 'auto', // Centrar el Card horizontalmente
        }}
      >
        <Grid container spacing={3} alignItems="center" justifyContent="center">
          <Grid item>
            <Avatar
              alt="default-profile-icon"
              sx={{ width: 80, height: 80, borderRadius: '50%' }} // Aumentar el tamaño del Avatar
            >
              <Icon fontSize="large">person</Icon>{' '}
              {/* Aumentar el tamaño del icono */}
            </Avatar>
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={1} lineHeight={1}>
              <MDTypography variant="h4" fontWeight="medium">
                {' '}
                {/* Aumentar el tamaño del texto */}
                {userData.nombre || 'N/A'}
              </MDTypography>
              <MDTypography variant="h6" color="text" fontWeight="regular">
                {' '}
                {/* Aumentar el tamaño del texto */}
                {userData.correoelectronico || 'N/A'}
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
        {children}
      </Card>
    </MDBox>
  );
}

Header.defaultProps = {
  children: '',
};

Header.propTypes = {
  children: PropTypes.node,
};

export default Header;
