import UserRolesComponent from 'layouts/user-roles/UserRolesComponent';
import Profile from 'layouts/profile';
import SignIn from 'layouts/authentication/sign-in';
import Icon from '@mui/material/Icon';

const adminRoutes = [
  {
    type: 'collapse',
    name: 'User Roles',
    key: 'user-roles',
    icon: <Icon fontSize="small">people</Icon>,
    route: '/user-roles',
    component: UserRolesComponent,
  },
  {
    type: 'collapse',
    name: 'Profile',
    key: 'profile',
    icon: <Icon fontSize="small">person</Icon>,
    route: '/profile',
    component: Profile,
  },
  {
    type: 'collapse',
    name: 'Sign In',
    key: 'sign-in',
    icon: <Icon fontSize="small">login</Icon>,
    route: '/authentication/sign-in',
    component: SignIn,
  },
];

export default adminRoutes;
