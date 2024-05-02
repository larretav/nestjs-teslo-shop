import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger();

  constructor(

    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

  ) { }


  async create(createProductDto: CreateProductDto) {
    try {

      const { images = [], ...restProductDto } = createProductDto;

      const product = this.productsRepository.create({
        ...restProductDto,
        images: images.map(url => this.productImageRepository.create({ url }))
      })
      await this.productsRepository.save(product)

      return { ...product, images };

    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 1 } = paginationDto;
    const products = await this.productsRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    });

    return products.map(product => ({
      ...product,
      images: product.images.map(img => img.url)
    }))
  }

  async findOne(term: string) {

    let product: Product;

    if (isUUID(term))
      return await this.productsRepository.findOneBy({ id: term });

    const queryBuilder = this.productsRepository.createQueryBuilder('prod');

    product = await queryBuilder.where('LOWER(title)=:title OR slug=:slug', {
      title: term.toLowerCase(),
      slug: term.toLowerCase()
    })
      .leftJoinAndSelect('prod.images', 'prodImages')
      .getOne();


    if (!product)
      throw new NotFoundException(`El producto: "${term}" no se encontró`)

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...restProduct } = await this.findOne(term);
    return {
      ...restProduct,
      images: images.map(img => img.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...restProductDto } = updateProductDto

    const product = await this.productsRepository.preload({ id, ...restProductDto })

    if (!product)
      throw new NotFoundException(`El producto con el id: "${id}" no se encontró`)

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map(url => this.productImageRepository.create({ url }))
      }

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id)


      // await this.productsRepository.save(product);
      // return product;

    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleExceptions(error)
    }

    return product;
  }

  async remove(id: string) {
    const product = await this.findOne(id)
    await this.productsRepository.remove(product);
  }



  handleExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);


    this.logger.error(error);
    // console.log(error);
    throw new InternalServerErrorException('Ayuda we :\'v')
  }

  async deleteAllProducts() {
    const query = this.productsRepository.createQueryBuilder('product')
    
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleExceptions(error)
    }
  }
}
