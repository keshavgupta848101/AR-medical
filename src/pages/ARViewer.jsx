"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Slider,
  Button,
} from "@mui/material"
import {
  ArrowBack,
  Fullscreen,
  FullscreenExit,
  Settings,
  Layers,
  ZoomIn,
  ZoomOut,
  Refresh,
  Label,
  Visibility,
  Add,
  Edit,
  Delete,
} from "@mui/icons-material"
import api from "../services/api"

// Import AR.js and A-Frame via CDN in index.html
// <script src="https://aframe.io/releases/1.3.0/aframe.min.js"></script>
// <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>

function ARViewer() {
  const { imageId } = useParams()
  const navigate = useNavigate()
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const [rotationSpeed, setRotationSpeed] = useState(1)
  const [scale, setScale] = useState(1)
  const [editMode, setEditMode] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState(null)
  const [newLabelText, setNewLabelText] = useState("")

  const sceneRef = useRef(null)
  const arContainerRef = useRef(null)

  const isDashboard = window.location.pathname.includes("dashboard");

  useEffect(() => {
    // Load AR.js and A-Frame scripts dynamically if not already loaded
    if (!document.querySelector('script[src*="aframe.min.js"]')) {
      const aframeScript = document.createElement("script")
      aframeScript.src = "https://aframe.io/releases/1.3.0/aframe.min.js"
      document.head.appendChild(aframeScript)

      aframeScript.onload = () => {
        const arjsScript = document.createElement("script")
        arjsScript.src = "https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"
        document.head.appendChild(arjsScript)

        // Load additional components
        const extraComponentsScript = document.createElement("script")
        extraComponentsScript.textContent = `
          // Custom A-Frame component for label interaction
          AFRAME.registerComponent('label-click', {
            init: function() {
              this.el.addEventListener('click', () => {
                const labelId = this.el.getAttribute('data-label-id');
                const labelEvent = new CustomEvent('label-clicked', { 
                  detail: { labelId: labelId } 
                });
                document.dispatchEvent(labelEvent);
              });
            }
          });
          
          // Custom component for object dragging in edit mode
          AFRAME.registerComponent('draggable', {
            init: function() {
              this.el.addEventListener('mousedown', this.onMouseDown.bind(this));
              this.el.sceneEl.addEventListener('mousemove', this.onMouseMove.bind(this));
              this.el.sceneEl.addEventListener('mouseup', this.onMouseUp.bind(this));
              this.isDragging = false;
              this.previousPosition = new THREE.Vector3();
            },
            
            onMouseDown: function(evt) {
              if (!this.el.getAttribute('data-editable')) return;
              this.isDragging = true;
              this.previousPosition.copy(this.el.object3D.position);
              this.el.emit('dragstart');
            },
            
            onMouseMove: function(evt) {
              if (!this.isDragging) return;
              
              // Calculate movement based on camera position
              const camera = this.el.sceneEl.camera;
              const marker = document.querySelector('a-marker');
              if (!marker || !marker.object3D.visible) return;
              
              // Use raycasting to determine position on the marker plane
              const mouse = new THREE.Vector2(
                (evt.clientX / window.innerWidth) * 2 - 1,
                -(evt.clientY / window.innerHeight) * 2 + 1
              );
              
              const raycaster = new THREE.Raycaster();
              raycaster.setFromCamera(mouse, camera);
              
              const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
              const intersection = new THREE.Vector3();
              raycaster.ray.intersectPlane(plane, intersection);
              
              // Update position
              this.el.object3D.position.copy(intersection);
              this.el.emit('drag');
            },
            
            onMouseUp: function(evt) {
              if (!this.isDragging) return;
              this.isDragging = false;
              
              // Emit event with new position data
              const labelId = this.el.getAttribute('data-label-id');
              const position = this.el.object3D.position;
              const positionChangeEvent = new CustomEvent('position-changed', {
                detail: {
                  labelId: labelId,
                  position: { x: position.x, y: position.y, z: position.z }
                }
              });
              document.dispatchEvent(positionChangeEvent);
              
              this.el.emit('dragend');
            }
          });
        `
        document.head.appendChild(extraComponentsScript)

        arjsScript.onload = () => {
          fetchImage()
        }
      }
    } else {
      fetchImage()
    }

    // Event listeners for label interaction
    const handleLabelClick = (event) => {
      const labelId = event.detail.labelId
      if (image && image.labels) {
        const label = image.labels.find((l) => l._id === labelId)
        if (label) {
          setSelectedLabel(label)
        }
      }
    }

    const handlePositionChange = (event) => {
      const { labelId, position } = event.detail
      if (image && image.labels) {
        const updatedLabels = image.labels.map((label) => {
          if (label._id === labelId) {
            return { ...label, position }
          }
          return label
        })

        setImage({ ...image, labels: updatedLabels })

        // Save the updated position to the server
        api
          .put(`/images/${imageId}`, { labels: updatedLabels })
          .catch((err) => console.error("Failed to update label position:", err))
      }
    }

    document.addEventListener("label-clicked", handleLabelClick)
    document.addEventListener("position-changed", handlePositionChange)

    // Record session start time for analytics
    const sessionStart = Date.now()

    return () => {
      // Clean up event listeners
      document.removeEventListener("label-clicked", handleLabelClick)
      document.removeEventListener("position-changed", handlePositionChange)

      // Record session duration on component unmount
      const sessionDuration = (Date.now() - sessionStart) / 1000 // in seconds
      if (sessionDuration > 5 && imageId) {
        // Only log if session was longer than 5 seconds
        api
          .post(`/analytics/duration/${imageId}`, { duration: sessionDuration })
          .catch((err) => console.error("Failed to log session duration:", err))
      }

    }
  }, [imageId])

  const fetchImage = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/images/${imageId}`)
      setImage({
        ...response.data,
        labels: response.data.labels || [], // Default to an empty array if labels is undefined
      })

      // Log view for analytics
      await api.post(`/analytics/view/${imageId}`)

      // Initialize AR scene after image data is loaded
      setTimeout(() => {
        initializeAR()
        setLoading(false)
      }, 1000) // Small delay to ensure scripts are fully loaded
    } catch (err) {
      setError("Failed to load image")
      console.error(err)
      setLoading(false)
    }
  }

  const exitCleanup = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (image && !loading) {
      initializeAR()
    }

  }, [image, loading, showLabels, rotationSpeed, scale, editMode])

  const initializeAR = () => {
    if (!window.AFRAME) {
      console.log("A-Frame not loaded yet")
      return
    }

    if (!image) {
      console.log("Image data not loaded yet")
      return
    }

    if (sceneRef.current) {
      // Clear previous scene
      while (sceneRef.current.firstChild) {
        sceneRef.current.removeChild(sceneRef.current.firstChild)
      }

      // Create AR scene elements
      const scene = document.createElement("a-scene")
      scene.setAttribute("embedded", "")
      scene.setAttribute(
        "arjs",
        "sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;",
      )
      scene.setAttribute("renderer", "logarithmicDepthBuffer: true;")
      scene.setAttribute("vr-mode-ui", "enabled: false")

      // Create marker
      const marker = document.createElement("a-marker")
      marker.setAttribute("preset", "hiro")
      marker.setAttribute("id", "medical-marker")
      marker.setAttribute("emitevents", "true")

      // Add image or 3D model
      if (image?.modelUrl) {
        const model = document.createElement("a-entity")
        model.setAttribute("gltf-model", image.modelUrl)
        model.setAttribute("position", "0 0 0")
        model.setAttribute("rotation", "0 0 0")
        model.setAttribute("scale", `${scale} ${scale} ${scale}`)
        model.setAttribute(
          "animation",
          `property: rotation; to: 0 ${360 * rotationSpeed} 0; loop: true; dur: 10000; easing: linear;`,
        )
        marker.appendChild(model)
      } else {
        const imagePlane = document.createElement("a-image")
        imagePlane.setAttribute("src", image?.url)
        imagePlane.setAttribute("position", "0 0 0")
        imagePlane.setAttribute("rotation", "-90 0 0")
        imagePlane.setAttribute("width", 2 * scale)
        imagePlane.setAttribute("height", 2 * scale)
        imagePlane.setAttribute(
          "animation",
          rotationSpeed > 0
            ? `property: rotation; to: -90 ${360 * rotationSpeed} 0; loop: true; dur: 10000; easing: linear;`
            : "",
        )
        marker.appendChild(imagePlane)
      }

      // Add labels if enabled
      if (showLabels && image.labels && image.labels.length > 0) {
        image.labels.forEach((label, index) => {
          const labelContainer = document.createElement("a-entity")
          labelContainer.setAttribute("position", `${label.position.x} ${label.position.y} ${label.position.z}`)
          labelContainer.setAttribute("data-label-id", label._id || `label-${index}`)
          labelContainer.setAttribute("data-editable", editMode ? "true" : "false")

          if (editMode) {
            labelContainer.setAttribute("draggable", "")
          }

          const labelBackground = document.createElement("a-plane")
          labelBackground.setAttribute("position", "0 0 0")
          labelBackground.setAttribute("rotation", "-90 0 0")
          labelBackground.setAttribute("color", "black")
          labelBackground.setAttribute("opacity", "0.7")
          labelBackground.setAttribute("width", "0.8")
          labelBackground.setAttribute("height", "0.2")
          labelBackground.setAttribute("label-click", "")

          const labelText = document.createElement("a-text")
          labelText.setAttribute("value", label.text)
          labelText.setAttribute("position", "0 0.01 0")
          labelText.setAttribute("rotation", "-90 0 0")
          labelText.setAttribute("color", "white")
          labelText.setAttribute("width", "2")
          labelText.setAttribute("align", "center")

          if (label.targetPosition) {
            const line = document.createElement("a-entity")
            line.setAttribute(
              "line",
              `start: 0 0 0; end: ${label.targetPosition.x - label.position.x} ${label.targetPosition.y - label.position.y
              } ${label.targetPosition.z - label.position.z}; color: white`,
            )
            labelContainer.appendChild(line)
          }

          labelContainer.appendChild(labelBackground)
          labelContainer.appendChild(labelText)
          marker.appendChild(labelContainer)
        })
      }

      // Add camera
      const camera = document.createElement("a-entity")
      camera.setAttribute("camera", "")
      scene.appendChild(camera)

      // Add marker to scene
      scene.appendChild(marker)

      // Add scene to DOM
      sceneRef.current.appendChild(scene)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (arContainerRef.current.requestFullscreen) {
        arContainerRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen)
  }

  const handleRotationSpeedChange = (event, newValue) => {
    setRotationSpeed(newValue)
  }

  const handleScaleChange = (event, newValue) => {
    setScale(newValue)
  }

  const resetView = () => {
    initializeAR()
  }

  const toggleEditMode = () => {
    setEditMode(!editMode)
    setSelectedLabel(null)
  }

  const addNewLabel = () => {
    if (!image) return

    const newLabel = {
      _id: `label-${Date.now()}`,
      text: "New Label",
      position: { x: 0, y: 0.5, z: 0.1 },
    }

    const updatedLabels = [...(image.labels || []), newLabel]
    setImage({ ...image, labels: updatedLabels })
    setSelectedLabel(newLabel)

    // Save to server
    api
      .put(`/images/${imageId}`, { labels: updatedLabels })
      .catch((err) => console.error("Failed to add new label:", err))
  }

  const updateLabelText = () => {
    if (!selectedLabel || !newLabelText) return

    const updatedLabels = image.labels.map((label) => {
      if (label._id === selectedLabel._id) {
        return { ...label, text: newLabelText }
      }
      return label
    })

    setImage({ ...image, labels: updatedLabels })
    setSelectedLabel(null)
    setNewLabelText("")

    // Save to server
    api
      .put(`/images/${imageId}`, { labels: updatedLabels })
      .catch((err) => console.error("Failed to update label text:", err))
  }

  const deleteLabel = () => {
    if (!selectedLabel) return

    const updatedLabels = image.labels.filter((label) => label._id !== selectedLabel._id)
    setImage({ ...image, labels: updatedLabels })
    setSelectedLabel(null)

    // Save to server
    api
      .put(`/images/${imageId}`, { labels: updatedLabels })
      .catch((err) => console.error("Failed to delete label:", err))
  }

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box className="p-4">
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => navigate("/dashboard")} className="mt-4">
          Back to Dashboard
        </Button>
      </Box>
    )
  }
  if (loading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    )
  }
  return (
    <Box className="h-screen flex flex-col">
      <Box className="bg-black text-white p-4 flex justify-between items-center">
        <IconButton color="inherit" onClick={() => navigate("/dashboard")}>
          <ArrowBack />
        </IconButton>

        <Typography variant="h6" className="flex-grow text-center">
          {image.title}
        </Typography>

        <Box>
          <Tooltip title={editMode ? "Exit Edit Mode" : "Edit Mode"}>
            <IconButton color="inherit" onClick={toggleEditMode}>
              <Edit color={editMode ? "primary" : "inherit"} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton color="inherit" onClick={toggleSettings}>
              <Settings />
            </IconButton>
          </Tooltip>

          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <IconButton color="inherit" onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box ref={arContainerRef} className="flex-grow relative bg-black">
        <div ref={sceneRef} className="w-full h-full"></div>

        {/* Instructions overlay */}
        <Paper className="absolute bottom-4 left-4 right-4 p-2 bg-black bg-opacity-70 text-white">
          <Typography variant="body2" className="text-center">
            Point your camera at a Hiro marker to view the AR model
            {editMode && " - Edit mode active: drag labels to reposition"}
          </Typography>
        </Paper>

        {/* Edit mode controls */}
        {editMode && (
          <Box className="absolute top-4 right-4 flex flex-col gap-2">
            <Tooltip title="Add Label">
              <Fab size="small" color="primary" onClick={addNewLabel}>
                <Add />
              </Fab>
            </Tooltip>

            {selectedLabel && (
              <>
                <Paper className="p-2 bg-black bg-opacity-70 text-white">
                  <Typography variant="caption">Editing: {selectedLabel.text}</Typography>
                  <Box className="flex mt-1">
                    <input
                      type="text"
                      value={newLabelText}
                      onChange={(e) => setNewLabelText(e.target.value)}
                      placeholder="New label text"
                      className="flex-grow p-1 text-black"
                    />
                    <IconButton size="small" color="primary" onClick={updateLabelText}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={deleteLabel}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              </>
            )}
          </Box>
        )}

        {/* Reset view button */}
        <Fab color="primary" className="absolute bottom-20 right-4" onClick={resetView}>
          <Refresh />
        </Fab>

        {/* Zoom controls */}
        <Box className="absolute bottom-20 left-4 flex flex-col">
          <Fab size="small" color="primary" onClick={() => {
            setScale(Math.max(scale - 0.1, 0.5));
            navigate("/dashboard");
            exitCleanup();
          }}>
            <ArrowBack />
          </Fab>

          <Fab size="small" color="primary" onClick={() => setScale(Math.min(scale + 0.1, 3))} className="mb-2">
            <ZoomIn />
          </Fab>

          <Fab size="small" color="primary" onClick={() => setScale(Math.max(scale - 0.1, 0.5))}>
            <ZoomOut />
          </Fab>
        </Box>
      </Box>

      {/* Settings drawer */}
      <Drawer anchor="right" open={settingsOpen} onClose={toggleSettings}>
        <Box className="w-64 p-4">
          <Typography variant="h6" className="mb-4">
            AR Settings
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <Label />
              </ListItemIcon>
              <ListItemText primary="Show Labels" />
              <Switch checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} color="primary" />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Refresh />
              </ListItemIcon>
              <ListItemText primary="Rotation Speed" secondary={`${rotationSpeed}x`} />
            </ListItem>

            <Box className="px-4 pb-2">
              <Slider
                value={rotationSpeed}
                min={0}
                max={2}
                step={0.1}
                onChange={handleRotationSpeedChange}
                valueLabelDisplay="auto"
              />
            </Box>

            <ListItem>
              <ListItemIcon>
                <ZoomIn />
              </ListItemIcon>
              <ListItemText primary="Scale" secondary={`${scale.toFixed(1)}x`} />
            </ListItem>

            <Box className="px-4 pb-2">
              <Slider
                value={scale}
                min={0.5}
                max={3}
                step={0.1}
                onChange={handleScaleChange}
                valueLabelDisplay="auto"
              />
            </Box>

            {image.layers && image.layers.length > 0 && (
              <>
                <ListItem>
                  <ListItemIcon>
                    <Layers />
                  </ListItemIcon>
                  <ListItemText primary="Layer Visibility" />
                </ListItem>

                {image.layers.map((layer, index) => (
                  <ListItem key={index} className="pl-8">
                    <ListItemIcon>
                      <Visibility fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={layer.name} />
                    <Switch
                      checked={layer.visible !== false}
                      onChange={(e) => {
                        // Update layer visibility
                        const updatedLayers = [...image.layers]
                        updatedLayers[index].visible = e.target.checked
                        setImage({ ...image, layers: updatedLayers })

                        // Save to server
                        api
                          .put(`/images/${imageId}`, { layers: updatedLayers })
                          .catch((err) => console.error("Failed to update layer visibility:", err))
                      }}
                      color="primary"
                    />
                  </ListItem>
                ))}
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </Box>
  )
}

export default ARViewer

