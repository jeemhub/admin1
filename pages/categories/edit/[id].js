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
  Divider,
  Snackbar
} from '@mui/material'
import {
  ArrowBack,
  PhotoCamera,
  Close,
  Save,
  Cancel,
  NavigateNext,
  Home
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { supabase } from '../../../lib/supabaseClient'
import { uploadToPhotoBucket } from '../../../lib/storage'

export default function EditCategoryPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()
  const { id } = router.query
  
    const [form, setForm] = useState({
    name: '',
    name_ar: '',
    description: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentImage, setCurrentImage] = useState(null)
  const [newImage, setNewImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  
  const fileInputRef = useRef(null)

  useEffect(() => {
    console.log('useEffect triggered with ID:', id)
    if (id && id !== 'undefined') {
      fetchCategory()
    }
  }, [id])

  const fetchCategory = async () => {
    try {
      console.log('Fetching category with ID:', id)
      
      if (!id) {
        console.error('No category ID provided')
        showSnackbar('معرف التصنيف غير صحيح', 'error')
        setIsLoading(false)
        return
      }

      // تحديد الأعمدة الموجودة فقط
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, name_ar, description, image_url')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Supabase fetch error:', error)
        throw error
      }

      if (!data) {
        console.error('No category found with ID:', id)
        showSnackbar('لم يتم العثور على التصنيف', 'error')
        setIsLoading(false)
        return
      }

      console.log('Category data fetched:', data)

      // تعيين البيانات من قاعدة البيانات
      const formData = {
        name: data.name || '',
        name_ar: data.name_ar || '',
        description: data.description || ''
      }

      console.log('Form data set:', formData)
      setForm(formData)
      
      if (data.image_url) {
        setCurrentImage(data.image_url)
        setPreviewUrl(data.image_url)
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      
      let errorMessage = 'حدث خطأ أثناء جلب بيانات التصنيف'
      
      if (error.message) {
        if (error.message.includes('not found')) {
          errorMessage = 'لم يتم العثور على التصنيف'
        } else if (error.message.includes('permission')) {
          errorMessage = 'ليس لديك صلاحية لعرض التصنيف'
        } else {
          errorMessage = `خطأ: ${error.message}`
        }
      }
      
      showSnackbar(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewImage(file)
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
          // التحقق من صحة البيانات
      if (!form.name || !form.name_ar) {
        showSnackbar('يرجى ملء اسم التصنيف واسم التصنيف بالعربية', 'warning')
        return
      }

    if (!id) {
      showSnackbar('معرف التصنيف غير صحيح', 'error')
      return
    }

    setIsSubmitting(true)
    
    try {
      let imageUrl = currentImage
      
      // رفع الصورة الجديدة إذا تم اختيارها
      if (newImage) {
        try {
          imageUrl = await uploadToPhotoBucket(newImage)
          console.log('Image uploaded successfully:', imageUrl)
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError)
          showSnackbar('حدث خطأ أثناء رفع الصورة', 'error')
          setIsSubmitting(false)
          return
        }
      }

      console.log('Updating category with ID:', id)
      console.log('Update data:', {
        name: form.name,
        name_ar: form.name_ar,
        description: form.description,
        image_url: imageUrl
      })

      // إنشاء كائن التحديث مع الأعمدة الموجودة فقط
      const updateData = {
        name: form.name,
        image_url: imageUrl
      }

      // إضافة الأعمدة الاختيارية إذا كانت موجودة
      if (form.name_ar) updateData.name_ar = form.name_ar
      if (form.description) updateData.description = form.description

      console.log('Update data:', updateData)

      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Category updated successfully:', data)
      showSnackbar('تم تحديث التصنيف بنجاح', 'success')
      
      // الانتظار قليلاً قبل التوجيه
      setTimeout(() => {
        router.push('/categories')
      }, 1500)
      
    } catch (error) {
      console.error('Error updating category:', error)
      
      // رسائل خطأ أكثر تفصيلاً
      let errorMessage = 'حدث خطأ أثناء تحديث التصنيف'
      
      if (error.message) {
        if (error.message.includes('duplicate key')) {
          errorMessage = 'اسم التصنيف مستخدم بالفعل'
        } else if (error.message.includes('foreign key')) {
          errorMessage = 'لا يمكن حذف التصنيف لوجود منتجات مرتبطة به'
        } else if (error.message.includes('permission')) {
          errorMessage = 'ليس لديك صلاحية لتعديل التصنيف'
        } else {
          errorMessage = `خطأ: ${error.message}`
        }
      }
      
      showSnackbar(errorMessage, 'error')
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

  // التحقق من وجود معرف التصنيف
  if (!id || id === 'undefined') {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" color="error" gutterBottom>
            خطأ في معرف التصنيف
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            لم يتم تحديد معرف التصنيف بشكل صحيح
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/categories')}
            startIcon={<ArrowBack />}
          >
            العودة للتصنيفات
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <>
      <Head>
        <title>تعديل التصنيف - لوحة التحكم</title>
        <meta name="description" content="تعديل بيانات التصنيف" />
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
                <Link href="/categories" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Typography color="text.primary" variant="body1">التصنيفات</Typography>
                </Link>
                <Typography color="text.primary" variant="body1">تعديل التصنيف</Typography>
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
                  تعديل التصنيف
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
                <form onSubmit={handleSubmit} noValidate>
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
                          label="اسم التصنيف"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          size="large"
                          error={!form.name}
                          helperText={!form.name ? 'اسم التصنيف مطلوب' : ''}
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
                          label="اسم التصنيف (عربي)"
                          value={form.name_ar}
                          onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                          required
                          size="large"
                          error={!form.name_ar}
                          helperText={!form.name_ar ? 'اسم التصنيف بالعربية مطلوب' : ''}
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
                      صورة التصنيف
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
                            اختيار صورة التصنيف
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
                            صورة التصنيف هي الصورة التي ستظهر عند عرض التصنيف
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
                              💡 نصيحة: استخدم صور بجودة عالية وأبعاد 400×400 بكسل أو أكثر
                            </Typography>
                          </Paper>
                        </Box>
                      </Grid>
                    </Grid>
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
                          disabled={isSubmitting || !form.name || !form.name_ar}
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
                            transition: 'all 0.3s ease',
                            opacity: (!form.name || !form.name_ar) ? 0.6 : 1
                          }}
                        >
                          {isSubmitting ? 'جاري التحديث...' : 'تحديث التصنيف'}
                        </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={() => router.push('/categories')}
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
