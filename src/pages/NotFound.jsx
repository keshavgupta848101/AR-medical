import { Link } from "react-router-dom"
import { Container, Typography, Button, Box } from "@mui/material"
import { Home } from "@mui/icons-material"

function NotFound() {
  return (
    <Container maxWidth="md" className="py-16">
      <Box className="text-center">
        <Typography variant="h1" component="h1" className="text-9xl font-bold text-gray-200">
          404
        </Typography>

        <Typography variant="h4" component="h2" className="mt-4 mb-6">
          Page Not Found
        </Typography>

        <Typography variant="body1" className="mb-8 text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </Typography>

        <Button variant="contained" color="primary" component={Link} to="/dashboard" startIcon={<Home />}>
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  )
}

export default NotFound

