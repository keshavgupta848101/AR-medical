"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material"
import { Menu as MenuIcon, Dashboard, Upload, Logout, AdminPanelSettings, Person, Close } from "@mui/icons-material"
import { useAuth } from "../contexts/AuthContext"

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    handleMenuClose()
    logout()
    navigate("/login")
  }

  const menuId = "primary-account-menu"
  const isMenuOpen = Boolean(anchorEl)

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      id={menuId}
      keepMounted
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
          mt: 1.5,
          "& .MuiAvatar-root": {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <MenuItem
        onClick={() => {
          handleMenuClose()
          navigate("/dashboard")
        }}
      >
        <ListItemIcon>
          <Dashboard fontSize="small" />
        </ListItemIcon>
        Dashboard
      </MenuItem>

      <MenuItem
        onClick={() => {
          handleMenuClose()
          navigate("/upload")
        }}
      >
        <ListItemIcon>
          <Upload fontSize="small" />
        </ListItemIcon>
        Upload Image
      </MenuItem>

      {user && user.isAdmin && (
        <MenuItem
          onClick={() => {
            handleMenuClose()
            navigate("/admin")
          }}
        >
          <ListItemIcon>
            <AdminPanelSettings fontSize="small" />
          </ListItemIcon>
          Admin Panel
        </MenuItem>
      )}

      <Divider />

      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  )

  const drawer = (
    <Box>
      <Box className="flex justify-between items-center p-4">
        <Typography variant="h6">Medical AR</Typography>
        <IconButton onClick={handleDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <List>
        <ListItem
          button
          onClick={() => {
            setMobileOpen(false)
            navigate("/dashboard")
          }}
        >
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem
          button
          onClick={() => {
            setMobileOpen(false)
            navigate("/upload")
          }}
        >
          <ListItemIcon>
            <Upload />
          </ListItemIcon>
          <ListItemText primary="Upload Image" />
        </ListItem>

        {user && user.isAdmin && (
          <ListItem
            button
            onClick={() => {
              setMobileOpen(false)
              navigate("/admin")
            }}
          >
            <ListItemIcon>
              <AdminPanelSettings />
            </ListItemIcon>
            <ListItemText primary="Admin Panel" />
          </ListItem>
        )}

        <Divider />

        <ListItem
          button
          onClick={() => {
            setMobileOpen(false)
            handleLogout()
          }}
        >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile ? (
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          ) : null}

          <Typography variant="h6" component={Link} to="/dashboard" className="text-white no-underline flex-grow">
            Medical AR Platform
          </Typography>

          {!isMobile && (
            <Box className="flex items-center">
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/upload">
                Upload
              </Button>
              {user && user.isAdmin && (
                <Button color="inherit" component={Link} to="/admin">
                  Admin
                </Button>
              )}
            </Box>
          )}

          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar className="w-8 h-8">{user && user.name ? user.name.charAt(0).toUpperCase() : <Person />}</Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {renderMenu}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}

export default Navbar

