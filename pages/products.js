import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Fade,
  Grow,
  Slide,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  InputAdornment,
  Fab,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Breadcrumbs,
  AlertTitle,
  Skeleton,
  CardMedia,
  CardActions,
  Rating,
  LinearProgress
} from '@mui/material'
import {
  Add,
  Search,
  Delete,
  Edit,
  Star,
  CheckCircle,
  Cancel,
  AddPhotoAlternate,
  Home,
  NavigateNext
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { uploadToPhotoBucket } from '../lib/storage'
import ImageSlider from '../components/ImageSlider'

export default function ProductsPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()
  
  const [products, setProducts] = useState([
    {
      id: '1',
      name: 'Smartphone',
      name_ar: 'هاتف ذكي',
      description: 'Latest smartphone with advanced features',
      description_ar: 'أحدث الهواتف الذكية مع ميزات متقدمة',
      price: 999.99,
      image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      in_stock: true,
      featured: true,
      category_id: '1',
      categories: { name: 'Electronics', name_ar: 'الإلكترونيات' }
    },
    {
      id: '2',
      name: 'Laptop',
      name_ar: 'حاسوب محمول',
      description: 'High-performance laptop for work and gaming',
      description_ar: 'حاسوب محمول عالي الأداء للعمل والألعاب',
      price: 1499.99,
      image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      in_stock: true,
      featured: false,
      category_id: '1',
      categories: { name: 'Electronics', name_ar: 'الإلكترونيات' }
    }
  ])
  const [categories, setCategories] = useState([
    {
      id: '1',
      name: 'Electronics',
      name_ar: 'الإلكترونيات'
    }
  ])
  const [isAdding, setIsAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([
    {
      id: '1',
      name: 'Smartphone',
      name_ar: 'هاتف ذكي',
      description: 'Latest smartphone with advanced features',
      description_ar: 'أحدث الهواتف الذكية مع ميزات متقدمة',
      price: 999.99,
      image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      in_stock: true,
      featured: true,
      category_id: '1',
      categories: { name: 'Electronics', name_ar: 'الإلكترونيات' }
    },
    {
      id: '2',
      name: 'Laptop',
      name_ar: 'حاسوب محمول',
      description: 'High-performance laptop for work and gaming',
      description_ar: 'حاسوب محمول عالي الأداء للعمل والألعاب',
      price: 1499.99,
      image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      in_stock: true,
      featured: false,
      category_id: '1',
      categories: { name: 'Electronics', name_ar: 'الإلكترونيات' }
    }
  ])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [additionalImages, setAdditionalImages] = useState([])
  const [uploadedImages, setUploadedImages] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [bulkActions, setBulkActions] = useState(false)
  
  const fileInputRef = useRef(null)
  const additionalImagesRef = useRef(null)
  
  const [form, setForm] = useState({ 
    name: '', 
    name_ar: '',
    description: '', 
    description_ar: '',
    price: '', 
    category_id: '',
    in_stock: true,
    featured: false,
    file: null 
  })
  
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchQuery, selectedCategory, products, sortBy, sortOrder])

  const fetchProducts = async () => {
    console.log('fetchProducts called')
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id(name, name_ar)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      console.log('Products from database:', data)
      setProducts(data || [])
      setFilteredProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      showSnackbar('حدث خطأ أثناء جلب المنتجات', 'error')
    } finally {
      setLoading(false)
    }
  }

    const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, name_ar')
        .order('name')
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.name_ar && product.name_ar.includes(searchQuery)) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category_id === selectedCategory)
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'price') {
        aValue = parseFloat(aValue) || 0
        bValue = parseFloat(bValue) || 0
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredProducts(filtered)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setIsAdding(true)
    
    try {
      if (!form.file) {
        showSnackbar('يرجى اختيار صورة للمنتج', 'error')
        setIsAdding(false)
        return
      }

      const imageUrl = await uploadToPhotoBucket(form.file)
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: form.name,
          name_ar: form.name_ar,
          description: form.description,
          description_ar: form.description_ar,
          price: parseFloat(form.price),
          category_id: form.category_id,
          in_stock: form.in_stock,
          featured: form.featured,
          image_url: imageUrl,
          additional_images: additionalImages.join(',')
        }])
        .select()
      
      if (error) throw error
      
      showSnackbar('تم إضافة المنتج بنجاح', 'success')
      fetchProducts()
      
      // Reset form
      setForm({ name: '', name_ar: '', description: '', description_ar: '', price: '', category_id: '', in_stock: true, featured: false, file: null })
      setAdditionalImages([])
      setUploadedImages([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (additionalImagesRef.current) additionalImagesRef.current.value = ''
      
      setIsAdding(false)
    } catch (err) {
      console.error('Error adding product:', err)
      showSnackbar('حدث خطأ أثناء إضافة المنتج', 'error')
      setIsAdding(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
    const { error } = await supabase.from('products').delete().eq('id', id)
        if (error) throw error
        
        showSnackbar('تم حذف المنتج بنجاح', 'success')
        fetchProducts()
      } catch (error) {
      console.error('Error deleting product:', error)
        showSnackbar('حدث خطأ أثناء حذف المنتج', 'error')
      }
    }
  }

  const toggleAddForm = () => {
    setIsAdding(!isAdding)
    if (!isAdding) {
      setForm({ name: '', name_ar: '', description: '', description_ar: '', price: '', category_id: '', in_stock: true, featured: false, file: null })
      setAdditionalImages([])
      setUploadedImages([])
    }
  }

  const getCategoryName = (product) => {
    if (product.categories) {
      return product.categories.name_ar || product.categories.name
    }
    return 'غير محدد'
  }

  const getAdditionalImages = (product) => {
    if (!product.additional_images) return []
    return product.additional_images.split(',').filter(url => url.trim() !== '')
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleMainImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm({ ...form, file })
    }
  }

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + additionalImages.length > 5) {
      alert('يمكنك إضافة 5 صور إضافية كحد أقصى')
      return
    }
    setAdditionalImages(prev => [...prev, ...files])
  }

  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
  }



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={400} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    )
  }

  return (
    <>
      <Head>
        <title>إدارة المنتجات - لوحة التحكم</title>
        <meta name="description" content="إدارة المنتجات والتصنيفات" />
      </Head>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header Section */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: { xs: 'center', sm: 'center' } }}>
              <Breadcrumbs 
                separator={<NavigateNext fontSize="small" />} 
                sx={{ 
                  mb: 2, 
                  justifyContent: 'center' 
                }}
              >
                <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                    <Home fontSize="small" />
                    <Typography variant={isMobile ? "body2" : "body1"}>الرئيسية</Typography>
                  </Box>
                </Link>
                <Typography color="text.primary" variant={isMobile ? "body2" : "body1"}>المنتجات</Typography>
              </Breadcrumbs>
              
              <Typography 
                variant={isMobile ? "h4" : "h3"} 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700, 
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                إدارة المنتجات
              </Typography>
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                color="text.secondary" 
                sx={{ mb: 3 }}
              >
                إدارة وإضافة المنتجات بسهولة
              </Typography>
            </Box>
          </motion.div>



          {/* Search and Filters */}
          <motion.div variants={itemVariants}>
            <Card sx={{ mb: 4, p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Grid container spacing={{ xs: 1, sm: 2, md: 2 }} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="البحث في المنتجات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: { xs: 2, sm: 0 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: { xs: '12px', sm: '8px' },
                        fontSize: { xs: '14px', sm: '16px' }
                      }
                    }}
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>الفئة</InputLabel>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      label="الفئة"
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: { xs: '12px', sm: '8px' }
                        },
                        '& .MuiSelect-icon': {
                          color: 'primary.main'
                        }
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            '& .MuiMenuItem-root': {
                              fontSize: { xs: '14px', sm: '16px' },
                              py: { xs: 1, sm: 1.5 }
                            }
                          }
                        }
                      }}
                    >
                      <MenuItem value="">جميع الفئات</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name_ar || category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>ترتيب حسب</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="ترتيب حسب"
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: { xs: '12px', sm: '8px' }
                        },
                        '& .MuiSelect-icon': {
                          color: 'primary.main'
                        }
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            '& .MuiMenuItem-root': {
                              fontSize: { xs: '14px', sm: '16px' },
                              py: { xs: 1, sm: 1.5 }
                            }
                          }
                        }
                      }}
                    >
                      <MenuItem value="created_at">تاريخ الإنشاء</MenuItem>
                      <MenuItem value="name">الاسم</MenuItem>
                      <MenuItem value="price">السعر</MenuItem>
                      <MenuItem value="featured">مميز</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    justifyContent: 'center',
                    mt: { xs: 1, sm: 0 }
                  }}>
                    <IconButton
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      color="primary"
                      size={isMobile ? "large" : "medium"}
                      sx={{ 
                        bgcolor: 'primary.50',
                        '&:hover': { 
                          bgcolor: 'primary.100',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease',
                        width: { xs: 48, sm: 48 },
                        height: { xs: 48, sm: 48 },
                        borderRadius: '12px'
                      }}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </motion.div>

          {/* Products Grid/List */}
          <motion.div variants={itemVariants}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ 
                  fontWeight: 600,
                  textAlign: { xs: 'center', sm: 'right' }
                }}
              >
                المنتجات ({filteredProducts.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={toggleAddForm}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '25px',
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
                size={isMobile ? "small" : "medium"}
                fullWidth={isMobile}
              >
                إضافة منتج
              </Button>
            </Box>

            {/* Simple Product List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2, md: 3 },
                      borderRadius: { xs: '16px', sm: '12px' },
                      border: '1px solid',
                      borderColor: 'grey.200',
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' }, 
                      gap: { xs: 2, sm: 3 } 
                    }}>
                      {/* Product Image */}
                      <Box sx={{ 
                        width: { xs: '100%', sm: 80 }, 
                        height: { xs: 100, sm: 80 }, 
                        borderRadius: { xs: '12px', sm: '8px' }, 
                        overflow: 'hidden', 
                        flexShrink: 0,
                        alignSelf: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              bgcolor: 'grey.100',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'text.secondary'
                            }}
                          >
                            <AddPhotoAlternate sx={{ fontSize: 40 }} />
                          </Box>
                        )}
                      </Box>

                      {/* Product Info */}
                      <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                        <Typography 
                          variant={isMobile ? "subtitle1" : "h6"} 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 1, 
                            textAlign: { xs: 'center', sm: 'right' },
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }}
                        >
                          {product.name_ar || product.name}
                        </Typography>
                        
                        {product.description_ar || product.description ? (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 2, 
                              textAlign: { xs: 'center', sm: 'right' },
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            {product.description_ar || product.description}
                          </Typography>
                        ) : null}

                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          flexWrap: 'wrap',
                          justifyContent: { xs: 'center', sm: 'flex-start' }
                        }}>
                          <Chip
                            label={getCategoryName(product)}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {product.price} د.ع
                          </Typography>
                        </Box>
                      </Box>

                      {/* Status and Actions */}
                      <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
                        gap: 2, 
                        flexShrink: 0,
                        flexDirection: { xs: 'column', sm: 'row' },
                        width: { xs: '100%', sm: 'auto' },
                        justifyContent: { xs: 'center', sm: 'flex-start' }
                      }}>
                        {/* Featured Badge */}
                        {product.featured && (
                          <Chip
                            icon={<Star />}
                            label="مميز"
                            size="small"
                            sx={{
                              bgcolor: 'warning.main',
                              color: 'white',
                              fontWeight: 600
                  }}
                />
              )}
              
                        {/* Stock Status */}
                        <Chip
                          icon={product.in_stock ? <CheckCircle /> : <Cancel />}
                          label={product.in_stock ? 'متوفر' : 'غير متوفر'}
                          size="small"
                          color={product.in_stock ? 'success' : 'error'}
                          variant="outlined"
                        />

                        {/* Action Buttons */}
                        <Box sx={{ 
                          display: 'flex', 
                          gap: { xs: 1, sm: 1.5 },
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          width: '100%',
                          mt: { xs: 2, sm: 1 }
                        }}>
                          <Button
                            variant="contained"
                            size={isMobile ? "small" : "medium"}
                            startIcon={<Edit />}
                            onClick={() => router.push(`/products/edit/${product.id}`)}
                            sx={{
                              bgcolor: 'primary.main',
                      color: 'white', 
                              borderRadius: '20px',
                              px: { xs: 2, sm: 3 },
                              py: { xs: 0.5, sm: 1 },
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              fontWeight: 600,
                              textTransform: 'none',
                              boxShadow: theme.shadows[2],
                              '&:hover': {
                                bgcolor: 'primary.dark',
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[4]
                              },
                              transition: 'all 0.3s ease',
                              minWidth: { xs: 'auto', sm: '80px' }
                            }}
                          >
                            تعديل
                          </Button>
                          <Button
                            variant="contained"
                            size={isMobile ? "small" : "medium"}
                            startIcon={<Delete />}
                            onClick={() => handleDelete(product.id)}
                            sx={{
                              bgcolor: 'error.main',
                  color: 'white',
                              borderRadius: '20px',
                              px: { xs: 2, sm: 3 },
                              py: { xs: 0.5, sm: 1 },
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              fontWeight: 600,
                              textTransform: 'none',
                              boxShadow: theme.shadows[2],
                              '&:hover': {
                                bgcolor: 'error.dark',
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[4]
                              },
                              transition: 'all 0.3s ease',
                              minWidth: { xs: 'auto', sm: '80px' }
                            }}
                          >
                            حذف
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </motion.div>

          {/* Add Product Form */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ mt: 4, p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 3,
                      textAlign: { xs: 'center', sm: 'right' }
                    }}
                  >
                    إضافة منتج جديد
                  </Typography>
                  <form onSubmit={handleAdd}>
                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="اسم المنتج"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          size={isMobile ? "small" : "medium"}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="اسم المنتج (عربي)"
                          value={form.name_ar}
                          onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                          required
                          size={isMobile ? "small" : "medium"}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="الوصف"
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          multiline
                          rows={isMobile ? 2 : 3}
                          size={isMobile ? "small" : "medium"}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="الوصف (عربي)"
                          value={form.description_ar}
                          onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                          multiline
                          rows={isMobile ? 2 : 3}
                          size={isMobile ? "small" : "medium"}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="السعر"
                          type="number"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          required
                          size={isMobile ? "small" : "medium"}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">د.ع</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>الفئة</InputLabel>
                          <Select
                            value={form.category_id}
                            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                            label="الفئة"
                            required
                            size={isMobile ? "small" : "medium"}
                            sx={{
                              '& .MuiSelect-icon': {
                                color: 'primary.main'
                              }
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: { xs: '14px', sm: '16px' },
                                    py: { xs: 1, sm: 1.5 }
                                  }
                                }
                              }
                            }}
                          >
                            {categories.map((category) => (
                              <MenuItem key={category.id} value={category.id}>
                                {category.name_ar || category.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={form.in_stock}
                              onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
                            />
                          }
                          label="متوفر في المخزون"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={form.featured}
                              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                            />
                          }
                          label="منتج مميز"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={<AddPhotoAlternate />}
                          sx={{ 
                            py: { xs: 1.5, sm: 2 },
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}
                          size={isMobile ? "small" : "medium"}
                        >
                          الصورة الرئيسية
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleMainImageChange}
                            ref={fileInputRef}
                          />
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={<AddPhotoAlternate />}
                          sx={{ 
                            py: { xs: 1.5, sm: 2 },
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}
                          disabled={additionalImages.length >= 5}
                          size={isMobile ? "small" : "medium"}
                        >
                          صور إضافية ({additionalImages.length}/5)
                          <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={handleAdditionalImagesChange}
                            ref={additionalImagesRef}
                          />
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          display: 'flex', 
                          gap: { xs: 1, sm: 2 }, 
                          justifyContent: { xs: 'center', sm: 'flex-end' },
                          flexDirection: { xs: 'column', sm: 'row' }
                        }}>
                          <Button
                            variant="outlined"
                            onClick={toggleAddForm}
                            size={isMobile ? "small" : "medium"}
                            fullWidth={isMobile}
                          >
                            إلغاء
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={isAdding}
                            startIcon={isAdding ? <CircularProgress size={20} /> : <Add />}
                            sx={{
                              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                              width: { xs: '100%', sm: 'auto' }
                            }}
                            size={isMobile ? "small" : "medium"}
                          >
                            {isAdding ? 'جاري الإضافة...' : 'إضافة المنتج'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="إضافة منتج"
          onClick={toggleAddForm}
          sx={{
            position: 'fixed',
            bottom: { xs: 20, sm: 24 },
            right: { xs: 20, sm: 24 },
            left: { xs: 20, sm: 'auto' },
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            width: { xs: 60, sm: 56 },
            height: { xs: 60, sm: 56 },
            display: { xs: 'flex', sm: 'flex' },
            boxShadow: theme.shadows[8],
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: theme.shadows[12]
            },
            transition: 'all 0.3s ease',
            zIndex: 1000
          }}
          size={isMobile ? "large" : "large"}
        >
          <Add sx={{ fontSize: { xs: 28, sm: 24 } }} />
        </Fab>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  )
}