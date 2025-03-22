"use client"
import { Link } from "react-router-dom"
import {
    Box,
    Button,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Stack,
    Paper,
    useMediaQuery,
    useTheme,
} from "@mui/material"
import { ViewInAr, School, MedicalServices, Psychology, CloudUpload, Login } from "@mui/icons-material"

const Home = () => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))

    const features = [
        {
            title: "Interactive 3D Models",
            description: "Convert 2D medical images into interactive 3D AR models for enhanced learning",
            icon: ViewInAr,
            color: "#3f51b5",
        },
        {
            title: "Educational Platform",
            description: "Designed specifically for medical students and educators",
            icon: School,
            color: "#f50057",
        },
        {
            title: "Detailed Annotations",
            description: "Add and view detailed labels on anatomical structures",
            icon: MedicalServices,
            color: "#00bcd4",
        },
        {
            title: "Enhanced Learning",
            description: "Improve understanding and retention through interactive visualization",
            icon: Psychology,
            color: "#4caf50",
        },
    ]

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    pt: { xs: 8, md: 12 },
                    pb: { xs: 10, md: 14 },
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h2"
                                component="h1"
                                fontWeight="bold"
                                sx={{ mb: 2, fontSize: { xs: "2.5rem", md: "3.5rem" } }}
                            >
                                Medical AR Platform
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                                Transform medical education with augmented reality
                            </Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <Button
                                    component={Link}
                                    to="/register"
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    sx={{ px: 4, py: 1.5 }}
                                >
                                    Get Started
                                </Button>
                                <Button
                                    component={Link}
                                    to="/login"
                                    variant="outlined"
                                    color="inherit"
                                    size="large"
                                    sx={{ px: 4, py: 1.5 }}
                                    startIcon={<Login />}
                                >
                                    Log In
                                </Button>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ display: { xs: "none", md: "block" } }}>
                            <Box
                                component="img"
                                src="/hero-image.png"
                                alt="Medical AR Visualization"
                                sx={{
                                    width: "100%",
                                    maxHeight: "400px",
                                    objectFit: "contain",
                                    filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.2))",
                                }}
                                onError={(e) => {
                                    e.target.src = "/placeholder.svg?height=400&width=600"
                                }}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box textAlign="center" mb={6}>
                    <Typography variant="h3" component="h2" gutterBottom>
                        Key Features
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: "700px", mx: "auto" }}>
                        Our platform provides powerful tools for medical students and educators to enhance learning through
                        augmented reality
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                                    "&:hover": {
                                        transform: "translateY(-8px)",
                                        boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
                                    },
                                }}
                                elevation={2}
                            >
                                <Box
                                    sx={{
                                        p: 2,
                                        display: "flex",
                                        justifyContent: "center",
                                        bgcolor: "background.paper",
                                    }}
                                >
                                    <feature.icon
                                        sx={{
                                            fontSize: 60,
                                            color: feature.color,
                                            p: 1,
                                            borderRadius: "50%",
                                            bgcolor: `${feature.color}15`,
                                        }}
                                    />
                                </Box>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h5" component="h3" align="center">
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" align="center">
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* How It Works Section */}
            <Box sx={{ bgcolor: "grey.100", py: 8 }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" component="h2" align="center" gutterBottom>
                        How It Works
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        align="center"
                        sx={{ maxWidth: "700px", mx: "auto", mb: 6 }}
                    >
                        Our platform makes it easy to transform medical education with augmented reality
                    </Typography>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center",
                                }}
                            >
                                <CloudUpload sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
                                <Typography variant="h5" component="h3" gutterBottom>
                                    1. Upload Images
                                </Typography>
                                <Typography variant="body1">
                                    Upload 2D medical images or 3D models to your personal dashboard
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center",
                                }}
                            >
                                <MedicalServices sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
                                <Typography variant="h5" component="h3" gutterBottom>
                                    2. Add Annotations
                                </Typography>
                                <Typography variant="body1">
                                    Label important structures and add educational notes to your models
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center",
                                }}
                            >
                                <ViewInAr sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
                                <Typography variant="h5" component="h3" gutterBottom>
                                    3. View in AR
                                </Typography>
                                <Typography variant="body1">
                                    Experience your medical models in augmented reality for enhanced learning
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box
                sx={{
                    bgcolor: "primary.dark",
                    color: "white",
                    py: 8,
                }}
            >
                <Container maxWidth="md" sx={{ textAlign: "center" }}>
                    <Typography variant="h4" component="h2" gutterBottom>
                        Ready to Transform Your Medical Education?
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 4, opacity: 0.9 }}>
                        Join thousands of medical students and educators already using our platform
                    </Typography>
                    <Button
                        component={Link}
                        to="/register"
                        variant="contained"
                        color="secondary"
                        size="large"
                        sx={{ px: 4, py: 1.5 }}
                    >
                        Get Started Now
                    </Button>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ bgcolor: "background.paper", py: 6 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" gutterBottom>
                                Medical AR Platform
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Transforming medical education through augmented reality technology.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" gutterBottom>
                                Quick Links
                            </Typography>
                            <Typography variant="body2">
                                <Link to="/login" style={{ color: "inherit", display: "block", marginBottom: "8px" }}>
                                    Login
                                </Link>
                                <Link to="/register" style={{ color: "inherit", display: "block", marginBottom: "8px" }}>
                                    Register
                                </Link>
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" gutterBottom>
                                Contact
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                support@medicalarplatform.com
                            </Typography>
                        </Grid>
                    </Grid>
                    <Box mt={5}>
                        <Typography variant="body2" color="text.secondary" align="center">
                            © {new Date().getFullYear()} Medical AR Platform. All rights reserved.
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    )
}

export default Home

