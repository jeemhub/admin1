import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Card,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Skeleton,
  Breadcrumbs,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Fab,
  CircularProgress
} from '@mui/material'
import {
  Add,
  Search,
  Delete,
  Edit,
  AddPhotoAlternate,
  TrendingUp,
  TrendingDown,
  Home,
  NavigateNext,
  Folder
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { uploadToPhotoBucket } from '../lib/storage'

export default function CategoriesPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()
  
  const [categories, setCategories] = useState([
    {
      id: '1',
      name: 'Electronics',
      name_ar: 'الإلكترونيات',
      description: 'Electronic devices and gadgets',
      description_ar: 'الأجهزة الإلكترونية والملحقات',
      image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      products_count: 15
    },
    {
      id: '2',
      name: 'Clothing',
      name_ar: 'الملابس',
      description: 'Fashion and apparel items',
      description_ar: 'الأزياء والملابس',
      image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      products_count: 23
    }
  ])
  const [isAdding, setIsAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCategories, setFilteredCategories] = useState([
    {
      id: '1',
      name: 'Electronics',
      name_ar: 'الإلكترونيات',
      description: 'Electronic devices and gadgets',
      description_ar: 'الأجهزة الإلكترونية والملحقات',
      image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      products_count: 15
    },
    {
      id: '2',
      name: 'Clothing',
      name_ar: 'الملابس',
      description: 'Fashion and apparel items',
      description_ar: 'الأزياء والملابس',
      image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      products_count: 23
    }
  ])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [loading, setLoading] = useState(false)

  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  
  const [form, setForm] = useState({ 
    name: '', 
    name_ar: '',
    description: '', 
    description_ar: '',
    image_url: '',
    file: null 
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    filterCategories()
  }, [searchQuery, categories, sortBy, sortOrder])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      setCategories(data || [])
      setFilteredCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      showSnackbar('حدث خطأ أثناء جلب التصنيفات', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filterCategories = () => {
    let filtered = [...categories]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(category =>
        (category.name && category.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (category.name_ar && category.name_ar.includes(searchQuery)) ||
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || ''
      let bValue = b[sortBy] || ''
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredCategories(filtered)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setIsAdding(true)
    
    try {
      let imageUrl = null
      if (form.file) {
        imageUrl = await uploadToPhotoBucket(form.file)
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: form.name,
          name_ar: form.name_ar,
          description: form.description,
          description_ar: form.description_ar,
          image_url: imageUrl
        }])
        .select()
      
      if (error) throw error
      
      showSnackbar('تم إضافة التصنيف بنجاح', 'success')
      fetchCategories()
      
      // Reset form
      setForm({ name: '', name_ar: '', description: '', description_ar: '', image_url: '', file: null })
      setIsAdding(false)
    } catch (err) {
      console.error('Error adding category:', err)
      showSnackbar('حدث خطأ أثناء إضافة التصنيف', 'error')
      setIsAdding(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id)
        if (error) throw error
        
        showSnackbar('تم حذف التصنيف بنجاح', 'success')
        fetchCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        showSnackbar('حدث خطأ أثناء حذف التصنيف', 'error')
      }
    }
  }

  const toggleAddForm = () => {
    setIsAdding(!isAdding)
    if (!isAdding) {
      setForm({ name: '', name_ar: '', description: '', description_ar: '', image_url: '', file: null })
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm({ ...form, file })
    }
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
        <title>إدارة التصنيفات - لوحة التحكم</title>
        <meta name="description" content="إدارة التصنيفات والمنتجات" />
      </Head>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header Section */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mb: { xs: 3, sm: 4 } }}>
              <Breadcrumbs 
                separator={<NavigateNext fontSize="small" />} 
                sx={{ 
                  mb: 2,
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}
              >
                <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                    <Home fontSize="small" />
                    <Typography variant={isMobile ? "body2" : "body1"}>الرئيسية</Typography>
                  </Box>
                </Link>
                <Typography color="text.primary" variant={isMobile ? "body2" : "body1"}>التصنيفات</Typography>
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
                  mb: 1,
                  textAlign: { xs: 'center', sm: 'right' }
                }}
              >
                إدارة التصنيفات
              </Typography>
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                color="text.secondary" 
                sx={{ 
                  mb: 3,
                  textAlign: { xs: 'center', sm: 'right' }
                }}
              >
                تنظيم وإدارة تصنيفات المنتجات
              </Typography>
            </Box>
          </motion.div>



          {/* Search and Filters */}
          <motion.div variants={itemVariants}>
            <Card sx={{ mb: 4, p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="البحث في التصنيفات..."
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
                      <MenuItem value="name">الاسم</MenuItem>
                      <MenuItem value="created_at">تاريخ الإنشاء</MenuItem>
                      <MenuItem value="description">الوصف</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 0.5, sm: 1 }, 
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                    mt: { xs: 2, sm: 0 }
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
                        width: { xs: 48, sm: 40 },
                        height: { xs: 48, sm: 40 }
                      }}
                    >
                      {sortOrder === 'asc' ? <TrendingUp /> : <TrendingDown />}
                    </IconButton>

                  </Box>
                </Grid>
              </Grid>
            </Card>
          </motion.div>

          {/* Categories Grid/List */}
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
                التصنيفات ({filteredCategories.length})
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
                إضافة تصنيف
              </Button>
            </Box>

            {/* Categories List View - Same Style as Products */}
            <Box sx={{ mt: 3 }}>
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      p: { xs: 1.5, sm: 2, md: 3 },
                      mb: 2,
                      borderRadius: { xs: '16px', sm: '12px' },
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        elevation: 4,
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                                        <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: { xs: 2, sm: 3 }
                    }}>
                      {/* Category Image */}
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
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
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
                            <Folder sx={{ fontSize: 40 }} />
                          </Box>
                        )}
                      </Box>

                      {/* Category Details */}
                      <Box sx={{ 
                        flex: 1, 
                        textAlign: { xs: 'center', sm: 'right' },
                        minWidth: 0
                      }}>
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 1,
                            lineHeight: { xs: 1.3, sm: 1.4 }
                          }}
                        >
                          {category.name_ar || category.name}
                        </Typography>
                        
                        {category.name && (
                          <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                              mb: 1,
                              lineHeight: { xs: 1.4, sm: 1.5 }
                            }}
                          >
                            {category.name}
                          </Typography>
                        )}

                        {category.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                              lineHeight: { xs: 1.4, sm: 1.5 },
                              mb: 1.5
                            }}
                          >
                            {category.description}
                          </Typography>
                        )}

                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1, 
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          flexWrap: 'wrap'
                        }}>
                          <Chip
                            label={`${category.products_count || 0} منتج`}
                            size={isMobile ? "small" : "medium"}
                            color="primary"
                            variant="outlined"
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                              height: { xs: 24, sm: 28, md: 32 }
                            }}
                          />
                          <Chip
                            label="تصنيف"
                            size={isMobile ? "small" : "medium"}
                            color="secondary"
                            variant="outlined"
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                              height: { xs: 24, sm: 28, md: 32 }
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: { xs: 1, sm: 1.5 },
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        width: { xs: '100%', sm: 'auto' },
                        mt: { xs: 2, sm: 0 }
                      }}>
                        <Button
                          variant="contained"
                          size={isMobile ? "small" : "medium"}
                          startIcon={<Edit />}
                          onClick={() => router.push(`/categories/edit/${category.id}`)}
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
                          onClick={() => handleDelete(category.id)}
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
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </motion.div>

          {/* Add Category Form */}
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
                    إضافة تصنيف جديد
                  </Typography>
                  <form onSubmit={handleAdd}>
                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="اسم التصنيف"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          size={isMobile ? "small" : "medium"}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="اسم التصنيف (عربي)"
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
                      <Grid item xs={12}>
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
                          صورة التصنيف (اختياري)
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
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
                            {isAdding ? 'جاري الإضافة...' : 'إضافة التصنيف'}
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
          aria-label="إضافة تصنيف"
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