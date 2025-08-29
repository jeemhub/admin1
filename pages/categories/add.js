import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Breadcrumbs,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
  Divider
} from '@mui/material'
import {
  Add,
  Category,
  ArrowBack,
  Home,
  NavigateNext,
  AddPhotoAlternate,
  Save,
  Cancel
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import { uploadToPhotoBucket } from '../../lib/storage'

export default function AddCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  
  const [form, setForm] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    image_url: '',
    file: null
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
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
      setTimeout(() => {
        router.push('/categories')
      }, 1500)
      
    } catch (err) {
      console.error('Error adding category:', err)
      showSnackbar('حدث خطأ أثناء إضافة التصنيف', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm({ ...form, file })
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <>
      <Head>
        <title>إضافة تصنيف جديد - لوحة التحكم</title>
        <meta name="description" content="إضافة تصنيف جديد للمنتجات" />
      </Head>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                  <Home fontSize="small" />
                  <Typography>الرئيسية</Typography>
                </Box>
              </Link>
              <Link href="/categories" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                  <Category fontSize="small" />
                  <Typography>التصنيفات</Typography>
                </Box>
              </Link>
              <Typography color="text.primary">إضافة تصنيف</Typography>
            </Breadcrumbs>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => router.back()}
                sx={{ borderRadius: '25px' }}
              >
                رجوع
              </Button>
            </Box>
            
            <Typography variant="h3" component="h1" gutterBottom sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              إضافة تصنيف جديد
            </Typography>
            <Typography variant="h6" color="text.secondary">
              إنشاء تصنيف جديد لتنظيم المنتجات
            </Typography>
          </Box>

          {/* Form Card */}
          <Card sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56
                }}
              >
                <Category sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  معلومات التصنيف
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  أدخل تفاصيل التصنيف الجديد
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Name Fields */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="اسم التصنيف (إنجليزي)"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
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
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>

                {/* Description Fields */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="الوصف (إنجليزي)"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
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
                    rows={4}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>

                {/* Image Upload */}
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      border: '2px dashed',
                      borderColor: 'primary.main',
                      borderRadius: 2,
                      bgcolor: 'primary.50'
                    }}
                  >
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<AddPhotoAlternate />}
                      sx={{ py: 2, px: 4, borderRadius: 2 }}
                    >
                      {form.file ? form.file.name : 'اختر صورة للتصنيف'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </Button>
                    {form.file && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          تم اختيار: {form.file.name}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => router.back()}
                      startIcon={<Cancel />}
                      sx={{ borderRadius: 2, px: 4, py: 1.5 }}
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                      sx={{
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2,
                        px: 4,
                        py: 1.5
                      }}
                    >
                      {loading ? 'جاري الإضافة...' : 'إضافة التصنيف'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Card>

          {/* Info Card */}
          <Card sx={{ mt: 3, p: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                <Category />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.dark' }}>
                  نصائح لإضافة تصنيف
                </Typography>
                <Typography variant="body2" color="info.dark">
                  • اختر اسم واضح ووصف مفصل للتصنيف<br/>
                  • يمكنك إضافة صورة لتمييز التصنيف<br/>
                  • التصنيفات تساعد في تنظيم المنتجات بشكل أفضل
                </Typography>
              </Box>
            </Box>
          </Card>
        </motion.div>

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
