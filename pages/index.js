import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip
} from '@mui/material'
import {
  Inventory,
  Category,
  Add,
  Search,
  ArrowForward,
  Clear
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'



const quickActions = [
  { title: 'إضافة منتج جديد', icon: Add, href: '/products/add', color: '#4caf50', description: 'إضافة منتج جديد للنظام' },
  { title: 'إدارة المنتجات', icon: Inventory, href: '/products', color: '#2196f3', description: 'عرض وتعديل وحذف المنتجات' },
  { title: 'إضافة تصنيف', icon: Add, href: '/categories/add', color: '#ff9800', description: 'إضافة تصنيف جديد' },
  { title: 'إدارة التصنيفات', icon: Category, href: '/categories', color: '#9c27b0', description: 'عرض وتعديل وحذف التصنيفات' },
]

export default function Home() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

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

  const handleSearch = async (query) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    try {
      // البحث في المنتجات
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, name_ar, price, image_url, category_id')
        .or(`name.ilike.%${query}%, name_ar.ilike.%${query}%, description.ilike.%${query}%`)
        .limit(5)

      // البحث في التصنيفات
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, name_ar, description')
        .or(`name.ilike.%${query}%, name_ar.ilike.%${query}%, description.ilike.%${query}%`)
        .limit(5)

      if (productsError) console.error('Products search error:', productsError)
      if (categoriesError) console.error('Categories search error:', categoriesError)

      const results = []
      
      // إضافة المنتجات مع نوع "product"
      if (products) {
        products.forEach(product => {
          results.push({
            ...product,
            type: 'product',
            displayName: product.name_ar || product.name,
            displayDescription: product.description_ar || product.description || `السعر: ${product.price} ريال`
          })
        })
      }

      // إضافة التصنيفات مع نوع "category"
      if (categories) {
        categories.forEach(category => {
          results.push({
            ...category,
            type: 'category',
            displayName: category.name_ar || category.name,
            displayDescription: category.description || 'تصنيف'
          })
        })
      }

      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <>
      <Head>
        <title>لوحة التحكم - الصفحة الرئيسية</title>
        <meta name="description" content="لوحة تحكم بسيطة لإدارة المنتجات والتصنيفات" />
      </Head>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header Section */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ 
                fontWeight: 700, 
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}>
                لوحة التحكم
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                إدارة المنتجات والتصنيفات بسهولة
              </Typography>
            </Box>
          </motion.div>

          {/* Search Bar */}
          <motion.div variants={itemVariants}>
            <Card sx={{ mb: 4, p: 3 }}>
              <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <TextField
                  fullWidth
                  placeholder="البحث في المنتجات والتصنيفات..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <Button
                          onClick={clearSearch}
                          sx={{ minWidth: 'auto', p: 1 }}
                        >
                          <Clear />
                        </Button>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '25px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }
                  }}
                />
              </Box>
            </Card>
          </motion.div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card sx={{ mb: 4, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                  نتائج البحث ({searchResults.length})
                </Typography>
                <List>
                  {searchResults.map((result, index) => (
                    <Box key={`${result.type}-${result.id}`}>
                      <ListItem 
                        button 
                        component={Link} 
                        href={`/${result.type === 'product' ? 'products' : 'categories'}/${result.type === 'product' ? 'edit' : 'edit'}/${result.id}`}
                        sx={{ 
                          borderRadius: 2,
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: result.type === 'product' ? 'primary.main' : 'secondary.main',
                            width: 50,
                            height: 50
                          }}>
                            {result.type === 'product' ? <Inventory /> : <Category />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {result.displayName}
                              </Typography>
                              <Chip 
                                label={result.type === 'product' ? 'منتج' : 'تصنيف'} 
                                size="small" 
                                color={result.type === 'product' ? 'primary' : 'secondary'}
                                sx={{ fontSize: '0.75rem' }}
                              />
                            </Box>
                          }
                          secondary={result.displayDescription}
                        />
                        <ArrowForward sx={{ color: 'primary.main' }} />
                      </ListItem>
                      {index < searchResults.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </Card>
            </motion.div>
          )}



          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card sx={{ mb: 4, p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                الإجراءات السريعة
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 3
              }}>
                {quickActions.map((action, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: { xs: '100%', sm: '280px', md: '300px' },
                      maxWidth: '100%'
                    }}
                  >
                    <Link href={action.href} style={{ textDecoration: 'none' }}>
                      <Card
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: `2px solid ${action.color}20`,
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: theme.shadows[8],
                            borderColor: action.color,
                          }
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                          <Avatar
                            sx={{
                              bgcolor: `${action.color}20`,
                              color: action.color,
                              width: 80,
                              height: 80,
                              mx: 'auto',
                              mb: 2
                            }}
                          >
                            <action.icon sx={{ fontSize: 40 }} />
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                            {action.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {action.description}
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<ArrowForward />}
                            sx={{
                              bgcolor: action.color,
                              '&:hover': {
                                bgcolor: action.color,
                                opacity: 0.9
                              }
                            }}
                          >
                            ابدأ
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  </Box>
                ))}
              </Box>
            </Card>
          </motion.div>

          {/* Welcome Message */}
          <motion.div variants={itemVariants}>
            <Card sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                مرحباً بك في نظام إدارة المنتجات
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                استخدم الأزرار أعلاه للوصول السريع إلى جميع الوظائف المتاحة
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/products" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    startIcon={<Inventory />}
                    sx={{ bgcolor: 'primary.main' }}
                  >
                    عرض المنتجات
                  </Button>
                </Link>
                <Link href="/categories" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Category />}
                    sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                  >
                    عرض التصنيفات
                  </Button>
                </Link>
              </Box>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </>
  )
}
