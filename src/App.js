import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  BrowserRouter as Router,
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Icon from '@mui/material/Icon';
import MDBox from 'components/MDBox';
import Sidenav from 'examples/Sidenav';
import Configurator from 'examples/Configurator';
import theme from 'assets/theme';
import themeRTL from 'assets/theme/theme-rtl';
import themeDark from 'assets/theme-dark';
import themeDarkRTL from 'assets/theme-dark/theme-rtl';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import routes from 'routes';
import {
  useMaterialUIController,
  setMiniSidenav,
  setOpenConfigurator,
} from 'context';
import brandWhite from 'assets/images/Logo-senescyt.png';
import brandDark from 'assets/images/Logo-senescyt.png';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar'; // Asegúrate de importar esto

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    const cacheRtl = createCache({
      key: 'rtl',
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () =>
    setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    document.body.setAttribute('dir', direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = allRoutes =>
    allRoutes.map(route => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        const Component = route.component;
        return (
          <Route
            exact
            path={route.route}
            element={<Component token={token} setToken={setToken} />}
            key={route.key}
          />
        );
      }

      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: 'pointer' }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return direction === 'rtl' ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {layout === 'dashboard' && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={
                (transparentSidenav && !darkMode) || whiteSidenav
                  ? brandDark
                  : brandWhite
              }
              brandName="G.D. SENESCYT"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        {layout === 'vr' && <Configurator />}
        <Routes>
          {getRoutes(routes)}
          <Route path="/" element={<Navigate to="/authentication/sign-in" />} />
          <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === 'dashboard' && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={
              (transparentSidenav && !darkMode) || whiteSidenav
                ? brandDark
                : brandWhite
            }
            brandName="G.D. SENESCYT"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {configsButton}
          <DashboardNavbar token={token} />{' '}
          {/* Asegúrate de que esto esté importado */}
        </>
      )}
      {layout === 'vr' && <Configurator />}
      <Routes>
        {getRoutes(routes)}
        <Route path="/" element={<Navigate to="/authentication/sign-in" />} />
        <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
      </Routes>
    </ThemeProvider>
  );
}
