import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request } from 'express';
import { create } from 'domain';
import { RecordViewDto } from './dto/recored.view.dto';

@Controller('api/product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post('add')
  async addProduct(@Body() createProductDto: CreateProductDto) {
    const productId = await this.productService.addProduct(createProductDto);
    return { message: 'Product added', productId };
  }

  @Post(':productId/view')
  async recordView(
    @Param('productId') productId: number,
    @Body() recordViewDto: RecordViewDto,
    @Req() req: Request,
  ) {
    const { userId } = recordViewDto;
    if (!userId) {
      const ipAddress = req.ip;
      await this.productService.recordViewAsGuest(productId, ipAddress);
    } else {
      await this.productService.recordView(productId, userId);
    }
    return { message: 'View recorded' };
  }

  @Get(':productId/current-viewers')
  async getCurrentViewerCount(@Param('productId') productId: number) {
    const count = await this.productService.getCurrentViewerCount(productId);
    return { productId, currentViewerCount: count };
  }

  @Get(':productId/total-views')
  async getTotalViews(@Param('productId') productId: number) {
    try {
      const totalViews = await this.productService.getTotalViewsCount(productId);
      return { totalViews };
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Error fetching total views count',
      };
    }
  }

  @Get('admin/viewer-counts')
  async getTotalViewerCounts() {
    const viewerCounts = await this.productService.getTotalViewerCounts();
    return viewerCounts;
  }

  @Get(':productId/visitor-count')
  async getVisitorCount(
    @Param('productId') productId: number,
    @Query('filter') filter: 'day' | 'week'
  ) {
    if (!['day', 'week'].includes(filter)) {
      throw new BadRequestException('Invalid filter. Use "day" or "week".');
    }
    const count = await this.productService.getVisitorCountByFilter(productId, filter);
    return {
      message: `Visitor count for the last ${filter === 'day' ? '24 hours' : '7 days'}`,
      data: {
        filter,
        count,
      },
    };
  }
  
  @Get('visitor-count')
  async getTotalVisitorCounts(
    @Query('filter') filter: 'day' | 'week'
  ) {
    if (!['day', 'week'].includes(filter)) {
      throw new BadRequestException('Invalid filter. Use "day" or "week".');
    }

    const { products, totalVisitorCount } = await this.productService.getTotalVisitorCountByFilterWithSum(filter);

    return {
      message: `Total visitor count for all products in the last ${filter === 'day' ? '24 hours' : '7 days'}`,
      data: {
        totalVisitorCount,
        products,
      },
    };
  }

}
