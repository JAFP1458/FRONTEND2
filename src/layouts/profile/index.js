import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import Header from 'layouts/profile/components/Header';
import ProfileInfoCard from 'examples/Cards/InfoCards/ProfileInfoCard';
import Footer from 'examples/Footer';

function Overview() {
  return (
    <DashboardLayout>
      <Header />
      <MDBox mb={2} />
    </DashboardLayout>
  );
}

export default Overview;
