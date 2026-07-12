const { createClient } = require('@supabase/supabase-js');
const supa = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY) : null;
const BUCKET = 'evidence';

async function uploadFile(buffer, filename, mimetype) {
  if (!supa) throw new Error('Supabase storage not configured.');
  const { error } = await supa.storage.from(BUCKET).upload(filename, buffer, { contentType: mimetype, upsert: false });
  if (error) throw error;
  return supa.storage.from(BUCKET).getPublicUrl(filename).data.publicUrl;
}
module.exports = { uploadFile };