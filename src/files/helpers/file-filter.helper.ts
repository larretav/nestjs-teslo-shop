
export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

  if (!file) return callback(new Error('El archivo está vacío'), false)

  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];

  if (!validExtensions.includes(fileExtension)) return callback(null, false)
  
  callback(null, true)
}