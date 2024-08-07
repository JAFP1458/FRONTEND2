import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import DataTable from 'examples/Tables/DataTable';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { FormGroup, Label } from 'reactstrap';
import PropTypes from 'prop-types';

const UserRolesComponent = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [newUser, setNewUser] = useState({
    nombre: '',
    correoElectronico: '',
    contraseña: '',
    rolID: '',
  });
  const [errors, setErrors] = useState({});
  const [updateErrors, setUpdateErrors] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState({ nombreRol: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchAssignments();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        'https://api-gd-senescyt-09b56187292c.herokuapp.com/users',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        'https://api-gd-senescyt-09b56187292c.herokuapp.com/roles',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchAssignments = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        'https://api-gd-senescyt-09b56187292c.herokuapp.com/roles/asignaciones',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchUserDetails = async userId => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `https://api-gd-senescyt-09b56187292c.herokuapp.com/users/details/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedUser(response.data);
      setUpdateModalOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleUserChange = e => {
    const { name, value } = e.target;
    let errorMessages = { ...errors };

    if (name === 'nombre') {
      if (!/^[A-Za-z\s]+$/.test(value)) {
        errorMessages.nombre = 'El nombre debe contener solo letras y espacios';
      } else {
        delete errorMessages.nombre;
      }
    }

    if (name === 'correoElectronico') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMessages.correoElectronico = 'El correo electrónico no es válido';
      } else {
        delete errorMessages.correoElectronico;
      }
    }

    if (name === 'contraseña') {
      if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(
          value
        )
      ) {
        errorMessages.contraseña =
          'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial';
      } else {
        delete errorMessages.contraseña;
      }
    }

    setNewUser(prevState => ({
      ...prevState,
      [name]: value,
    }));

    setErrors(errorMessages);
  };

  const handleUpdateUserChange = e => {
    const { name, value } = e.target;
    let errorMessages = { ...updateErrors };

    if (name === 'nombre') {
      if (!/^[A-Za-z\s]+$/.test(value)) {
        errorMessages.nombre = 'El nombre debe contener solo letras y espacios';
      } else {
        delete errorMessages.nombre;
      }
    }

    if (name === 'correoElectronico') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMessages.correoElectronico = 'El correo electrónico no es válido';
      } else {
        delete errorMessages.correoElectronico;
      }
    }

    if (name === 'contraseña' && value) {
      if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(
          value
        )
      ) {
        errorMessages.contraseña =
          'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial';
      } else {
        delete errorMessages.contraseña;
      }
    }

    setSelectedUser(prevState => ({
      ...prevState,
      [name]: value,
    }));

    setUpdateErrors(errorMessages);
  };

  const handleRoleChange = e => {
    const { name, value } = e.target;
    setNewRole(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const addUser = async () => {
    if (Object.keys(errors).length > 0) {
      return; // Prevent form submission if there are validation errors
    }

    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'https://api-gd-senescyt-09b56187292c.herokuapp.com/users/register',
        newUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUsers();
      fetchAssignments();
      setModalOpen(false);
    } catch (error) {
      console.error('Error adding user and assigning role:', error);
    }
  };

  const updateUser = async () => {
    if (Object.keys(updateErrors).length > 0) {
      return; // Prevent form submission if there are validation errors
    }

    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `https://api-gd-senescyt-09b56187292c.herokuapp.com/users/${selectedUser.usuarioid}`,
        {
          nombre: selectedUser.nombre,
          correoElectronico: selectedUser.correoelectronico,
          contraseña: selectedUser.contraseña || '', // Enviar la contraseña solo si se ha cambiado
          rolID: selectedUser.rolid,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUsers();
      fetchAssignments();
      setUpdateModalOpen(false);
    } catch (error) {
      console.error('Error updating user and role:', error);
    }
  };

  const toggleUserStatus = async user => {
    const token = localStorage.getItem('token');
    const newStatus = !user.estado;
    try {
      await axios.put(
        `https://api-gd-senescyt-09b56187292c.herokuapp.com/users/${user.usuarioid}/status`,
        { estado: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const toggleUpdateModal = () => {
    setUpdateModalOpen(!updateModalOpen);
  };

  const openUpdateModal = user => {
    fetchUserDetails(user.usuarioid);
  };

  const getRoleName = userID => {
    const assignment = assignments.find(
      assignment => assignment.usuarioid === userID
    );
    if (assignment) {
      const role = roles.find(role => role.rolid === assignment.rolid);
      return role ? role.nombrerol : 'Sin rol';
    }
    return 'Sin rol';
  };

  const filteredUsers = users.filter(
    user =>
      user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.correoelectronico.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <DashboardLayout>
      <MDBox py={3}>
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <MDBox display="flex" alignItems="center">
            <MDTypography variant="h6" component="div" mr={2}>
              Buscar
            </MDTypography>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Nombre o correo"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </MDBox>
          <MDButton color="primary" onClick={toggleModal}>
            + Agregar Usuario
          </MDButton>
        </MDBox>

        {loading ? (
          <MDBox display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </MDBox>
        ) : (
          <DataTable
            table={{
              columns: [
                { Header: 'Nombre', accessor: 'nombre', width: '20%' },
                {
                  Header: 'Correo Electrónico',
                  accessor: 'correoElectronico',
                  width: '25%',
                },
                { Header: 'Rol', accessor: 'rol', width: '20%' },
                { Header: 'Estado', accessor: 'estado', width: '15%' },
                { Header: '', accessor: 'action', width: '20%' },
              ],
              rows: filteredUsers.map(user => ({
                nombre: user.nombre,
                correoElectronico: user.correoelectronico,
                rol: getRoleName(user.usuarioid),
                estado: (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={user.estado}
                        onChange={() => toggleUserStatus(user)}
                        color="primary"
                      />
                    }
                    label={user.estado ? 'Activo' : 'Inactivo'}
                  />
                ),
                action: (
                  <MDButton
                    color="info"
                    size="small"
                    onClick={() => openUpdateModal(user)}
                  >
                    Editar
                  </MDButton>
                ),
              })),
            }}
            entriesPerPage={false}
            showTotalEntries={false}
            noEndBorder
          />
        )}
      </MDBox>
      <Dialog open={modalOpen} onClose={toggleModal}>
        <DialogTitle>Agregar Usuario</DialogTitle>
        <DialogContent>
          <FormGroup>
            <Label for="nombre">Nombre</Label>
            <TextField
              fullWidth
              type="text"
              name="nombre"
              id="nombre"
              value={newUser.nombre}
              onChange={handleUserChange}
              error={!!errors.nombre}
              helperText={errors.nombre}
            />
          </FormGroup>
          <FormGroup>
            <Label for="correoElectronico">Correo Electrónico</Label>
            <TextField
              fullWidth
              type="email"
              name="correoElectronico"
              id="correoElectronico"
              value={newUser.correoElectronico}
              onChange={handleUserChange}
              error={!!errors.correoElectronico}
              helperText={errors.correoElectronico}
            />
          </FormGroup>
          <FormGroup>
            <Label for="contraseña">Contraseña</Label>
            <TextField
              fullWidth
              type="password"
              name="contraseña"
              id="contraseña"
              value={newUser.contraseña}
              onChange={handleUserChange}
              error={!!errors.contraseña}
              helperText={
                errors.contraseña ||
                'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial.'
              }
            />
          </FormGroup>
          <FormGroup>
            <Label for="rolID">Rol</Label>
            <TextField
              select
              fullWidth
              name="rolID"
              id="rolID"
              value={newUser.rolID}
              onChange={handleUserChange}
              error={!!errors.rolID}
              helperText={errors.rolID}
            >
              <MenuItem value="">Seleccionar Rol</MenuItem>
              {roles.map(role => (
                <MenuItem key={role.rolid} value={role.rolid}>
                  {role.nombrerol}
                </MenuItem>
              ))}
            </TextField>
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={addUser} disabled={Object.keys(errors).length > 0}>
            Agregar
          </MDButton>
          <MDButton onClick={toggleModal}>Cancelar</MDButton>
        </DialogActions>
      </Dialog>
      {selectedUser && (
        <Dialog open={updateModalOpen} onClose={toggleUpdateModal}>
          <DialogTitle>Actualizar Usuario</DialogTitle>
          <DialogContent>
            <FormGroup>
              <Label for="nombre">Nombre</Label>
              <TextField
                fullWidth
                type="text"
                name="nombre"
                id="nombre"
                value={selectedUser.nombre}
                onChange={handleUpdateUserChange}
                error={!!updateErrors.nombre}
                helperText={updateErrors.nombre}
              />
            </FormGroup>
            <FormGroup>
              <Label for="correoElectronico">Correo Electrónico</Label>
              <TextField
                fullWidth
                type="email"
                name="correoElectronico"
                id="correoElectronico"
                value={selectedUser.correoelectronico}
                onChange={handleUpdateUserChange}
                error={!!updateErrors.correoElectronico}
                helperText={updateErrors.correoElectronico}
              />
            </FormGroup>
            <FormGroup>
              <Label for="contraseña">
                Contraseña (dejar en blanco si no desea cambiarla)
              </Label>
              <TextField
                fullWidth
                type="password"
                name="contraseña"
                id="contraseña"
                onChange={handleUpdateUserChange}
                error={!!updateErrors.contraseña}
                helperText={
                  updateErrors.contraseña ||
                  'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial.'
                }
              />
            </FormGroup>
            <FormGroup>
              <Label for="rolID">Rol</Label>
              <TextField
                select
                fullWidth
                name="rolID"
                id="rolID"
                value={selectedUser.rolid || ''}
                onChange={handleUpdateUserChange}
                error={!!updateErrors.rolID}
                helperText={updateErrors.rolID}
              >
                <MenuItem value="">Seleccionar Rol</MenuItem>
                {roles.map(role => (
                  <MenuItem key={role.rolid} value={role.rolid}>
                    {role.nombrerol}
                  </MenuItem>
                ))}
              </TextField>
            </FormGroup>
          </DialogContent>
          <DialogActions>
            <MDButton
              onClick={updateUser}
              disabled={Object.keys(updateErrors).length > 0}
            >
              Actualizar
            </MDButton>
            <MDButton onClick={toggleUpdateModal}>Cancelar</MDButton>
          </DialogActions>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

UserRolesComponent.propTypes = {
  token: PropTypes.string.isRequired, // Asegúrate de que token es requerido
};

export default UserRolesComponent;
