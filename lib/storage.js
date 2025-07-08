import { supabase } from './supabaseClient'

export async function uploadToPhotoBucket(file) {
  const filePath = `images/${Date.now()}_${file.name}`
  const { data, error: uploadError } = await supabase
    .storage
    .from('photo')
    .upload(filePath, file)
  if (uploadError) throw uploadError

  const { data: urlData, error: urlError } = supabase
    .storage
    .from('photo')
    .getPublicUrl(data.path)
  if (urlError) throw urlError

  return urlData.publicUrl
}