import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Paper,
  Chip,
  IconButton,
  Alert,
  Skeleton,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Divider,
  Snackbar
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Delete,
  AddPhotoAlternate,
  PhotoCamera,
  Close,
  Save,
  Cancel,
  NavigateNext,
  Home
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../lib/supabaseClient'
import { uploadToPhotoBucket } from '../../../lib/storage'
import ImageSlider from '../../../components/ImageSlider'

export default function EditProductPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()
  const { id } = router.query
  
  const [form, setForm] = useState({ 
    name: '', 
    name_ar: '', 
    description: '', 
    description_ar: '', 
    price: '', 
    category_id: '', 
    in_stock: true, 
    featured: false
  })
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentImage, setCurrentImage] = useState(null)
  const [newImage, setNewImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [currentAdditionalImages, setCurrentAdditionalImages] = useState([])
  const [newAdditionalImages, setNewAdditionalImages] = useState([])
  const [uploadedImages, setUploadedImages] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  
  const fileInputRef = useRef(null)
  const additionalImagesRef = useRef(null)

  useEffect(() => {
    if (id) {
      fetchProduct()
      fetchCategories()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setForm({
        name: data.name || '',
        name_ar: data.name_ar || '',
        description: data.description || '',
        description_ar: data.description_ar || '',
        price: data.price || '',
        category_id: data.category_id || '',
        in_stock: data.in_stock ?? true,
        featured: data.featured ?? false
      })
      
      if (data.image_url) {
        setCurrentImage(data.image_url)
        setPreviewUrl(data.image_url)
      }
      
      // Load additional images
      if (data.additional_images) {
        const images = data.additional_images.split(',').filter(url => url.trim() !== '')
        setCurrentAdditionalImages(images)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      showSnackbar('حدث خطأ أثناء جلب بيانات المنتج', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, name_ar')
      .order('name')
    
    if (!error) setCategories(data)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewImage(file)
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)
    }
  }

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files)
    const totalImages = currentAdditionalImages.length + newAdditionalImages.length + files.length
    
    if (totalImages > 5) {
      showSnackbar('لا يمكن إضافة أكثر من 5 صور إضافية', 'warning')
      return
    }
    
    setNewAdditionalImages(prev => [...prev, ...files])
  }

  const removeCurrentAdditionalImage = (index) => {
    setCurrentAdditionalImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewAdditionalImage = (index) => {
    setNewAdditionalImages(prev => prev.filter((_, i) => i !== index))
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      let imageUrl = currentImage
      if (newImage) {
        imageUrl = await uploadToPhotoBucket(newImage)
      }

      // Handle additional images
      let additionalImagesUrls = [...currentAdditionalImages]
      if (newAdditionalImages.length > 0) {
        for (const file of newAdditionalImages) {
          const url = await uploadToPhotoBucket(file)
          additionalImagesUrls.push(url)
        }
      }

      const { error } = await supabase
        .from('products')
        .update({
          name: form.name,
          name_ar: form.name_ar,
          description: form.description,
          description_ar: form.description_ar,
          price: parseFloat(form.price),
          category_id: form.category_id,
          in_stock: form.in_stock,
          featured: form.featured,
          image_url: imageUrl,
          additional_images: additionalImagesUrls.join(',')
        })
        .eq('id', id)

      if (error) throw error
      
      showSnackbar('تم تحديث المنتج بنجاح', 'success')
      router.push('/products')
    } catch (error) {
      console.error('Error updating product:', error)
      showSnackbar('حدث خطأ أثناء تحديث المنتج', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Skeleton variant="rectangular" height={80} />
          <Skeleton variant="rectangular" height={600} />
          <Skeleton variant="rectangular" height={300} />
        </Box>
      </Container>
    )
  }

  return (
    <>
      <Head>
        <title>تعديل المنتج - لوحة التحكم</title>
        <meta name="description" content="تعديل بيانات المنتج" />
      </Head>

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header Section */}
          <motion.div variants={itemVariants}>
            <Box sx={{ 
              mb: { xs: 4, md: 6 },
              textAlign: { xs: 'center', md: 'left' }
            }}>
              <Breadcrumbs 
                separator={<NavigateNext fontSize="small" />} 
                sx={{ 
                  mb: 3,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                    <Home fontSize="small" />
                    <Typography variant="body1">الرئيسية</Typography>
                  </Box>
                </Link>
                <Link href="/products" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Typography color="text.primary" variant="body1">المنتجات</Typography>
                </Link>
                <Typography color="text.primary" variant="body1">تعديل المنتج</Typography>
              </Breadcrumbs>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 3,
                flexDirection: { xs: 'column', md: 'row' }
              }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => router.back()}
                  size="large"
                  sx={{ 
                    borderRadius: '25px',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2
                    }
                  }}
                >
                  رجوع
                </Button>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 800, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    textShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  تعديل المنتج
                </Typography>
              </Box>
            </Box>
          </motion.div>

          {/* Form */}
          <motion.div variants={itemVariants}>
            <Card sx={{ 
              borderRadius: { xs: '16px', md: '24px' },
              boxShadow: theme.shadows[8],
              overflow: 'visible'
            }}>
              <CardContent sx={{ 
                p: { xs: 3, md: 6 },
                '&:last-child': { pb: { xs: 3, md: 6 } }
              }}>
                <form onSubmit={handleSubmit}>
                  {/* Basic Information Section */}
                  <Box sx={{ mb: { xs: 4, md: 6 } }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 4,
                        color: 'primary.main',
                        textAlign: { xs: 'center', md: 'right' },
                        fontSize: { xs: '1.5rem', md: '2rem' },
                        borderBottom: '3px solid',
                        borderColor: 'primary.main',
                        pb: 2,
                        display: 'inline-block'
                      }}
                    >
                      المعلومات الأساسية
                    </Typography>
                    
                    <Grid container spacing={{ xs: 3, md: 4 }}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="اسم المنتج"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          size="large"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '16px',
                              fontSize: '1.1rem',
                              '& fieldset': {
                                borderWidth: 2
                              },
                              '&:hover fieldset': {
                                borderColor: 'primary.main'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '1.1rem',
                              fontWeight: 600
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="اسم المنتج (عربي)"
                          value={form.name_ar}
                          onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                          required
                          size="large"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '16px',
                              fontSize: '1.1rem',
                              '& fieldset': {
                                borderWidth: 2
                              },
                              '&:hover fieldset': {
                                borderColor: 'primary.main'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '1.1rem',
                              fontWeight: 600
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="الوصف"
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          multiline
                          rows={isMobile ? 3 : 4}
                          size="large"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '16px',
                              fontSize: '1.1rem',
                              '& fieldset': {
                                borderWidth: 2
                              },
                              '&:hover fieldset': {
                                borderColor: 'primary.main'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '1.1rem',
                              fontWeight: 600
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="الوصف (عربي)"
                          value={form.description_ar}
                          onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                          multiline
                          rows={isMobile ? 3 : 4}
                          size="large"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '16px',
                              fontSize: '1.1rem',
                              '& fieldset': {
                                borderWidth: 2
                              },
                              '&:hover fieldset': {
                                borderColor: 'primary.main'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '1.1rem',
                              fontWeight: 600
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="السعر"
                          type="number"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          required
                          size="large"
                          InputProps={{
                            endAdornment: <InputAdornment position="end" sx={{ fontSize: '1.2rem', fontWeight: 600 }}>د.ع</InputAdornment>,
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '16px',
                              fontSize: '1.1rem',
                              '& fieldset': {
                                borderWidth: 2
                              },
                              '&:hover fieldset': {
                                borderColor: 'primary.main'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '1.1rem',
                              fontWeight: 600
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="large">
                          <InputLabel sx={{ fontSize: '1.1rem', fontWeight: 600 }}>الفئة</InputLabel>
                          <Select
                            value={form.category_id}
                            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                            required
                            sx={{
                              '& .MuiSelect-icon': { color: 'primary.main', fontSize: '1.5rem' },
                              borderRadius: '16px',
                              fontSize: '1.1rem',
                              '& fieldset': {
                                borderWidth: 2
                              },
                              '&:hover fieldset': {
                                borderColor: 'primary.main'
                              }
                            }}
                          >
                            {categories.map((category) => (
                              <MenuItem key={category.id} value={category.id} sx={{ fontSize: '1.1rem' }}>
                                {category.name_ar || category.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 4, 
                          flexWrap: 'wrap',
                          justifyContent: { xs: 'center', md: 'flex-start' },
                          mt: 2
                        }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={form.in_stock}
                                onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
                                color="primary"
                                size="large"
                              />
                            }
                            label={
                              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                متوفر في المخزن
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={form.featured}
                                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                                color="primary"
                                size="large"
                              />
                            }
                            label={
                              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                مميز
                              </Typography>
                            }
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Main Image Section */}
                  <Box sx={{ mb: { xs: 4, md: 6 } }}>
                    <Divider sx={{ my: 4, borderWidth: 2 }} />
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 4,
                        color: 'primary.main',
                        textAlign: { xs: 'center', md: 'right' },
                        fontSize: { xs: '1.5rem', md: '2rem' },
                        borderBottom: '3px solid',
                        borderColor: 'primary.main',
                        pb: 2,
                        display: 'inline-block'
                      }}
                    >
                      الصورة الرئيسية
                    </Typography>
                    
                    <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 3,
                          alignItems: { xs: 'center', md: 'flex-start' }
                        }}>
                          <Button
                            variant="contained"
                            component="label"
                            startIcon={<PhotoCamera sx={{ fontSize: '1.5rem' }} />}
                            size="large"
                            sx={{
                              borderRadius: '25px',
                              px: 5,
                              py: 2,
                              fontSize: '1.2rem',
                              fontWeight: 600,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            اختيار صورة رئيسية
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={handleImageChange}
                              ref={fileInputRef}
                            />
                          </Button>
                          
                          {previewUrl && (
                            <Box sx={{ 
                              position: 'relative',
                              textAlign: 'center'
                            }}>
                              <img
                                src={previewUrl}
                                alt="Preview"
                                style={{
                                  maxWidth: '300px',
                                  maxHeight: '300px',
                                  borderRadius: '20px',
                                  border: `3px solid ${theme.palette.primary.main}`,
                                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                                }}
                              />
                              {newImage && (
                                <Chip
                                  label="صورة جديدة"
                                  color="success"
                                  size="large"
                                  sx={{ 
                                    position: 'absolute',
                                    top: -15,
                                    right: -15,
                                    fontSize: '1rem',
                                    fontWeight: 600
                                  }}
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 3,
                          alignItems: { xs: 'center', md: 'flex-start' }
                        }}>
                          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.6 }}>
                            الصورة الرئيسية هي الصورة التي ستظهر أولاً عند عرض المنتج
                          </Typography>
                          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.6 }}>
                            يفضل أن تكون الصورة بجودة عالية وبأبعاد مناسبة
                          </Typography>
                          <Paper 
                            elevation={3} 
                            sx={{ 
                              p: 3, 
                              borderRadius: '16px',
                              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                              border: '2px solid',
                              borderColor: 'primary.light'
                            }}
                          >
                            <Typography variant="body1" color="primary.main" sx={{ fontWeight: 600, textAlign: 'center' }}>
                              💡 نصيحة: استخدم صور بجودة عالية وأبعاد 800×800 بكسل أو أكثر
                            </Typography>
                          </Paper>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Additional Images Section */}
                  <Box sx={{ mb: { xs: 4, md: 6 } }}>
                    <Divider sx={{ my: 4, borderWidth: 2 }} />
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 4,
                        color: 'primary.main',
                        textAlign: { xs: 'center', md: 'right' },
                        fontSize: { xs: '1.5rem', md: '2rem' },
                        borderBottom: '3px solid',
                        borderColor: 'primary.main',
                        pb: 2,
                        display: 'inline-block'
                      }}
                    >
                      الصور الإضافية
                    </Typography>

                    {/* Current Additional Images */}
                    {currentAdditionalImages.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 3,
                            textAlign: { xs: 'center', md: 'right' },
                            color: 'text.primary'
                          }}
                        >
                          الصور الإضافية الحالية
                        </Typography>
                        <Box sx={{ 
                          display: 'grid',
                          gridTemplateColumns: { xs: 'repeat(auto-fill, minmax(150px, 1fr))', md: 'repeat(auto-fill, minmax(200px, 1fr))' },
                          gap: 3,
                          mb: 4
                        }}>
                          {currentAdditionalImages.map((imageUrl, index) => (
                            <Paper
                              key={index}
                              elevation={4}
                              sx={{
                                position: 'relative',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-5px)',
                                  boxShadow: theme.shadows[8]
                                }
                              }}
                            >
                              <img
                                src={imageUrl}
                                alt={`صورة إضافية ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '180px',
                                  objectFit: 'cover'
                                }}
                              />
                              <IconButton
                                onClick={() => removeCurrentAdditionalImage(index)}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: 'error.main',
                                  color: 'white',
                                  width: 40,
                                  height: 40,
                                  '&:hover': { 
                                    bgcolor: 'error.dark',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <Close />
                              </IconButton>
                              <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                color: 'white',
                                p: 2,
                                textAlign: 'center'
                              }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  صورة {index + 1}
                                </Typography>
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Add New Additional Images */}
                    <Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        flexWrap: 'wrap',
                        justifyContent: { xs: 'center', md: 'flex-start' },
                        mb: 3
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          إضافة صور إضافية جديدة
                        </Typography>
                        <Chip
                          label={`${currentAdditionalImages.length + newAdditionalImages.length}/5`}
                          color={currentAdditionalImages.length + newAdditionalImages.length >= 5 ? "error" : "primary"}
                          variant="outlined"
                          size="large"
                          sx={{ 
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            px: 2,
                            py: 1
                          }}
                        />
                      </Box>

                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<AddPhotoAlternate sx={{ fontSize: '1.5rem' }} />}
                        disabled={currentAdditionalImages.length + newAdditionalImages.length >= 5}
                        size="large"
                        sx={{
                          borderRadius: '25px',
                          px: 5,
                          py: 2,
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        اختيار صور إضافية
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          multiple
                          onChange={handleAdditionalImagesChange}
                          ref={additionalImagesRef}
                        />
                      </Button>

                      {currentAdditionalImages.length + newAdditionalImages.length >= 5 && (
                        <Alert 
                          severity="warning" 
                          sx={{ 
                            width: '100%', 
                            mt: 3,
                            fontSize: '1.1rem',
                            '& .MuiAlert-icon': { fontSize: '2rem' }
                          }}
                        >
                          تم الوصول للحد الأقصى (5 صور إضافية)
                        </Alert>
                      )}

                      {newAdditionalImages.length > 0 && (
                        <Box sx={{ 
                          display: 'grid',
                          gridTemplateColumns: { xs: 'repeat(auto-fill, minmax(150px, 1fr))', md: 'repeat(auto-fill, minmax(200px, 1fr))' },
                          gap: 3,
                          width: '100%',
                          mt: 4
                        }}>
                          {newAdditionalImages.map((file, index) => (
                            <Paper
                              key={index}
                              elevation={4}
                              sx={{
                                position: 'relative',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-5px)',
                                  boxShadow: theme.shadows[8]
                                }
                              }}
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`صورة جديدة ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '180px',
                                  objectFit: 'cover'
                                }}
                              />
                              <IconButton
                                onClick={() => removeNewAdditionalImage(index)}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: 'error.main',
                                  color: 'white',
                                  width: 40,
                                  height: 40,
                                  '&:hover': { 
                                    bgcolor: 'error.dark',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <Close />
                              </IconButton>
                              <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                color: 'white',
                                p: 2,
                                textAlign: 'center'
                              }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  صورة جديدة {index + 1}
                                </Typography>
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Submit Buttons */}
                  <Box>
                    <Divider sx={{ my: 4, borderWidth: 2 }} />
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 3, 
                      justifyContent: 'center',
                      flexDirection: { xs: 'column', md: 'row' }
                    }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={<Save sx={{ fontSize: '1.5rem' }} />}
                        size="large"
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                          borderRadius: '30px',
                          px: 6,
                          py: 2.5,
                          fontSize: '1.3rem',
                          fontWeight: 700,
                          minWidth: { xs: '100%', md: '250px' },
                          boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 16px 45px rgba(102, 126, 234, 0.5)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isSubmitting ? 'جاري التحديث...' : 'تحديث المنتج'}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={() => router.push('/products')}
                        startIcon={<Cancel sx={{ fontSize: '1.5rem' }} />}
                        size="large"
                        sx={{
                          borderRadius: '30px',
                          px: 6,
                          py: 2.5,
                          fontSize: '1.3rem',
                          fontWeight: 700,
                          minWidth: { xs: '100%', md: '250px' },
                          borderWidth: 3,
                          '&:hover': {
                            borderWidth: 3,
                            transform: 'translateY(-3px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        إلغاء
                      </Button>
                    </Box>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            fontSize: '1.1rem',
            '& .MuiAlert-icon': { fontSize: '2rem' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}
