export const UPLOAD_CONSTRAINTS = {
  MAX_ITEMS: 10,
  MAX_VIDEO_DURATION: 600,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
  },
  ACCEPTED_VIDEO_TYPES: {
    'video/*': ['.mp4', '.mov', '.avi'],
  },
};
