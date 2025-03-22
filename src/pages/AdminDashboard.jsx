"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
} from "@mui/material"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import Navbar from "../components/Navbar"
import api from "../services/api"

function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [analytics, setAnalytics] = useState({
    users: [],
    images: [],
    viewStats: [],
    timeStats: [],
    categoryStats: [],
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [usersResponse, imagesResponse, viewStatsResponse, timeStatsResponse, categoryStatsResponse] =
          await Promise.all([
            api.get("/admin/users"),
            api.get("/admin/images"),
            api.get("/admin/analytics/views"),
            api.get("/admin/analytics/time"),
            api.get("/admin/analytics/categories"),
          ])

        setAnalytics({
          users: usersResponse.data,
          images: imagesResponse.data,
          viewStats: viewStatsResponse.data,
          timeStats: timeStatsResponse.data,
          categoryStats: categoryStatsResponse.data,
        })
      } catch (err) {
        setError("Failed to load analytics data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  if (loading) {
    return (
      <>
        <Navbar />
        <Container className="py-8 flex justify-center items-center" style={{ minHeight: "80vh" }}>
          <CircularProgress />
        </Container>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container className="py-8">
          <Alert severity="error">{error}</Alert>
        </Container>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" className="py-8">
        <Typography variant="h4" component="h1" className="mb-6">
          Admin Dashboard
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
            <Tab label="Overview" />
            <Tab label="Users" />
            <Tab label="Images" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        {tabValue === 0 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h3">{analytics.users.length}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Images
                  </Typography>
                  <Typography variant="h3">{analytics.images.length}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Views
                  </Typography>
                  <Typography variant="h3">{analytics.viewStats.reduce((sum, item) => sum + item.count, 0)}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Avg. Time Spent
                  </Typography>
                  <Typography variant="h3">
                    {Math.round(
                      analytics.timeStats.reduce((sum, item) => sum + item.avgDuration, 0) /
                        (analytics.timeStats.length || 1),
                    )}
                    s
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper className="p-4">
                <Typography variant="h6" className="mb-4">
                  Most Viewed Images
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.viewStats.slice(0, 5)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Views" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper className="p-4">
                <Typography variant="h6" className="mb-4">
                  Categories Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="category"
                    >
                      {analytics.categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Users Tab */}
        {tabValue === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Images</TableCell>
                  <TableCell>Last Active</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{user.imageCount}</TableCell>
                    <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Images Tab */}
        {tabValue === 2 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Uploaded By</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Avg. Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.images.map((image) => (
                  <TableRow key={image._id}>
                    <TableCell>{image.title}</TableCell>
                    <TableCell>{image.category}</TableCell>
                    <TableCell>{image.uploadedBy}</TableCell>
                    <TableCell>{new Date(image.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{image.views}</TableCell>
                    <TableCell>{Math.round(image.avgViewDuration)}s</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Analytics Tab */}
        {tabValue === 3 && (
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Paper className="p-4">
                <Typography variant="h6" className="mb-4">
                  Views Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={analytics.viewStats.map((item) => ({
                      ...item,
                      date: new Date(item.date).toLocaleDateString(),
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Views" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper className="p-4">
                <Typography variant="h6" className="mb-4">
                  Average Time Spent (seconds)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.timeStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgDuration" name="Seconds" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper className="p-4">
                <Typography variant="h6" className="mb-4">
                  User Engagement by Day
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { day: "Monday", users: 24 },
                      { day: "Tuesday", users: 30 },
                      { day: "Wednesday", users: 42 },
                      { day: "Thursday", users: 35 },
                      { day: "Friday", users: 28 },
                      { day: "Saturday", users: 15 },
                      { day: "Sunday", users: 12 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" name="Active Users" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  )
}

export default AdminDashboard

