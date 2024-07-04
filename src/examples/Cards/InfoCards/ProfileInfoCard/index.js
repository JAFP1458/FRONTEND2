import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import Icon from '@mui/material/Icon';
import Avatar from '@mui/material/Avatar';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import colors from 'assets/theme/base/colors';
import typography from 'assets/theme/base/typography';

function ProfileInfoCard({ title, info, action, shadow }) {
  const defaultImage = 'assets/images/default-profile.jpg'; // Ruta a la imagen por defecto

  return (
    <Card sx={{ height: '100%', boxShadow: !shadow && 'none' }}>
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        pt={2}
        px={2}
      >
        <MDTypography
          variant="h6"
          fontWeight="medium"
          textTransform="capitalize"
        >
          {title}
        </MDTypography>
        <MDTypography
          component={Link}
          to={action.route}
          variant="body2"
          color="secondary"
        >
          <Tooltip title={action.tooltip} placement="top">
            <Icon>edit</Icon>
          </Tooltip>
        </MDTypography>
      </MDBox>
      <MDBox display="flex" alignItems="center" p={2}>
        <Avatar
          src={info.profileImage || defaultImage}
          sx={{ width: 56, height: 56, mr: 2 }}
        />
        <MDBox>
          <MDBox>
            <MDTypography variant="button" fontWeight="bold">
              Name: &nbsp;
            </MDTypography>
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;{info.fullName}
            </MDTypography>
          </MDBox>
          <MDBox>
            <MDTypography variant="button" fontWeight="bold">
              Email: &nbsp;
            </MDTypography>
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;{info.email}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

ProfileInfoCard.defaultProps = {
  shadow: true,
};

ProfileInfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  info: PropTypes.shape({
    fullName: PropTypes.string,
    email: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
  action: PropTypes.shape({
    route: PropTypes.string.isRequired,
    tooltip: PropTypes.string.isRequired,
  }).isRequired,
  shadow: PropTypes.bool,
};

export default ProfileInfoCard;
