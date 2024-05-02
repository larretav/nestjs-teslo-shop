import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { fileFilter, fileNamer } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {

  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) { }

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, // Controlar la respuesta en lugar de que lo haga NestJS
    @Param('imageName') imageName: string
  ) {
    const path = this.filesService.getStaticProductImage(imageName)

    return res.sendFile(path)
  }


  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter,
    // limits: 1000,
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadImageProduct(@UploadedFile() file: Express.Multer.File) {

    if (!file) throw new BadRequestException('Asegurate de que el archivo sea una imagen');

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return { secureUrl }
  }

}
