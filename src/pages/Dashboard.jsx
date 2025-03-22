"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material"
import { Add, ViewInAr, AccessTime } from "@mui/icons-material"
import { useAuth } from "../contexts/AuthContext"
import Navbar from "../components/Navbar"
import api from "../services/api"

function Dashboard() {
  const { user } = useAuth()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await api.get("/images")
        setImages(response.data)
      } catch (err) {
        setError("Failed to load images")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Filter images based on tab selection
  const filteredImages =
    tabValue === 0
      ? images
      : tabValue === 1
        ? images.filter((img) => img.isFavorite)
        : images.filter((img) => img.recentlyViewed)

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" className="py-8">
        <Box className="flex justify-between items-center mb-6">
          <Typography variant="h4" component="h1">
            Welcome, {user?.name}
          </Typography>
          <Button variant="contained" color="primary" component={Link} to="/upload" startIcon={<Add />}>
            Upload New Image
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="image tabs">
            <Tab label="All Images" />
            <Tab label="Favorites" />
            <Tab label="Recently Viewed" />
          </Tabs>
        </Box>

        {loading ? (
          <Box className="flex justify-center items-center h-64">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" className="text-center my-8">
            {error}
          </Typography>
        ) : filteredImages.length === 0 ? (
          <Box className="text-center my-12">
            <Typography variant="h6" color="textSecondary">
              {tabValue === 0
                ? "You haven't uploaded any images yet."
                : tabValue === 1
                  ? "You don't have any favorite images yet."
                  : "You haven't viewed any images recently."}
            </Typography>
            {tabValue === 0 && (
              <Button variant="contained" color="primary" component={Link} to="/upload" className="mt-4">
                Upload Your First Image
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={4}>
            {filteredImages.map((image) => (
              <Grid item key={image._id} xs={12} sm={6} md={4}>
                <Card className="h-full flex flex-col">
                  <CardMedia
                    component="img"
                    height="200"
                    image={image.thumbnailUrl || "/placeholder-image.jpg"}
                    alt={image.title}
                    className="h-48 object-cover"
                  />
                  <CardContent className="flex-grow">
                    <Typography gutterBottom variant="h6" component="div">
                      {image.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {image.description || "No description provided"}
                    </Typography>
                    <Box className="flex items-center mt-2">
                      <AccessTime fontSize="small" className="mr-1" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Uploaded {new Date(image.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      component={Link}
                      to={`/ar/${image._id}`}
                      startIcon={<ViewInAr />}
                    >
                      View in AR
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  )
}

export default Dashboard

