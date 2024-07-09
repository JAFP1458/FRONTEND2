import Profile from 'layouts/profile';
import SignIn from 'layouts/authentication/sign-in';
import UserRolesComponent from 'layouts/user-roles/UserRolesComponent';
import Documentos from 'layouts/documentos/documentos';
import DocumentDetail from 'layouts/documentos/DocumentDetail';
import Icon from '@mui/material/Icon';

const routes = [
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
    name: 'Documentos',
    key: 'documentos',
    icon: <Icon fontSize="small">description</Icon>,
    route: '/documentos',
    component: Documentos,
  },
  {
    type: 'collapse',
    name: 'Detalle de Documento',
    key: 'document-detail',
    route: '/documents/:documentId',
    icon: <Icon fontSize="small">description</Icon>,
    component: DocumentDetail,
  },
];

export default routes;
