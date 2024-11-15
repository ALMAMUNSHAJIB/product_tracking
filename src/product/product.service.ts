import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(@Inject('KnexConnection') private readonly knex: Knex) { }

  async addProduct(createProductDto: CreateProductDto) {
    const [productId] = await this.knex('products')
      .insert(createProductDto)
      .returning('id');
    return productId;
  }

  // async recordView(productId: number, userId?: number, ipAddress?: string) {
  //   const tenMinutesAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString(); // Use ISO string for date consistency
  //   try {
  //     const existingView = await this.knex('product_views')
  //       .where('product_id', productId)
  //       .andWhere(function () {
  //         if (userId) {
  //           this.where('user_id', userId);
  //         } else {
  //           this.where('ip_address', ipAddress);
  //         }
  //       })
  //       .andWhere('viewed_at', '>=', tenMinutesAgo)
  //       .first();

  //     if (!existingView) {
  //       await this.knex.transaction(async (trx) => {
  //         await trx('product_views').insert({
  //           product_id: productId,
  //           user_id: userId || null,
  //           ip_address: ipAddress || null,
  //           viewed_at: new Date().toISOString(), // Ensure ISO format
  //         });

  //         // Increment the total views for the product
  //         await trx('products')
  //           .where('id', productId)
  //           .increment('total_views', 1);
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error recording view:', error);
  //     throw error;
  //   }
  // }

  async recordView(productId: number, userId?: number, ipAddress?: string) {
    try {
      await this.knex.transaction(async (trx) => {
        await trx('product_views').insert({
          product_id: productId,
          user_id: userId || null,
          ip_address: ipAddress || null,
          viewed_at: new Date().toISOString(), 
        });
        await trx('products')
          .where('id', productId)
          .increment('total_views', 1);
      });
    } catch (error) {
      console.error('Error recording view:', error);
      throw error;
    }
  }


  async recordViewAsGuest(productId: number, ipAddress: string) {
    await this.recordView(productId, null, ipAddress);
  }

  async getCurrentViewerCount(productId: number): Promise<number> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    try {
      const totalVisitsResult = await this.knex('product_views')
        .where('product_id', productId)
        .andWhere('viewed_at', '>=', tenMinutesAgo)
        .count('* as totalCount')
        .first();
      const totalCount = Number(totalVisitsResult?.totalCount || 0);
      return totalCount;
    } catch (error) {
      console.error('Error calculating current viewer count:', error);
      throw error;
    }
  }

  async getTotalViewerCounts(): Promise<any[]> {
    return this.knex('product_views')
      .select('products.name as productName', 'product_views.product_id')
      .count('* as totalViewerCount') 
      .innerJoin('products', 'product_views.product_id', 'products.id')
      .groupBy('product_views.product_id', 'products.name')
      .then((results) => {
        return results.map(result => ({
          productName: result.productName,
          totalViewerCount: Number(result.totalViewerCount) || 0, 
        }));
      });
  }



  async getTotalViewsCount(productId: number): Promise<number> {
    try {
      const totalViewsResult = await this.knex('product_views')
        .where('product_id', productId)
        .count('* as total_views');

      const totalViews = Number(totalViewsResult[0]?.total_views || 0);
      return totalViews;
    } catch (error) {
      console.error('Error getting total views count:', error);
      throw error;
    }
  }

  async getVisitorCountByFilter(productId: number, filter: 'day' | 'week'): Promise<number> {
    const now = new Date();
    let filterDate: Date;

    if (filter === 'day') {
      filterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
    } else if (filter === 'week') {
      filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    } else {
      throw new Error('Invalid filter');
    }

    const filterDateString = filterDate.toISOString();

    const totalVisitCount = await this.knex('product_views')
      .where('product_id', productId)
      .andWhere('viewed_at', '>=', filterDateString)
      .count('* as visitCount') // Count every visit
      .first();

    return Number(totalVisitCount?.visitCount || 0); // Ensure numeric result
  }


  async getTotalVisitorCountByFilterWithSum(
    filter: 'day' | 'week'
  ): Promise<{
    products: { productId: number; productName: string; visitorCount: number }[];
    totalVisitorCount: number;
  }> {
    const now = new Date();
    let filterDate: Date;

    if (filter === 'day') {
      filterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
    } else if (filter === 'week') {
      filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    } else {
      throw new Error('Invalid filter');
    }

    const filterDateString = filterDate.toISOString();
    const productVisitorCounts = await this.knex('product_views')
      .select('products.id as productId', 'products.name as productName')
      .count('* as visitorCount') 
      .innerJoin('products', 'product_views.product_id', 'products.id')
      .where('viewed_at', '>=', filterDateString)
      .groupBy('products.id', 'products.name');

    const totalVisitorCount = productVisitorCounts.reduce(
      (sum, row) => sum + Number(row.visitorCount || 0),
      0
    );
    const products = productVisitorCounts.map((row) => ({
      productId: row.productId,
      productName: row.productName,
      visitorCount: Number(row.visitorCount || 0),
    }));

    return { products, totalVisitorCount };
  }



}
