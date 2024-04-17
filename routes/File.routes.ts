import { Router } from 'express';
import { AuthenticateUserMiddleware } from '../src/middlewares';
import {
  FileDeleteController,
  FileDownloadController,
  FileUpdateController,
  FileUploadController,
  GetFileByIdController,
  GetFileListController,
} from '../src/controllers/file';

function nestedRoutes(path: string, configure: (router: Router) => void) {
  const router = Router({ mergeParams: true });
  router.use(path, router);
  configure(router);
  return router;
}

export const FileRoutes = nestedRoutes('/file', file => {
  file.use(AuthenticateUserMiddleware);
  file.post('/upload', FileUploadController);
  file.put('/upload/:id', FileUpdateController);
  file.get('/list', GetFileListController);
  file.get('/:id', GetFileByIdController);
  file.get('/download/:id', FileDownloadController);
  file.delete('/:id', FileDeleteController);
});
