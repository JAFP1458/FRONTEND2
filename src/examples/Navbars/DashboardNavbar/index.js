import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client'; // Asegúrate de importar socket.io-client correctamente
import PropTypes from 'prop-types';
import { useLocation, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Icon from '@mui/material/Icon';
import MDBox from 'components/MDBox';
import MDInput from 'components/MDInput';
import Breadcrumbs from 'examples/Breadcrumbs';
import NotificationItem from 'examples/Items/NotificationItem';
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from 'examples/Navbars/DashboardNavbar/styles';
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from 'context';

function DashboardNavbar({ absolute, light, isMini, token }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    transparentNavbar,
    fixedNavbar,
    openConfigurator,
    darkMode,
  } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [notifications, setNotifications] = useState([]); // Estado para notificaciones
  const route = useLocation().pathname.split('/').slice(1);

  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType('sticky');
    } else {
      setNavbarType('static');
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(
        dispatch,
        (fixedNavbar && window.scrollY === 0) || !fixedNavbar
      );
    }

    window.addEventListener('scroll', handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener('scroll', handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  // Fetch notificaciones desde el servidor
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

    // Configuración de WebSockets para recibir notificaciones en tiempo real
    const socket = io('http://localhost:5000'); // Utiliza io aquí
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('notification', notification => {
      setNotifications(prevNotifications => [
        notification,
        ...prevNotifications,
      ]);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => socket.disconnect();
  }, [token]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () =>
    setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = event => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      {notifications.length === 0 ? (
        <NotificationItem
          icon={<Icon>notifications</Icon>}
          title="No hay nuevas notificaciones"
        />
      ) : (
        notifications.map(notification => (
          <NotificationItem
            key={notification.notificacionid}
            icon={<Icon>notifications</Icon>}
            title={notification.titulo}
            onClick={() => handleViewDocument(notification.documentoid)}
          />
        ))
      )}
    </Menu>
  );

  const iconsStyle = ({
    palette: { dark, white, text },
    functions: { rgba },
  }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? 'absolute' : navbarType}
      color="inherit"
      sx={theme =>
        navbar(theme, { transparentNavbar, absolute, light, darkMode })
      }
    >
      <Toolbar sx={theme => navbarContainer(theme)}>
        <MDBox
          color="inherit"
          mb={{ xs: 1, md: 0 }}
          sx={theme => navbarRow(theme, { isMini })}
        >
          <Breadcrumbs
            icon="home"
            title={route[route.length - 1]}
            route={route}
            light={light}
          />
        </MDBox>
        {isMini ? null : (
          <MDBox sx={theme => navbarRow(theme, { isMini })}>
            <MDBox pr={1}>
              <MDInput label="Search here" />
            </MDBox>
            <MDBox color={light ? 'white' : 'inherit'}>
              <Link to="/authentication/sign-in/basic">
                <IconButton sx={navbarIconButton} size="small" disableRipple>
                  <Icon sx={iconsStyle}>account_circle</Icon>
                </IconButton>
              </Link>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? 'menu_open' : 'menu'}
                </Icon>
              </IconButton>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleConfiguratorOpen}
              >
                <Icon sx={iconsStyle}>settings</Icon>
              </IconButton>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                aria-controls="notification-menu"
                aria-haspopup="true"
                variant="contained"
                onClick={handleOpenMenu}
              >
                <Icon sx={iconsStyle}>notifications</Icon>
              </IconButton>
              {renderMenu()}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  token: PropTypes.string.isRequired, // Añadir la validación del prop token
};

export default DashboardNavbar;
