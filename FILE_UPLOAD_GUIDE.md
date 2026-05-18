# Donor Photo Upload Implementation

## Overview
The donor form now supports direct file upload for donor photos instead of requiring image URLs. Files are automatically uploaded to Cloudinary when selected.

## How It Works

### Frontend Flow
1. User selects an image file via the file input in the donor form
2. `donor-form.js` script validates:
   - File type (must be image)
   - File size (max 5MB)
3. On validation success:
   - Shows loading spinner with "Uploading..." message
   - Sends file to `/api/files/upload` endpoint
   - Receives Cloudinary URL in response
   - Stores URL in hidden `image` input field
   - Displays image preview
   - Shows success message
4. When form is submitted, the `image` field contains the Cloudinary URL

### Backend Flow
1. File upload endpoint: `POST /api/files/upload`
   - Requires authentication (user ID from session)
   - Accepts multipart form data with `file` field
2. FileService processes:
   - Checks if file already uploaded (using MD5 hash)
   - Uploads to Cloudinary with folder structure: `{cloudinaryFolder}/{fileType}`
   - Saves file metadata to database
   - Returns Cloudinary URL
3. Frontend captures URL and includes in donor form submission

### File Structure
- **Frontend**: `/src/public/js/donor-form.js` - Handles file selection and upload
- **Form Partial**: `/src/views/partials/donor-form.ejs` - Form inputs and preview UI
- **Pages**: 
  - `/src/views/pages/add-donors.ejs` - Includes donor-form.js script
  - `/src/views/pages/edit-donors.ejs` - Includes donor-form.js script
- **Backend**: 
  - `/src/modules/files/controller/FileController.ts` - Upload handler
  - `/src/modules/files/services/FileService.ts` - Upload logic
  - `/src/modules/blood-donation/models/donor.model.ts` - Image field storage

## Configuration

### Cloudinary Setup
Environment variables in `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### File Constraints
- **Max File Size**: 5MB
- **Allowed Types**: All image formats (image/*)
- **Accepted MIME Types**: Handled via MIMETOFILETYPE mapping in config/constants

## Usage

### Adding a Donor
1. Navigate to `/donors/add`
2. Fill in donor information
3. Click on "Donor Photo" section
4. Select an image file
5. Wait for upload confirmation (green success message)
6. Image preview will display
7. Fill remaining fields
8. Click "Save Donor" - image URL is automatically included

### Editing a Donor
1. Navigate to `/donors/:id/edit`
2. Existing image displays in preview
3. Can replace by selecting a new file
4. Upload and confirm
5. Click "Update Donor" - new image URL is saved

## API Response Format

### Successful Upload (200)
```json
{
  "success": true,
  "message": "File Created",
  "data": [
    {
      "userId": "user_id",
      "name": "photo.jpg",
      "uniqueId": "abc123def456",
      "size": 102400,
      "type": "image",
      "url": "https://res.cloudinary.com/...",
      "format": "jpg",
      "width": 1280,
      "height": 720,
      "metadata": { ... }
    }
  ]
}
```

### Error Response (400/422)
```json
{
  "success": false,
  "message": "Upload failed: File validation error",
  "data": null
}
```

## Error Handling

### Client-Side
- **Invalid file type**: Alert and clear selection
- **File too large**: Alert and clear selection
- **Upload failure**: Shows error message in red for 5 seconds

### Server-Side
- File validation via FileValidator
- Cloudinary upload errors caught and logged
- Returns error response with message

## Future Enhancements
- Image cropping before upload
- Multiple image support
- Drag-and-drop upload
- Image optimization/compression
- Batch photo updates
