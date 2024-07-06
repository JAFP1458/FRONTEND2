import React, { useEffect, useState } from 'react';
import MDBox from 'components/MDBox';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import Header from 'layouts/profile/components/Header';

function Overview() {
  return (
    <DashboardLayout>
      <Header />
      <MDBox mb={2} />
    </DashboardLayout>
  );
}

export default Overview;
