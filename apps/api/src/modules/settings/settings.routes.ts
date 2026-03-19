import { Router, IRouter } from 'express'
import multer from 'multer'
import path from 'path'
import { authMiddleware } from '../../middlewares/auth.middleware'
import * as ctrl from './settings.controller'

const storage = multer.diskStorage({
  destination: path.join(process.cwd(), 'uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `logo-${Date.now()}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    cb(null, /^image\/(png|jpeg|jpg|webp|svg\+xml)$/.test(file.mimetype))
  },
})

const router: IRouter = Router()
router.use(authMiddleware)

router.get('/', ctrl.getSettings)
router.put('/', ctrl.updateSettings)
router.post('/logo', upload.single('logo'), ctrl.uploadLogo)

export default router
