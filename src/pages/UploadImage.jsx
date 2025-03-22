"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Tabs,
  Tab,
} from "@mui/material"
import { CloudUpload, ViewInAr } from "@mui/icons-material"
import Navbar from "../components/Navbar"
import api from "../services/api"

function UploadImage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [file, setFile] = useState(null)
  const [modelFile, setModelFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [uploadType, setUploadType] = useState(0) // 0 for image, 1 for 3D model

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (uploadType === 0) {
        setFile(selectedFile)
      } else {
        setModelFile(selectedFile)
      }

      // Create preview for images
      if (uploadType === 0 && selectedFile.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        setPreview(null)
      }
    }
  }

  const handleTabChange = (event, newValue) => {
    setUploadType(newValue)
    setFile(null)
    setModelFile(null)
    setPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (uploadType === 0 && !file) {
      return setError("Please select an image to upload")
    }

    if (uploadType === 1 && !modelFile) {
      return setError("Please select a 3D model to upload")
    }

    setLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("category", category)

    if (uploadType === 0) {
      formData.append("image", file)
    } else {
      formData.append("model", modelFile)
    }

    try {
      await api.post("/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setSuccess("Content uploaded successfully!")

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload content")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: "anatomy", label: "Anatomy" },
    { value: "pathology", label: "Pathology" },
    { value: "radiology", label: "Radiology" },
    { value: "histology", label: "Histology" },
    { value: "other", label: "Other" },
  ]

  return (
    <>
      <Navbar />
      <Container maxWidth="md" className="py-8">
        <Paper elevation={3} className="p-6">
          <Typography variant="h5" component="h1" className="mb-6 text-center">
            Upload Content for AR
          </Typography>

          <Tabs value={uploadType} onChange={handleTabChange} centered className="mb-4">
            <Tab label="Upload Image" />
            <Tab label="Upload 3D Model" />
          </Tabs>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" className="mb-4">
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Box className="space-y-4">
                <TextField
                  label="Title"
                  variant="outlined"
                  fullWidth
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                    {categories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select the medical category</FormHelperText>
                </FormControl>
              </Box>

              <Box className="flex flex-col items-center justify-center">
                <Box
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  {preview ? (
                    <img
                      src={preview || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-48 max-w-full mb-4 rounded"
                    />
                  ) : (
                    <>
                      {uploadType === 0 ? (
                        <CloudUpload className="text-gray-400 mb-4" style={{ fontSize: 60 }} />
                      ) : (
                        <ViewInAr className="text-gray-400 mb-4" style={{ fontSize: 60 }} />
                      )}
                    </>
                  )}

                  <Typography variant="body1" className="text-center mb-2">
                    {uploadType === 0
                      ? file
                        ? file.name
                        : "Click to select an image"
                      : modelFile
                        ? modelFile.name
                        : "Click to select a 3D model"}
                  </Typography>

                  <Typography variant="caption" color="textSecondary" className="text-center">
                    {uploadType === 0 ? "Supported formats: JPG, PNG, JPEG" : "Supported formats: GLB, GLTF"}
                  </Typography>

                  <input
                    type="file"
                    id="file-upload"
                    accept={uploadType === 0 ? "image/*" : ".glb,.gltf"}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </Box>
              </Box>
            </Box>

            <Box className="mt-6 flex justify-end">
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/dashboard")}
                className="mr-2"
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Uploading..." : "Upload Content"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </>
  )
}

export default UploadImage

