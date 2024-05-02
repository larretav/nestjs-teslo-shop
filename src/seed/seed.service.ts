import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
  ) { }


  async runSeed() {
    await this.insertNewProducts();

    return 'Seed excecuted'
  }

  private async insertNewProducts() {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const productsPromises = products.map(product => this.productsService.create(product))

    await Promise.all(productsPromises);

    return true;
  }
}
