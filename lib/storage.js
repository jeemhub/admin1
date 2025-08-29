import { supabase } from './supabaseClient'

export async function uploadToPhotoBucket(file) {
  console.log('Uploading file:', file)
  console.log('File name:', file.name)
  console.log('File type:', file.type)
  console.log('File size:', file.size)
  
  if (!file || !file.name) {
    throw new Error('Invalid file: missing file or file name')
  }
  
  // Clean filename - remove spaces and special characters
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filePath = `images/${Date.now()}_${cleanFileName}`
  console.log('File path:', filePath)
  
  const { data, error: uploadError } = await supabase
    .storage
    .from('photo')
    .upload(filePath, file)
    
  if (uploadError) {
    console.error('Upload error:', uploadError)
    throw uploadError
  }
  
  console.log('Upload successful, data:', data)

  const { data: urlData, error: urlError } = supabase
    .storage
    .from('photo')
    .getPublicUrl(data.path)
    
  if (urlError) {
    console.error('URL error:', urlError)
    throw urlError
  }
  
  console.log('Public URL:', urlData.publicUrl)
  return urlData.publicUrl
}