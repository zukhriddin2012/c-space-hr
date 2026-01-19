import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase';

const BUCKET_NAME = 'employee-documents';

export interface UploadResult {
  success: boolean;
  path?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Generate a storage path for an employee document
 * Format: {employee_id}/{document_type}/{timestamp}_{filename}
 */
export function generateDocumentPath(
  employeeId: string,
  documentType: string,
  fileName: string
): string {
  // Clean filename - remove special chars, keep extension
  const cleanName = fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');

  // Add timestamp to prevent overwriting
  const timestamp = Date.now();

  return `${employeeId}/${documentType}/${timestamp}_${cleanName}`;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadDocument(
  file: Buffer | Blob | File,
  path: string,
  mimeType: string
): Promise<UploadResult> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    return { success: false, error: 'Storage not configured' };
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        contentType: mimeType,
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, path: data.path };
  } catch (error) {
    console.error('Storage upload exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteDocument(path: string): Promise<DeleteResult> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    return { success: false, error: 'Storage not configured' };
  }

  try {
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Storage delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Storage delete exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Get a signed URL for downloading a private file
 * URL expires after the specified duration (default 1 hour)
 */
export async function getSignedDownloadUrl(
  path: string,
  expiresIn: number = 3600
): Promise<{ url?: string; error?: string }> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    return { error: 'Storage not configured' };
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return { error: error.message };
    }

    return { url: data.signedUrl };
  } catch (error) {
    console.error('Signed URL exception:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to generate download URL',
    };
  }
}

/**
 * Get the bucket name (for creating the bucket manually if needed)
 */
export function getStorageBucketName(): string {
  return BUCKET_NAME;
}

/**
 * Check if storage is available
 */
export function isStorageConfigured(): boolean {
  return isSupabaseAdminConfigured();
}
