import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: '7sundays-academy',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
    resource_type: 'auto'
  }
});

// Configure multer
const upload = multer({ storage });

// Function to upload a file to Cloudinary
export const uploadToCloudinary = async (file, folder) => {
  try {
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: `7sundays-academy/${folder}`,
      resource_type: 'auto'
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Error uploading file to Cloudinary');
  }
};

// Function to delete a file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.v2.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Error deleting file from Cloudinary');
  }
};

export default upload; 